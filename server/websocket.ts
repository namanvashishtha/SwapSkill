import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { storage } from './storage.js';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  username?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: 'message' | 'match_request' | 'match_response' | 'notification' | 'typing' | 'ping' | 'pong';
  data?: any;
  matchId?: number;
  targetUserId?: number;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, AuthenticatedWebSocket> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    
    console.log('🔌 WebSocket server initialized');
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // Basic verification - in production, you might want to verify the session here
    return true;
  }

  private handleConnection(ws: AuthenticatedWebSocket, request: IncomingMessage) {
    console.log('🔗 New WebSocket connection');
    
    ws.isAlive = true;
    
    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error) {
        console.error('❌ Error handling WebSocket message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        this.clients.delete(ws.userId);
        console.log(`🔌 User ${ws.userId} disconnected`);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Send welcome message
    this.send(ws, {
      type: 'notification',
      data: {
        message: 'Connected to SkillSwap real-time service',
        timestamp: new Date().toISOString()
      }
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;

      case 'auth':
        await this.handleAuth(ws, message.data);
        break;

      case 'message':
        await this.handleChatMessage(ws, message);
        break;

      case 'match_request':
        await this.handleMatchRequest(ws, message);
        break;

      case 'match_response':
        await this.handleMatchResponse(ws, message);
        break;

      case 'typing':
        await this.handleTyping(ws, message);
        break;

      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, authData: any) {
    try {
      // In a real implementation, you'd verify the session/token here
      // For now, we'll accept the userId from the client
      if (authData && authData.userId) {
        ws.userId = authData.userId;
        ws.username = authData.username;
        this.clients.set(authData.userId, ws);
        
        console.log(`✅ User ${authData.userId} (${authData.username}) authenticated via WebSocket`);
        
        this.send(ws, {
          type: 'notification',
          data: {
            message: 'Authentication successful',
            userId: authData.userId
          }
        });

        // Send any pending notifications
        await this.sendPendingNotifications(authData.userId);
      } else {
        this.sendError(ws, 'Invalid authentication data');
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      this.sendError(ws, 'Authentication failed');
    }
  }

  private async handleChatMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!ws.userId || !message.matchId || !message.data?.message) {
      this.sendError(ws, 'Invalid message data');
      return;
    }

    try {
      // Verify user is part of the match
      const match = await storage.getMatch(message.matchId);
      if (!match || (match.fromUserId !== ws.userId && match.toUserId !== ws.userId)) {
        this.sendError(ws, 'Unauthorized to send message in this match');
        return;
      }

      if (match.status !== 'accepted') {
        this.sendError(ws, 'Can only send messages in accepted matches');
        return;
      }

      // Save message to database
      const newMessage = {
        id: await storage.getNextId(),
        matchId: message.matchId,
        senderId: ws.userId,
        message: message.data.message.trim(),
        createdAt: new Date()
      };

      const savedMessage = await storage.saveMessage(newMessage);

      // Send to both users in the match
      const otherUserId = match.fromUserId === ws.userId ? match.toUserId : match.fromUserId;
      
      // Send to sender (confirmation)
      this.send(ws, {
        type: 'message',
        data: {
          ...savedMessage,
          status: 'sent'
        }
      });

      // Send to recipient
      const recipientWs = this.clients.get(otherUserId);
      if (recipientWs) {
        this.send(recipientWs, {
          type: 'message',
          data: {
            ...savedMessage,
            status: 'received'
          }
        });
      }

      // Create notification for offline user
      const notification = {
        id: await storage.getNextId(),
        userId: otherUserId,
        type: 'message' as const,
        title: 'New Message',
        message: `You have a new message from ${ws.username || 'someone'}!`,
        isRead: false,
        relatedUserId: ws.userId,
        relatedMatchId: message.matchId,
        createdAt: new Date()
      };

      await storage.saveNotification(notification);

      // Send notification if user is online
      if (recipientWs) {
        this.send(recipientWs, {
          type: 'notification',
          data: notification
        });
      }

      console.log(`💬 Message sent from user ${ws.userId} to user ${otherUserId} in match ${message.matchId}`);

    } catch (error) {
      console.error('❌ Error handling chat message:', error);
      this.sendError(ws, 'Failed to send message');
    }
  }

  private async handleMatchRequest(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!ws.userId || !message.targetUserId) {
      this.sendError(ws, 'Invalid match request data');
      return;
    }

    try {
      // Create match request
      const newMatch = {
        id: await storage.getNextId(),
        fromUserId: ws.userId,
        toUserId: message.targetUserId,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedMatch = await storage.saveMatch(newMatch);

      // Create notification for target user
      const notification = {
        id: await storage.getNextId(),
        userId: message.targetUserId,
        type: 'match_request' as const,
        title: 'New Match Request',
        message: `${ws.username || 'Someone'} wants to match with you!`,
        isRead: false,
        relatedUserId: ws.userId,
        relatedMatchId: savedMatch.id,
        createdAt: new Date()
      };

      await storage.saveNotification(notification);

      // Send to target user if online
      const targetWs = this.clients.get(message.targetUserId);
      if (targetWs) {
        this.send(targetWs, {
          type: 'match_request',
          data: {
            match: savedMatch,
            notification: notification
          }
        });
      }

      // Confirm to sender
      this.send(ws, {
        type: 'notification',
        data: {
          message: 'Match request sent successfully',
          matchId: savedMatch.id
        }
      });

      console.log(`🤝 Match request sent from user ${ws.userId} to user ${message.targetUserId}`);

    } catch (error) {
      console.error('❌ Error handling match request:', error);
      this.sendError(ws, 'Failed to send match request');
    }
  }

  private async handleMatchResponse(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!ws.userId || !message.matchId || !message.data?.response) {
      this.sendError(ws, 'Invalid match response data');
      return;
    }

    try {
      const match = await storage.getMatch(message.matchId);
      if (!match || match.toUserId !== ws.userId) {
        this.sendError(ws, 'Unauthorized to respond to this match');
        return;
      }

      if (match.status !== 'pending') {
        this.sendError(ws, 'Match has already been responded to');
        return;
      }

      // Update match status
      const updatedMatch = await storage.updateMatch(message.matchId, {
        status: message.data.response,
        updatedAt: new Date()
      });

      // Create notification for the requester
      const notificationMessage = message.data.response === 'accepted' 
        ? `${ws.username || 'Someone'} accepted your match request!`
        : `${ws.username || 'Someone'} declined your match request.`;

      const notification = {
        id: await storage.getNextId(),
        userId: match.fromUserId,
        type: 'match_accepted' as const,
        title: message.data.response === 'accepted' ? 'Match Accepted!' : 'Match Declined',
        message: notificationMessage,
        isRead: false,
        relatedUserId: ws.userId,
        relatedMatchId: message.matchId,
        createdAt: new Date()
      };

      await storage.saveNotification(notification);

      // Send to requester if online
      const requesterWs = this.clients.get(match.fromUserId);
      if (requesterWs) {
        this.send(requesterWs, {
          type: 'match_response',
          data: {
            match: updatedMatch,
            notification: notification,
            response: message.data.response
          }
        });
      }

      // Confirm to responder
      this.send(ws, {
        type: 'notification',
        data: {
          message: `Match ${message.data.response} successfully`,
          matchId: message.matchId
        }
      });

      console.log(`🤝 Match ${message.matchId} ${message.data.response} by user ${ws.userId}`);

    } catch (error) {
      console.error('❌ Error handling match response:', error);
      this.sendError(ws, 'Failed to respond to match');
    }
  }

  private async handleTyping(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (!ws.userId || !message.matchId) {
      return;
    }

    try {
      const match = await storage.getMatch(message.matchId);
      if (!match || (match.fromUserId !== ws.userId && match.toUserId !== ws.userId)) {
        return;
      }

      const otherUserId = match.fromUserId === ws.userId ? match.toUserId : match.fromUserId;
      const otherWs = this.clients.get(otherUserId);

      if (otherWs) {
        this.send(otherWs, {
          type: 'typing',
          data: {
            matchId: message.matchId,
            userId: ws.userId,
            username: ws.username,
            isTyping: message.data?.isTyping || false
          }
        });
      }
    } catch (error) {
      console.error('❌ Error handling typing indicator:', error);
    }
  }

  private async sendPendingNotifications(userId: number) {
    try {
      const notifications = await storage.getNotifications({ 
        userId, 
        isRead: false 
      });

      if (notifications.length > 0) {
        const ws = this.clients.get(userId);
        if (ws) {
          this.send(ws, {
            type: 'notification',
            data: {
              type: 'pending_notifications',
              notifications: notifications
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Error sending pending notifications:', error);
    }
  }

  private send(ws: AuthenticatedWebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: AuthenticatedWebSocket, error: string) {
    this.send(ws, {
      type: 'error',
      data: { message: error }
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (ws.isAlive === false) {
          if (ws.userId) {
            this.clients.delete(ws.userId);
          }
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  public broadcastToUser(userId: number, message: any) {
    const ws = this.clients.get(userId);
    if (ws) {
      this.send(ws, message);
      return true;
    }
    return false;
  }

  public getConnectedUsers(): number[] {
    return Array.from(this.clients.keys());
  }

  public isUserOnline(userId: number): boolean {
    return this.clients.has(userId);
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}

export default WebSocketManager;