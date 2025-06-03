import React, { createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  deleteNotification: (notificationId: number) => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        return true;
      } else if (response.status === 404) {
        // Notification not found - this is actually success (already deleted)
        return true;
      } else {
        // Try to get error message from response
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
        return true;
      } else if (response.status === 404) {
        // No notifications found - this is actually success
        return true;
      } else {
        // Try to get error message from response
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