import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';

interface WebSocketMessage {
  type: 'message' | 'match_request' | 'match_response' | 'notification' | 'typing' | 'ping' | 'pong' | 'error';
  data?: any;
  matchId?: number;
  targetUserId?: number;
}

interface ChatMessage {
  id: number;
  matchId: number;
  senderId: number;
  message: string;
  createdAt: string;
  status?: 'sent' | 'received';
}

interface TypingUser {
  userId: number;
  username: string;
  matchId: number;
}

export function useChat() {
  const { user } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!user || ws?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      // Authenticate
      newWs.send(JSON.stringify({
        type: 'auth',
        data: {
          userId: user.id,
          username: user.username
        }
      }));
    };

    newWs.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    newWs.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };

    newWs.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
    };

    setWs(newWs);
  }, [user, ws?.readyState]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 Received WebSocket message:', message.type, message.data);

    switch (message.type) {
      case 'message':
        if (message.data) {
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg.id === message.data.id);
            if (exists) return prev;
            
            return [...prev, message.data].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        }
        break;

      case 'notification':
        if (message.data) {
          if (message.data.type === 'pending_notifications') {
            setNotifications(prev => [...prev, ...message.data.notifications]);
          } else {
            setNotifications(prev => [message.data, ...prev]);
          }
        }
        break;

      case 'match_request':
        if (message.data?.notification) {
          setNotifications(prev => [message.data.notification, ...prev]);
        }
        break;

      case 'match_response':
        if (message.data?.notification) {
          setNotifications(prev => [message.data.notification, ...prev]);
        }
        break;

      case 'typing':
        if (message.data) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => 
              u.userId !== message.data.userId || u.matchId !== message.data.matchId
            );
            
            if (message.data.isTyping) {
              return [...filtered, {
                userId: message.data.userId,
                username: message.data.username,
                matchId: message.data.matchId
              }];
            }
            
            return filtered;
          });
        }
        break;

      case 'error':
        console.error('❌ WebSocket server error:', message.data?.message);
        break;

      case 'pong':
        // Handle pong response
        break;

      default:
        console.log('🤷 Unknown WebSocket message type:', message.type);
    }
  }, []);

  const sendMessage = useCallback((matchId: number, messageText: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      return false;
    }

    ws.send(JSON.stringify({
      type: 'message',
      matchId,
      data: { message: messageText }
    }));

    return true;
  }, [ws]);

  const sendMatchRequest = useCallback((targetUserId: number) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      return false;
    }

    ws.send(JSON.stringify({
      type: 'match_request',
      targetUserId
    }));

    return true;
  }, [ws]);

  const respondToMatch = useCallback((matchId: number, response: 'accepted' | 'rejected') => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      return false;
    }

    ws.send(JSON.stringify({
      type: 'match_response',
      matchId,
      data: { response }
    }));

    return true;
  }, [ws]);

  const sendTypingIndicator = useCallback((matchId: number, isTyping: boolean) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    ws.send(JSON.stringify({
      type: 'typing',
      matchId,
      data: { isTyping }
    }));

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'typing',
          matchId,
          data: { isTyping: false }
        }));
      }, 3000);
    }
  }, [ws]);

  const getMessagesForMatch = useCallback((matchId: number) => {
    return messages.filter(msg => msg.matchId === matchId);
  }, [messages]);

  const getTypingUsersForMatch = useCallback((matchId: number) => {
    return typingUsers.filter(user => user.matchId === matchId);
  }, [typingUsers]);

  const resetChatCounts = useCallback(() => {
    // Reset notification counts or any other chat-related counts
    console.log('🔄 Resetting chat counts');
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  // Connect when user is available
  useEffect(() => {
    if (user && !ws) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, []);

  return {
    // Connection status
    isConnected,
    connectionStatus,
    
    // Messaging
    messages,
    sendMessage,
    getMessagesForMatch,
    
    // Matches
    sendMatchRequest,
    respondToMatch,
    
    // Notifications
    notifications,
    clearNotifications,
    markNotificationAsRead,
    
    // Typing indicators
    sendTypingIndicator,
    getTypingUsersForMatch,
    
    // Utility
    resetChatCounts,
    connect
  };
}
