import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedUserId?: number;
  relatedMatchId?: number;
  relatedSessionId?: number;
  createdAt: string;
  relatedUser?: {
    id: number;
    username: string;
    fullName: string | null;
    imageUrl: string | null;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    console.log("NotificationContext: Fetching notifications...");
    fetchNotifications();
    const interval = setInterval(() => {
      console.log("NotificationContext: Polling notifications...");
      fetchNotifications();
    }, 30000); // Poll every 30 seconds for better timeliness
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return true;
      } else if (response.status === 404) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return true;
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}`;
        }
        console.error('Failed to delete notification:', errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications([]);
        return true;
      } else if (response.status === 404) {
        setNotifications([]);
        return true;
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}`;
        }
        console.error('Failed to clear all notifications:', errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      fetchNotifications,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
