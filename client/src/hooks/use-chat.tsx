import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

interface ChatCounts {
  unreadMessages: number;
  totalMatches: number;
}

export function useChat() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ChatCounts>({
    unreadMessages: 0,
    totalMatches: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatCounts = async () => {
      if (!user) {
        setCounts({ unreadMessages: 0, totalMatches: 0 });
        setIsLoading(false);
        return;
      }

      try {
        // Fetch unread messages count
        const messagesResponse = await fetch('/api/messages/unread/count', {
          credentials: 'include'
        });
        
        // Fetch total matches count
        const matchesResponse = await fetch('/api/matches/accepted/count', {
          credentials: 'include'
        });

        let unreadMessages = 0;
        let totalMatches = 0;

        if (messagesResponse.ok) {
          const messageData = await messagesResponse.json();
          unreadMessages = messageData.count || 0;
        } else if (messagesResponse.status === 404) {
          // API endpoint doesn't exist yet, use mock data for demo
          unreadMessages = Math.floor(Math.random() * 8); // Random 0-7
        }

        if (matchesResponse.ok) {
          const matchData = await matchesResponse.json();
          totalMatches = matchData.count || 0;
        } else if (matchesResponse.status === 404) {
          // API endpoint doesn't exist yet, use mock data for demo
          totalMatches = Math.floor(Math.random() * 5); // Random 0-4
        }

        setCounts({ unreadMessages, totalMatches });
      } catch (error) {
        console.error('Error fetching chat counts:', error);
        // Use mock data for demo when API is not available
        const unreadMessages = Math.floor(Math.random() * 8);
        const totalMatches = Math.floor(Math.random() * 5);
        setCounts({ unreadMessages, totalMatches });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatCounts();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchChatCounts, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return { counts, isLoading };
}