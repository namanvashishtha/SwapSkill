import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/contexts/websocket-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, User, MessageCircle, Loader2, MoreVertical, Star, UserX } from "lucide-react";
import RatingDialog from "@/components/rating-dialog";
import SessionSchedulingDialog from "@/components/session-scheduling-dialog";
import SessionManagement from "@/components/session-management";
import SessionDetailsDialog from "@/components/session-details-dialog";
import { useLocation } from "wouter";

interface ChatMessage {
  id: number;
  matchId: number;
  senderId: number;
  message: string;
  createdAt: string;
}

interface Match {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: "accepted";
  otherUser: {
    id: number;
    username: string;
    fullName: string | null;
    imageUrl: string | null;
    skillsToTeach: string[] | null;
    skillsToLearn: string[] | null;
  };
}

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { 
    isConnected, 
    connectionStatus,
    sendMessage: sendWebSocketMessage,
    getMessagesForMatch,
    sendTypingIndicator,
    getTypingUsersForMatch
  } = useWebSocket();
  const [location] = useLocation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [unmatchConfirmation, setUnmatchConfirmation] = useState("");
  const [isUnmatching, setIsUnmatching] = useState(false);
  const [unmatchTarget, setUnmatchTarget] = useState<{ id: number; name: string } | null>(null);
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const matchIdFromUrl = urlParams.get('match');
  const sessionIdFromUrl = urlParams.get('session');

  console.log("ChatPage: URL params - matchIdFromUrl:", matchIdFromUrl, "sessionIdFromUrl:", sessionIdFromUrl);

  // Reset chat counts when page loads and ensure WebSocket connection
  useEffect(() => {
    if (user) {
      console.log('🔄 Chat page loaded for user:', user.username);
      
      // Ensure WebSocket connection is active
      if (!isConnected && connectionStatus !== 'connecting') {
        console.log('🔌 Reconnecting WebSocket from chat page');
        sendWebSocketMessage(0, ''); // This will trigger a reconnect if needed
      }
    }
  }, [user, isConnected, connectionStatus, sendWebSocketMessage]);

  // Fetch accepted matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches/accepted', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
          
          // If there's a match ID in the URL, select that match
          if (matchIdFromUrl && data.length > 0) {
            const targetMatch = data.find((match: Match) => match.id === parseInt(matchIdFromUrl));
            if (targetMatch) {
              setSelectedMatch(targetMatch);
            } else {
              // If match not found, select first match
              setSelectedMatch(data[0]);
            }
          } else if (data.length > 0 && !selectedMatch) {
            setSelectedMatch(data[0]);
          }
        } else {
          console.error('Failed to fetch matches:', response.status, response.statusText);
          toast({
            title: "Error",
            description: "Failed to load your matches. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: "Error",
          description: "Failed to load your matches. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingMatches(false);
      }
    };

    if (user) {
      fetchMatches();
    }
  }, [user, toast, matchIdFromUrl]);

  // Fetch initial messages for selected match and then use WebSocket for real-time updates
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedMatch) return;
      
      setLoadingMessages(true);
      try {
        const response = await fetch(`/api/matches/${selectedMatch.id}/messages`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error('Failed to fetch messages:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedMatch]);

  // Update messages from WebSocket
  useEffect(() => {
    if (selectedMatch) {
      const wsMessages = getMessagesForMatch(selectedMatch.id);
      if (wsMessages.length > 0) {
        setMessages(prev => {
          // Merge WebSocket messages with existing messages, avoiding duplicates
          const merged = [...prev];
          wsMessages.forEach(wsMsg => {
            if (!merged.some(msg => msg.id === wsMsg.id)) {
              merged.push(wsMsg);
            }
          });
          return merged.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    }
  }, [selectedMatch, getMessagesForMatch]);
  
  // Listen for new messages event
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      if (selectedMatch && event.detail.matchId === selectedMatch.id) {
        console.log('🔔 New message event received for match:', selectedMatch.id);
        const wsMessages = getMessagesForMatch(selectedMatch.id);
        
        // Force a re-render with the latest messages
        setMessages(prev => {
          // Merge WebSocket messages with existing messages, avoiding duplicates
          const merged = [...prev];
          let hasNewMessages = false;
          
          wsMessages.forEach(wsMsg => {
            if (!merged.some(msg => msg.id === wsMsg.id)) {
              merged.push(wsMsg);
              hasNewMessages = true;
            }
          });
          
          if (!hasNewMessages) return prev; // No changes needed
          
          console.log('💬 Adding new messages to chat view');
          return merged.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    };

    // Add event listener
    window.addEventListener('new-message', handleNewMessage as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('new-message', handleNewMessage as EventListener);
    };
  }, [selectedMatch, getMessagesForMatch]);

  // Handle session ID from URL
  useEffect(() => {
    console.log("ChatPage: Handling sessionIdFromUrl:", sessionIdFromUrl, "selectedMatch:", selectedMatch);
    if (sessionIdFromUrl && selectedMatch) {
      setSelectedSessionId(parseInt(sessionIdFromUrl));
      setSessionDetailsOpen(true);
    } else if (sessionIdFromUrl && !selectedMatch) {
      // If sessionId is present but no selectedMatch, try to fetch match and then open session details
      const fetchMatchAndOpenSession = async () => {
        try {
          const matchId = parseInt(new URLSearchParams(location.split('?')[1]).get('match') || '');
          if (!isNaN(matchId)) {
            const response = await fetch(`/api/matches/${matchId}`, { credentials: 'include' });
            if (response.ok) {
              const matchData = await response.json();
              setSelectedMatch(matchData);
              setSelectedSessionId(parseInt(sessionIdFromUrl));
              setSessionDetailsOpen(true);
            } else {
              console.error('Failed to fetch match for session:', response.statusText);
            }
          }
        } catch (error) {
          console.error('Error fetching match for session:', error);
        }
      };
      fetchMatchAndOpenSession();
    }
  }, [sessionIdFromUrl, selectedMatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || sendingMessage) return;

    setSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    // Stop typing indicator
    if (isTyping) {
      sendTypingIndicator(selectedMatch.id, false);
      setIsTyping(false);
    }

    try {
      // Try WebSocket first
      if (isConnected && sendWebSocketMessage(selectedMatch.id, messageText)) {
        console.log('✅ Message sent via WebSocket');
        
        // We don't need to manually update messages here as the WebSocket event will handle it
      } else {
        // Fallback to REST API
        console.log('📡 Falling back to REST API for message sending');
        const response = await fetch(`/api/matches/${selectedMatch.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: messageText }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const newMsg = await response.json();
        
        // Update messages with the new message from the API
        setMessages(prev => {
          const merged = [...prev];
          if (!merged.some(msg => msg.id === newMsg.id)) {
            merged.push(newMsg);
          }
          return merged.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing indicator
    if (selectedMatch && isConnected) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        sendTypingIndicator(selectedMatch.id, true);
      } else if (!value.trim() && isTyping) {
        setIsTyping(false);
        sendTypingIndicator(selectedMatch.id, false);
      }
    }
  };

  const handleUnmatchClick = (matchId: number, otherUserName: string) => {
    setUnmatchTarget({ id: matchId, name: otherUserName });
    setShowUnmatchDialog(true);
  };

  const handleUnmatch = async () => {
    if (!unmatchTarget) return;
    
    if (unmatchConfirmation.toLowerCase() !== "unmatch") {
      toast({
        title: "Error",
        description: "Please type 'unmatch' to confirm.",
        variant: "destructive",
      });
      return;
    }

    setIsUnmatching(true);
    try {
      const response = await fetch(`/api/matches/${unmatchTarget.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to unmatch');
      }

      // Remove the match from the list
      setMatches(prev => prev.filter(match => match.id !== unmatchTarget.id));
      
      // If this was the selected match, clear selection
      if (selectedMatch?.id === unmatchTarget.id) {
        setSelectedMatch(null);
        setMessages([]);
      }

      toast({
        title: "Successfully Unmatched",
        description: `You have unmatched with ${unmatchTarget.name}. Your chat history has been removed and you will no longer see each other in matches.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error unmatching:', error);
      toast({
        title: "Unmatch Failed",
        description: `Unable to unmatch with ${unmatchTarget.name}. Please check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUnmatching(false);
      setShowUnmatchDialog(false);
      setUnmatchConfirmation("");
      setUnmatchTarget(null);
    }
  };

  if (isLoading || loadingMatches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Matches</h1>
          <div className="flex items-center justify-center space-x-2">
            <p className="text-gray-600">Chat with your skill exchange partners</p>
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} title={`Real-time connection: ${connectionStatus}`} />
          </div>
          {connectionStatus !== 'connected' && (
            <p className="text-sm text-gray-500 mt-1">
              {connectionStatus === 'connecting' ? 'Connecting to real-time service...' : 
               connectionStatus === 'error' ? 'Connection error - using fallback mode' :
               'Offline - messages will sync when reconnected'}
            </p>
          )}
        </div>

        {matches.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches yet</h3>
              <p className="text-gray-500">Start matching with other users to begin chatting!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Matches List */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Matches</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedMatch?.id === match.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {match.otherUser.imageUrl ? (
                          <img
                            src={match.otherUser.imageUrl}
                            alt={match.otherUser.fullName || match.otherUser.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">
                            {match.otherUser.fullName || match.otherUser.username}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {match.otherUser.skillsToTeach?.slice(0, 2).join(", ") || "No skills listed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 bg-white flex flex-col">
              {selectedMatch ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {selectedMatch.otherUser.imageUrl ? (
                          <img
                            src={selectedMatch.otherUser.imageUrl}
                            alt={selectedMatch.otherUser.fullName || selectedMatch.otherUser.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {selectedMatch.otherUser.fullName || selectedMatch.otherUser.username}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              {selectedMatch.otherUser.skillsToTeach?.length || 0} skills to teach
                            </p>
                            {/* Connection Status */}
                            <div className={`w-2 h-2 rounded-full ${
                              connectionStatus === 'connected' ? 'bg-green-500' : 
                              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} title={`WebSocket ${connectionStatus}`} />
                          </div>
                          {/* Typing Indicator */}
                          {selectedMatch && getTypingUsersForMatch(selectedMatch.id).length > 0 && (
                            <p className="text-xs text-blue-500 italic">
                              {getTypingUsersForMatch(selectedMatch.id)[0].username} is typing...
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Schedule Session Button */}
                        <SessionSchedulingDialog
                          matchId={selectedMatch.id}
                          otherUserName={selectedMatch.otherUser.fullName || selectedMatch.otherUser.username}
                          onSessionCreated={() => setSessionRefreshKey(prev => prev + 1)}
                        />
                        
                        {/* 3-dots menu */}
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => setIsRatingDialogOpen(true)}
                            className="cursor-pointer"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Rate User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUnmatchClick(selectedMatch.id, selectedMatch.otherUser.fullName || selectedMatch.otherUser.username)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Unmatch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={sendingMessage}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Select a match to start chatting</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
      
      {/* Rating Dialog */}
      {selectedMatch && (
        <RatingDialog
          isOpen={isRatingDialogOpen}
          onClose={() => setIsRatingDialogOpen(false)}
          user={selectedMatch.otherUser}
          matchId={selectedMatch.id}
          onReviewSubmitted={() => {
            toast({
              title: "Success",
              description: "Thank you for your feedback!",
            });
          }}
        />
      )}

      {/* Unmatch Confirmation Dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Unmatch with {unmatchTarget?.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action cannot be undone. This will permanently remove your match and delete all chat history between you and {unmatchTarget?.name}.
              </p>
              <p>
                You will no longer see each other in matches and will not be able to communicate through the platform.
              </p>
              <div className="mt-4">
                <Label htmlFor="unmatch-confirmation" className="text-sm font-medium">
                  Type "unmatch" to confirm:
                </Label>
                <Input
                  id="unmatch-confirmation"
                  value={unmatchConfirmation}
                  onChange={(e) => setUnmatchConfirmation(e.target.value)}
                  placeholder="Type 'unmatch' here"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setUnmatchConfirmation("");
                setShowUnmatchDialog(false);
                setUnmatchTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnmatch}
              disabled={isUnmatching || unmatchConfirmation.toLowerCase() !== "unmatch"}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUnmatching ? "Unmatching..." : "Unmatch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        sessionId={selectedSessionId}
        open={sessionDetailsOpen}
        onOpenChange={setSessionDetailsOpen}
        onSessionUpdated={() => {
          // Refresh session data when session is updated
          setSessionRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
}