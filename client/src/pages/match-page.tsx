import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, X, MapPin, User, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { UserRating } from "@/components/ui/review";
import { useLocation } from "wouter";

interface UserProfile {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  location: string | null;
  skillsToTeach: string[] | null;
  skillsToLearn: string[] | null;
  bio?: string;
  imageUrl?: string | null;
}

interface MatchRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: "pending" | "accepted" | "rejected";
}

export default function MatchPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sendingMatch, setSendingMatch] = useState<number | null>(null);

  // Fetch all users except current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const allUsers = await response.json();
        // Filter out current user
        const otherUsers = allUsers.filter((u: UserProfile) => u.id !== user?.id);
        setUsers(otherUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user, toast]);

  // Fetch match requests
  useEffect(() => {
    const fetchMatchRequests = async () => {
      try {
        const response = await fetch('/api/matches', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const matches = await response.json();
          setMatchRequests(matches);
        }
      } catch (error) {
        console.error('Error fetching match requests:', error);
      }
    };

    if (user) {
      fetchMatchRequests();
    }
  }, [user]);

  const sendMatchRequest = async (toUserId: number) => {
    setSendingMatch(toUserId);
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toUserId }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send match request');
      }

      const newMatch = await response.json();
      setMatchRequests(prev => [...prev, newMatch]);
      
      toast({
        title: "Match Request Sent!",
        description: "Your match request has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending match request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send match request.",
        variant: "destructive",
      });
    } finally {
      setSendingMatch(null);
    }
  };

  const getMatchStatus = (userId: number) => {
    const sentRequest = matchRequests.find(
      match => match.fromUserId === user?.id && match.toUserId === userId
    );
    const receivedRequest = matchRequests.find(
      match => match.fromUserId === userId && match.toUserId === user?.id
    );

    if (sentRequest) {
      return { type: 'sent', status: sentRequest.status };
    }
    if (receivedRequest) {
      return { type: 'received', status: receivedRequest.status };
    }
    return null;
  };

  const getSkillMatches = (otherUser: UserProfile) => {
    if (!user || !otherUser.skillsToTeach || !otherUser.skillsToLearn) return { canTeach: [], canLearn: [] };
    
    const canTeach = user.skillsToTeach?.filter(skill => 
      otherUser.skillsToLearn?.some(learnSkill => 
        learnSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(learnSkill.toLowerCase())
      )
    ) || [];
    
    const canLearn = user.skillsToLearn?.filter(skill => 
      otherUser.skillsToTeach?.some(teachSkill => 
        teachSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(teachSkill.toLowerCase())
      )
    ) || [];

    return { canTeach, canLearn };
  };

  if (isLoading || loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading potential matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Your Skill Match</h1>
          <p className="text-gray-600">Connect with people who can teach you new skills or learn from your expertise</p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">Be the first to complete your profile and start matching!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((otherUser) => {
              const matchStatus = getMatchStatus(otherUser.id);
              const skillMatches = getSkillMatches(otherUser);
              const hasSkillMatch = skillMatches.canTeach.length > 0 || skillMatches.canLearn.length > 0;

              return (
                <motion.div
                  key={otherUser.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`h-full transition-all duration-300 hover:shadow-lg ${hasSkillMatch ? 'ring-2 ring-green-200 bg-green-50' : 'bg-white'}`}>
                    <CardHeader className="text-center pb-4">
                      <div className="relative mx-auto mb-4">
                        {otherUser.imageUrl ? (
                          <img
                            src={otherUser.imageUrl}
                            alt={otherUser.fullName || otherUser.username}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-md">
                            <User className="w-8 h-8 text-white" />
                          </div>
                        )}
                        {hasSkillMatch && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <CardTitle 
                        className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => navigate(`/user/${otherUser.id}`)}
                      >
                        {otherUser.fullName || otherUser.username}
                      </CardTitle>
                      {otherUser.location && (
                        <div className="flex items-center justify-center text-gray-500 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {otherUser.location}
                        </div>
                      )}
                      <div className="flex justify-center">
                        <UserRating userId={otherUser.id} size="sm" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {otherUser.bio && (
                        <p className="text-gray-600 text-sm text-center line-clamp-3">
                          {otherUser.bio}
                        </p>
                      )}

                      {/* Skill Matches */}
                      {hasSkillMatch && (
                        <div className="bg-green-100 p-3 rounded-lg">
                          <h4 className="font-semibold text-green-800 text-sm mb-2">Skill Matches!</h4>
                          {skillMatches.canTeach.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-green-700 mb-1">You can teach:</p>
                              <div className="flex flex-wrap gap-1">
                                {skillMatches.canTeach.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs bg-green-200 text-green-800">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {skillMatches.canLearn.length > 0 && (
                            <div>
                              <p className="text-xs text-green-700 mb-1">You can learn:</p>
                              <div className="flex flex-wrap gap-1">
                                {skillMatches.canLearn.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skills they teach */}
                      {otherUser.skillsToTeach && otherUser.skillsToTeach.length > 0 && (
                        <div>
                          <div className="flex items-center mb-2">
                            <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Can teach:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {otherUser.skillsToTeach.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {otherUser.skillsToTeach.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{otherUser.skillsToTeach.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills they want to learn */}
                      {otherUser.skillsToLearn && otherUser.skillsToLearn.length > 0 && (
                        <div>
                          <div className="flex items-center mb-2">
                            <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Wants to learn:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {otherUser.skillsToLearn.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {otherUser.skillsToLearn.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{otherUser.skillsToLearn.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Match button */}
                      <div className="pt-4">
                        {matchStatus ? (
                          <div className="text-center">
                            {matchStatus.type === 'sent' && (
                              <Badge variant={matchStatus.status === 'accepted' ? 'default' : 'secondary'} className="w-full py-2">
                                {matchStatus.status === 'pending' && 'Request Sent'}
                                {matchStatus.status === 'accepted' && 'Matched! 🎉'}
                                {matchStatus.status === 'rejected' && 'Request Declined'}
                              </Badge>
                            )}
                            {matchStatus.type === 'received' && (
                              <Badge variant="outline" className="w-full py-2">
                                {matchStatus.status === 'pending' && 'Wants to Match'}
                                {matchStatus.status === 'accepted' && 'Matched! 🎉'}
                                {matchStatus.status === 'rejected' && 'Request Declined'}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Button
                            onClick={() => sendMatchRequest(otherUser.id)}
                            disabled={sendingMatch === otherUser.id}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                          >
                            {sendingMatch === otherUser.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Heart className="w-4 h-4 mr-2" />
                            )}
                            {sendingMatch === otherUser.id ? 'Sending...' : 'Send Match Request'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}