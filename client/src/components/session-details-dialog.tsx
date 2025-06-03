import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  User,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
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

interface SessionDetailsDialogProps {
  sessionId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionUpdated?: () => void;
}

export default function SessionDetailsDialog({
  sessionId,
  open,
  onOpenChange,
  onSessionUpdated
}: SessionDetailsDialogProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState("30");

  useEffect(() => {
    if (sessionId && open) {
      fetchSessionDetails();
    }
  }, [sessionId, open]);

  const fetchSessionDetails = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
      } else {
        console.error('Failed to fetch session details');
        toast({
          title: "Error",
          description: "Failed to load session details. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast({
        title: "Error",
        description: "Failed to load session details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToSession = async (response: 'accepted' | 'rejected') => {
    if (!session) return;
    
    setResponding(true);
    try {
      const requestBody: any = { response };
      if (response === 'accepted') {
        requestBody.reminderMinutes = parseInt(reminderMinutes);
      }

      const res = await fetch(`/api/sessions/${session.id}/respond`, {
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

      // Refresh session details
      await fetchSessionDetails();
      onSessionUpdated?.();
    } catch (error) {
      console.error('Error responding to session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to respond to session.",
        variant: "destructive",
      });
    } finally {
      setResponding(false);
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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="text-center p-8">
            <p className="text-gray-600">Session not found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { date, time } = formatDateTime(session.scheduledDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Session Details</span>
            {getStatusBadge(session.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[500px] space-y-6 px-2">
          {/* Session Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{session.title}</h3>
            <p className="text-sm text-gray-600">
              {session.isProposer ? "Proposed by you" : `Proposed by ${session.otherUser?.fullName || session.otherUser?.username}`}
            </p>
          </div>

          {/* Other User Info */}
          {session.otherUser && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {session.otherUser.imageUrl ? (
                <img
                  src={session.otherUser.imageUrl}
                  alt={session.otherUser.fullName || session.otherUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-800">
                  {session.otherUser.fullName || session.otherUser.username}
                </h4>
                <p className="text-sm text-gray-500">
                  {session.isProposer ? "Session participant" : "Session proposer"}
                </p>
              </div>
            </div>
          )}

          {/* Session Details */}
          <div className="space-y-3">
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

            {/* Proposed Date */}
            <div className="text-xs text-gray-400">
              Proposed on {format(new Date(session.proposedAt), "MMM dd, yyyy 'at' h:mm a")}
            </div>

            {/* Response Date */}
            {session.respondedAt && (
              <div className="text-xs text-gray-400">
                Responded on {format(new Date(session.respondedAt), "MMM dd, yyyy 'at' h:mm a")}
              </div>
            )}
          </div>

          {/* Action Buttons for Proposed Sessions */}
          {session.status === 'proposed' && !session.isProposer && (
            <div className="space-y-4">
              {/* Reminder Setting */}
              <div className="space-y-2">
                <Label>If you accept, remind me before the session:</Label>
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => respondToSession('accepted')}
                  disabled={responding}
                  className="flex-1"
                >
                  {responding ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Accept
                </Button>
                <Button
                  onClick={() => respondToSession('rejected')}
                  disabled={responding}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}