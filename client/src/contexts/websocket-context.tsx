import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

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

interface Notification {
  id: number;
  userId: number;
  type: 'match_request' | 'match_accepted' | 'message' | 'session_proposal';
  title: string;
  message: string;
  isRead: boolean;
  relatedUserId?: number;
  relatedMatchId?: number;
  relatedSessionId?: number;
  createdAt: string;
}

interface WebSocketContextType {
  // Connection status
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Messaging
  messages: ChatMessage[];
  sendMessage: (matchId: number, messageText: string) => boolean;
  getMessagesForMatch: (matchId: number) => ChatMessage[];
  
  // Matches
  sendMatchRequest: (targetUserId: number) => boolean;
  respondToMatch: (matchId: number, response: 'accepted' | 'rejected') => boolean;
  
  // Notifications
  notifications: Notification[];
  clearNotifications: () => void;
  markNotificationAsRead: (notificationId: number) => void;
  unreadNotificationCount: number;
  
  // Typing indicators
  sendTypingIndicator: (matchId: number, isTyping: boolean) => void;
  getTypingUsersForMatch: (matchId: number) => TypingUser[];
  
  // Utility
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close(1000, 'Manual disconnect');
      setWs(null);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, [ws]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 Received WebSocket message:', message.type, message.data);

    switch (message.type) {
      case 'message':
        if (message.data) {
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg.id === message.data.id);
            if (exists) return prev;
            
            // Create a new array to ensure React detects the change
            const newMessages = [...prev, message.data].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            
            // Dispatch an event to notify components about new messages
            // Use requestAnimationFrame to ensure the state update has completed
            requestAnimationFrame(() => {
              window.dispatchEvent(new CustomEvent('new-message', { 
                detail: { matchId: message.data.matchId }
              }));
            });
            
            return newMessages;
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
        // Trigger a refresh of matches list
        window.dispatchEvent(new CustomEvent('matches-updated'));
        break;

      case 'match_response':
        if (message.data?.notification) {
          setNotifications(prev => [message.data.notification, ...prev]);
        }
        // Trigger a refresh of matches list
        window.dispatchEvent(new CustomEvent('matches-updated'));
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
    // This will always return the latest messages from the state
    return messages.filter(msg => msg.matchId === matchId);
  }, [messages]);

  const getTypingUsersForMatch = useCallback((matchId: number) => {
    return typingUsers.filter(user => user.matchId === matchId);
  }, [typingUsers]);

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

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // Connect when user is available
  useEffect(() => {
    if (user && (!ws || ws.readyState !== WebSocket.OPEN)) {
      console.log('🔄 Initializing WebSocket connection for user:', user.id);
      connect();
    }

    // Ping the server every 30 seconds to keep the connection alive
    const pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      clearInterval(pingInterval);
    };
  }, [user, connect, ws]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: WebSocketContextType = {
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
    unreadNotificationCount,
    
    // Typing indicators
    sendTypingIndicator,
    getTypingUsersForMatch,
    
    // Utility
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}