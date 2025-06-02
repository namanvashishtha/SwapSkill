import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X, User, Heart, MessageCircle, Loader2 } from "lucide-react";

interface Notification {
  id: number;
  userId: number;
  type: "match_request" | "match_accepted" | "message";
  title: string;
  message: string;
  isRead: boolean;
  relatedUserId?: number;
  relatedMatchId?: number;
  createdAt: string;
  relatedUser?: {
    id: number;
    username: string;
    fullName: string | null;
    imageUrl: string | null;
  };
}

interface MatchRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: "pending" | "accepted" | "rejected";
  fromUser: {
    id: number;
    username: string;
    fullName: string | null;
    imageUrl: string | null;
    skillsToTeach: string[] | null;
    skillsToLearn: string[] | null;
  };
}

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [respondingToMatch, setRespondingToMatch] = useState<number | null>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Fetch pending match requests
  useEffect(() => {
    const fetchMatchRequests = async () => {
      try {
        const response = await fetch('/api/matches/pending', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setMatchRequests(data);
        }
      } catch (error) {
        console.error('Error fetching match requests:', error);
      }
    };

    if (user) {
      fetchMatchRequests();
    }
  }, [user]);

  const respondToMatchRequest = async (matchId: number, action: 'accept' | 'reject') => {
    setRespondingToMatch(matchId);
    try {
      const response = await fetch(`/api/matches/${matchId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} match request`);
      }

      // Remove the match request from the list
      setMatchRequests(prev => prev.filter(match => match.id !== matchId));
      
      toast({
        title: action === 'accept' ? "Match Accepted!" : "Match Declined",
        description: action === 'accept' 
          ? "You can now start chatting with your new match!" 
          : "The match request has been declined.",
      });
    } catch (error) {
      console.error(`Error ${action}ing match request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} match request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setRespondingToMatch(null);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_request':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'match_accepted':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading || loadingNotifications) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your match requests and messages</p>
        </div>

        {/* Pending Match Requests */}
        {matchRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-pink-500" />
              Pending Match Requests
            </h2>
            <div className="space-y-4">
              {matchRequests.map((matchRequest) => (
                <motion.div
                  key={matchRequest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {matchRequest.fromUser.imageUrl ? (
                            <img
                              src={matchRequest.fromUser.imageUrl}
                              alt={matchRequest.fromUser.fullName || matchRequest.fromUser.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {matchRequest.fromUser.fullName || matchRequest.fromUser.username}
                            </h3>
                            <p className="text-gray-600 text-sm">wants to match with you</p>
                            {matchRequest.fromUser.skillsToTeach && matchRequest.fromUser.skillsToTeach.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {matchRequest.fromUser.skillsToTeach.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => respondToMatchRequest(matchRequest.id, 'accept')}
                            disabled={respondingToMatch === matchRequest.id}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {respondingToMatch === matchRequest.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => respondToMatchRequest(matchRequest.id, 'reject')}
                            disabled={respondingToMatch === matchRequest.id}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Notifications */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-blue-500" />
            All Notifications
          </h2>
          
          {notifications.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications yet</h3>
                <p className="text-gray-500">When you receive match requests or messages, they'll appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                      !notification.isRead ? 'ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                            {!notification.isRead && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}