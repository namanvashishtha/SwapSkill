import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, User, MessageCircle, Loader2, MoreVertical, Star } from "lucide-react";
import RatingDialog from "@/components/rating-dialog";

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
  const { resetChatCounts } = useChat();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat counts when page loads
  useEffect(() => {
    if (user) {
      resetChatCounts();
    }
  }, [user, resetChatCounts]);

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
          if (data.length > 0 && !selectedMatch) {
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
  }, [user, toast]);

  // Fetch messages for selected match
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || sendingMessage) return;

    setSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
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
      setMessages(prev => [...prev, newMsg]);
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
          <p className="text-gray-600">Chat with your skill exchange partners</p>
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
                          <p className="text-sm text-gray-500">
                            {selectedMatch.otherUser.skillsToTeach?.length || 0} skills to teach
                          </p>
                        </div>
                      </div>
                      
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
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                        onChange={(e) => setNewMessage(e.target.value)}
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
    </div>
  );
}