import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Bell,
  BellOff
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Session {
  id: number;
  matchId: number;
  proposerId: number;
  participantId: number;
  title: string;
  scheduledDate: string;
  duration: number;
  location?: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  proposedAt: string;
  respondedAt?: string;
  reminderSettings?: {
    proposerReminder?: number;
    participantReminder?: number;
  };
  otherUser?: {
    id: number;
    username: string;
    fullName: string;
    imageUrl?: string;
  };
  isProposer: boolean;
}

interface SessionManagementProps {
  matchId: number;
  currentUserId: number;
}

export default function SessionManagement({ matchId, currentUserId }: SessionManagementProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState("30");

  useEffect(() => {
    fetchSessions();
  }, [matchId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/sessions`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToSession = async (sessionId: number, response: 'accepted' | 'rejected', reminderMinutes?: number) => {
    setRespondingTo(sessionId);
    
    try {
      const requestBody: any = { response };
      if (response === 'accepted' && reminderMinutes !== undefined) {
        requestBody.reminderMinutes = reminderMinutes;
      }

      const res = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to respond to session');
      }

      toast({
        title: `Session ${response}`,
        description: `You have ${response} the session proposal.`,
      });

      fetchSessions(); // Refresh sessions
    } catch (error) {
      console.error('Error responding to session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to respond to session.",
        variant: "destructive",
      });
    } finally {
      setRespondingTo(null);
    }
  };

  const updateReminder = async (sessionId: number, reminderMinutes: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/reminder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminderMinutes }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update reminder');
      }

      toast({
        title: "Reminder Updated",
        description: `You'll be reminded ${reminderMinutes} minutes before the session.`,
      });

      fetchSessions(); // Refresh sessions
      setReminderDialogOpen(false);
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reminder.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposed: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      accepted: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;

    return (
      <Badge className={`${config?.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "MMM dd, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  const getCurrentReminder = (session: Session) => {
    const reminderField = session.isProposer ? 'proposerReminder' : 'participantReminder';
    return session.reminderSettings?.[reminderField];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No sessions scheduled yet.</p>
          <p className="text-sm">Use the "Schedule Session" button to propose a meetup!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scheduled Sessions</h3>
      
      {sessions.map((session) => {
        const { date, time } = formatDateTime(session.scheduledDate);
        const currentReminder = getCurrentReminder(session);
        
        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{session.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {session.isProposer ? "Proposed by you" : `Proposed by ${session.otherUser?.fullName || session.otherUser?.username}`}
                    </p>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Date and Time */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{time} ({session.duration} min)</span>
                  </div>
                </div>

                {/* Location */}
                {session.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{session.location}</span>
                  </div>
                )}

                {/* Reminder */}
                {session.status === 'accepted' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {currentReminder ? (
                        <>
                          <Bell className="w-4 h-4 text-green-500" />
                          <span>Reminder: {currentReminder} min before</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 text-gray-400" />
                          <span>No reminder set</span>
                        </>
                      )}
                    </div>
                    
                    <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session);
                            setReminderMinutes(currentReminder?.toString() || "30");
                          }}
                        >
                          {currentReminder ? "Change" : "Set Reminder"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Set Reminder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Remind me before the session</Label>
                            <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes before</SelectItem>
                                <SelectItem value="30">30 minutes before</SelectItem>
                                <SelectItem value="60">1 hour before</SelectItem>
                                <SelectItem value="120">2 hours before</SelectItem>
                                <SelectItem value="1440">1 day before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setReminderDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => selectedSession && updateReminder(selectedSession.id, parseInt(reminderMinutes))}
                              className="flex-1"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Action Buttons for Proposed Sessions */}
                {session.status === 'proposed' && !session.isProposer && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => respondToSession(session.id, 'accepted', 30)}
                      disabled={respondingTo === session.id}
                      className="flex-1"
                    >
                      {respondingTo === session.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToSession(session.id, 'rejected')}
                      disabled={respondingTo === session.id}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}

                {/* Status Information */}
                {session.status === 'proposed' && session.isProposer && (
                  <p className="text-sm text-gray-600 pt-2">
                    Waiting for {session.otherUser?.fullName || session.otherUser?.username} to respond...
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}