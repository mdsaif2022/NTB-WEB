import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useUser } from "./UserContext";
import { toast } from "@/components/ui/use-toast";

export interface Notification {
  id: string;
  type: "announcement" | "group_alert" | "message" | "tour_update" | "blog_update";
  title: string;
  message: string;
  sender: {
    id: number;
    name: string;
    role: "admin" | "user" | "system";
    avatar?: string;
  };
  recipientId?: number; // null for broadcast notifications
  groupId?: number; // for group-specific notifications
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string; // URL to navigate when notification is clicked
  metadata?: {
    tourId?: number;
    blogId?: number;
    bookingId?: number;
    [key: string]: any;
  };
}

export interface NotificationGroup {
  id: number;
  name: string;
  description: string;
  members: number[];
  adminIds: number[];
  createdAt: string;
  isActive: boolean;
}

export interface NotificationSettings {
  announcements: boolean;
  groupAlerts: boolean;
  messages: boolean;
  tourUpdates: boolean;
  blogUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
}

interface NotificationContextType {
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByType: (type: Notification["type"]) => Notification[];
  getUnreadNotifications: () => Notification[];
  
  // Groups
  groups: NotificationGroup[];
  createGroup: (group: Omit<NotificationGroup, "id" | "createdAt">) => void;
  joinGroup: (groupId: number, userId: number) => void;
  leaveGroup: (groupId: number, userId: number) => void;
  sendGroupAlert: (groupId: number, alert: Omit<Notification, "id" | "createdAt" | "isRead" | "type">) => void;
  
  // Settings
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Admin functions
  sendAnnouncement: (announcement: Omit<Notification, "id" | "createdAt" | "isRead" | "type">) => void;
  sendBroadcastMessage: (message: Omit<Notification, "id" | "createdAt" | "isRead" | "type">) => void;
  
  // Push notification helpers
  requestNotificationPermission: () => Promise<boolean>;
  sendPushNotification: (notification: Notification) => void;
  isNotificationSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Local storage keys
const NOTIFICATIONS_STORAGE_KEY = "echoForgeNotifications";
const NOTIFICATION_GROUPS_STORAGE_KEY = "echoForgeNotificationGroups";
const NOTIFICATION_SETTINGS_STORAGE_KEY = "echoForgeNotificationSettings";

// Helper functions for localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Error loading notifications from localStorage:", error);
  }
  return [];
};

const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Error saving notifications to localStorage:", error);
  }
};

const loadGroupsFromStorage = (): NotificationGroup[] => {
  try {
    const saved = localStorage.getItem(NOTIFICATION_GROUPS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Error loading groups from localStorage:", error);
  }
  return [];
};

const saveGroupsToStorage = (groups: NotificationGroup[]) => {
  try {
    localStorage.setItem(NOTIFICATION_GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error("Error saving groups to localStorage:", error);
  }
};

const loadSettingsFromStorage = (): NotificationSettings => {
  try {
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (error) {
    console.error("Error loading notification settings from localStorage:", error);
  }
  return {
    announcements: true,
    groupAlerts: true,
    messages: true,
    tourUpdates: true,
    blogUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  };
};

const saveSettingsToStorage = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings to localStorage:", error);
  }
};

// Mock initial data
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "announcement",
    title: "Welcome to Explore BD!",
    message: "Thank you for joining our community. We're excited to share amazing travel experiences with you!",
    sender: {
      id: 1,
      name: "Admin Team",
      role: "admin",
    },
    priority: "medium",
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "tour_update",
    title: "Tour Confirmation",
    message: "Your Sundarbans Adventure tour has been confirmed for January 25th, 2024.",
    sender: {
      id: 1,
      name: "Tour System",
      role: "system",
    },
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/profile?tab=tours",
    metadata: {
      tourId: 1,
      bookingId: 1,
    },
  },
  {
    id: "3",
    type: "group_alert",
    title: "New Group Activity",
    message: "The Dhaka Travelers group has a new meetup planned for this weekend!",
    sender: {
      id: 2,
      name: "Sarah Ahmed",
      role: "user",
    },
    groupId: 1,
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/groups/1",
  },
];

const initialGroups: NotificationGroup[] = [
  {
    id: 1,
    name: "Dhaka Travelers",
    description: "A group for travelers based in Dhaka",
    members: [1, 2, 3, 4],
    adminIds: [1, 2],
    createdAt: "2024-01-01",
    isActive: true,
  },
  {
    id: 2,
    name: "Adventure Seekers",
    description: "For those who love extreme adventures",
    members: [1, 3, 5],
    adminIds: [1],
    createdAt: "2024-01-05",
    isActive: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotificationsFromStorage());
  const [groups, setGroups] = useState<NotificationGroup[]>(() => loadGroupsFromStorage());
  const [settings, setSettings] = useState<NotificationSettings>(() => loadSettingsFromStorage());
  const [isNotificationSupported] = useState<boolean>(() => "Notification" in window);
  const { currentUser } = useUser();

  // Poll for admin notifications if admin is logged in
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) return;
    const fetchAdminNotifications = async () => {
      const res = await fetch("/api/notifications?role=admin");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          // Find new notifications not already in state
          const newNotifs = data.notifications.filter((n: any) => !notifications.some(local => local.id === n.id));
          if (newNotifs.length > 0) {
            setNotifications(prev => [...newNotifs, ...prev]);
            // Show toast for each new notification
            newNotifs.forEach((n: any) => {
              toast({ title: n.title, description: n.message });
            });
          }
        }
      }
    };
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser, notifications]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveNotificationsToStorage(notifications);
  }, [notifications]);

  useEffect(() => {
    saveGroupsToStorage(groups);
  }, [groups]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Send push notification if enabled
    if (settings.pushNotifications && isNotificationSupported) {
      sendPushNotification(newNotification);
    }

    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsByType = (type: Notification["type"]) => {
    return notifications.filter(n => n.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead);
  };

  const createGroup = (group: Omit<NotificationGroup, "id" | "createdAt">) => {
    const newGroup: NotificationGroup = {
      ...group,
      id: Math.max(...groups.map(g => g.id), 0) + 1,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const joinGroup = (groupId: number, userId: number) => {
    setGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, members: [...group.members, userId] }
          : group
      )
    );
  };

  const leaveGroup = (groupId: number, userId: number) => {
    setGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, members: group.members.filter(id => id !== userId) }
          : group
      )
    );
  };

  const sendGroupAlert = (groupId: number, alert: Omit<Notification, "id" | "createdAt" | "isRead" | "type">) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupNotification: Omit<Notification, "id" | "createdAt" | "isRead"> = {
      ...alert,
      type: "group_alert",
      groupId,
    };

    addNotification(groupNotification);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const sendAnnouncement = (announcement: Omit<Notification, "id" | "createdAt" | "isRead" | "type">) => {
    const adminAnnouncement: Omit<Notification, "id" | "createdAt" | "isRead"> = {
      ...announcement,
      type: "announcement",
    };

    addNotification(adminAnnouncement);
  };

  const sendBroadcastMessage = (message: Omit<Notification, "id" | "createdAt" | "isRead" | "type">) => {
    const broadcastMessage: Omit<Notification, "id" | "createdAt" | "isRead"> = {
      ...message,
      type: "message",
    };

    addNotification(broadcastMessage);
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const sendPushNotification = (notification: Notification) => {
    if (!isNotificationSupported || Notification.permission !== "granted") return;

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = parseInt(settings.quietHours.start.split(":")[0]) * 60 + parseInt(settings.quietHours.start.split(":")[1]);
      const endTime = parseInt(settings.quietHours.end.split(":")[0]) * 60 + parseInt(settings.quietHours.end.split(":")[1]);
      
      if (currentTime >= startTime || currentTime <= endTime) {
        return; // Don't send notifications during quiet hours
      }
    }

    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: notification.id,
      requireInteraction: notification.priority === "urgent",
    });
  };

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    groups,
    createGroup,
    joinGroup,
    leaveGroup,
    sendGroupAlert,
    settings,
    updateSettings,
    sendAnnouncement,
    sendBroadcastMessage,
    requestNotificationPermission,
    sendPushNotification,
    isNotificationSupported,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
} 