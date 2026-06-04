'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications as useNotificationsHook } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { NotificationToast } from '@/components/notifications/NotificationToast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  refresh: () => void;
  handleNotificationClick: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    notifications,
    unreadCount,
    loading,
    newNotification,
    setNewNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotificationsHook();

  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    const contentId = notification.contentId;
    if (!contentId) return;

    const contentType = (notification as any).contentType || '';
    const category = (notification as any).category?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    const title = notification.title?.toLowerCase() || '';

    // Determine category
    let targetCat = 'all';
    if (contentType === 'music' || category === 'music') targetCat = 'music';
    else if (category === 'comedy' || message.includes('comedy') || title.includes('comedy')) targetCat = 'comedy';
    else if (category === 'news' || message.includes('news') || title.includes('news')) targetCat = 'news';

    // Navigation logic
    if (contentType === 'reel' || contentType === 'video' || contentId.length === 11) {
      router.push(`/video/${contentId}?cat=${targetCat}`);
    } else if (contentType === 'music') {
      router.push(`/dashboard/musicpage?id=${contentId}`);
    } else if (notification.type === 'follow') {
      router.push(`/dashboard/profile?id=${(notification as any).actorId || contentId}`);
    } else {
      // Fallback
      router.push(`/video/${contentId}?cat=${targetCat}`);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markRead: markAsRead,
        markAllRead: markAllAsRead,
        deleteNotification,
        refresh,
        handleNotificationClick,
      }}
    >
      {children}
      <NotificationToast 
        notification={newNotification} 
        onClose={() => setNewNotification(null)} 
      />
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
