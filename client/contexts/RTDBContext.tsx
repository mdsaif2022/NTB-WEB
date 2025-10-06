import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import RTDBService, { User, Tour, Blog, Booking, Notification } from '@/lib/rtdb';

interface RTDBContextType {
  // Users
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  
  // Tours
  tours: Tour[];
  activeTours: Tour[];
  createTour: (tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTour: (tourId: string, updates: Partial<Tour>) => Promise<void>;
  deleteTour: (tourId: string) => Promise<void>;
  bulkUpdateTours: (tourIds: string[], updates: Partial<Tour>) => Promise<void>;
  bulkEnableTours: (tourIds: string[]) => Promise<void>;
  bulkDisableTours: (tourIds: string[]) => Promise<void>;
  bulkDeleteTours: (tourIds: string[]) => Promise<void>;
  
  // Blogs
  blogs: Blog[];
  publishedBlogs: Blog[];
  createBlog: (blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBlog: (blogId: string, updates: Partial<Blog>) => Promise<void>;
  deleteBlog: (blogId: string) => Promise<void>;
  
  // Bookings
  bookings: Booking[];
  userBookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  userNotifications: Notification[];
  unreadNotifications: Notification[];
  createNotification: (notificationData: Omit<Notification, 'id' | 'createdAt'>) => Promise<string>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  
  // Loading states
  loading: {
    users: boolean;
    tours: boolean;
    blogs: boolean;
    bookings: boolean;
    notifications: boolean;
  };
  
  // Error states
  error: string | null;
  setError: (error: string | null) => void;
}

const RTDBContext = createContext<RTDBContextType | undefined>(undefined);

interface RTDBProviderProps {
  children: ReactNode;
}

export const RTDBProvider: React.FC<RTDBProviderProps> = ({ children }) => {
  // State for all data
  const [users, setUsers] = useState<User[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    users: false,
    tours: false,
    blogs: false,
    bookings: false,
    notifications: false
  });
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const activeTours = tours.filter(tour => tour.isActive);
  const publishedBlogs = blogs.filter(blog => blog.isPublished);
  const userBookings = currentUser ? bookings.filter(booking => booking.userId === currentUser.id) : [];
  const userNotifications = currentUser 
    ? notifications.filter(notification => !notification.userId || notification.userId === currentUser.id)
    : [];
  const unreadNotifications = userNotifications.filter(notification => !notification.isRead);

  // Set loading state helper
  const setLoadingState = (key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // Listen to real-time data changes
  useEffect(() => {
    // Listen to users
    setLoadingState('users', true);
    const unsubscribeUsers = RTDBService.listenToData<Record<string, User>>('users', (data) => {
      if (data) {
        setUsers(Object.values(data));
      } else {
        setUsers([]);
      }
      setLoadingState('users', false);
    });

    // Listen to tours
    setLoadingState('tours', true);
    const unsubscribeTours = RTDBService.listenToData<Record<string, Tour>>('tours', (data) => {
      if (data) {
        setTours(Object.values(data));
      } else {
        setTours([]);
      }
      setLoadingState('tours', false);
    });

    // Listen to blogs
    setLoadingState('blogs', true);
    const unsubscribeBlogs = RTDBService.listenToData<Record<string, Blog>>('blogs', (data) => {
      if (data) {
        setBlogs(Object.values(data));
      } else {
        setBlogs([]);
      }
      setLoadingState('blogs', false);
    });

    // Listen to bookings
    setLoadingState('bookings', true);
    const unsubscribeBookings = RTDBService.listenToData<Record<string, Booking>>('bookings', (data) => {
      if (data) {
        setBookings(Object.values(data));
      } else {
        setBookings([]);
      }
      setLoadingState('bookings', false);
    });

    // Listen to notifications
    setLoadingState('notifications', true);
    const unsubscribeNotifications = RTDBService.listenToData<Record<string, Notification>>('notifications', (data) => {
      if (data) {
        setNotifications(Object.values(data));
      } else {
        setNotifications([]);
      }
      setLoadingState('notifications', false);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeUsers();
      unsubscribeTours();
      unsubscribeBlogs();
      unsubscribeBookings();
      unsubscribeNotifications();
    };
  }, []);

  // CRUD operations
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setError(null);
      return await RTDBService.createUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      setError(null);
      await RTDBService.updateUser(userId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    }
  };

  const createTour = async (tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setError(null);
      return await RTDBService.createTour(tourData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tour';
      setError(errorMessage);
      throw err;
    }
  };

  const updateTour = async (tourId: string, updates: Partial<Tour>): Promise<void> => {
    try {
      setError(null);
      await RTDBService.updateTour(tourId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tour';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTour = async (tourId: string): Promise<void> => {
    try {
      setError(null);
      await RTDBService.deleteData(`tours/${tourId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tour';
      setError(errorMessage);
      throw err;
    }
  };

  const bulkUpdateTours = async (tourIds: string[], updates: Partial<Tour>): Promise<void> => {
    try {
      setError(null);
      await RTDBService.bulkUpdateTours(tourIds, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update tours';
      setError(errorMessage);
      throw err;
    }
  };

  const bulkEnableTours = async (tourIds: string[]): Promise<void> => {
    try {
      setError(null);
      await RTDBService.bulkEnableTours(tourIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable tours';
      setError(errorMessage);
      throw err;
    }
  };

  const bulkDisableTours = async (tourIds: string[]): Promise<void> => {
    try {
      setError(null);
      await RTDBService.bulkDisableTours(tourIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable tours';
      setError(errorMessage);
      throw err;
    }
  };

  const bulkDeleteTours = async (tourIds: string[]): Promise<void> => {
    try {
      setError(null);
      await RTDBService.bulkDeleteTours(tourIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tours';
      setError(errorMessage);
      throw err;
    }
  };

  const createBlog = async (blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setError(null);
      return await RTDBService.createBlog(blogData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog';
      setError(errorMessage);
      throw err;
    }
  };

  const updateBlog = async (blogId: string, updates: Partial<Blog>): Promise<void> => {
    try {
      setError(null);
      await RTDBService.updateBlog(blogId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteBlog = async (blogId: string): Promise<void> => {
    try {
      setError(null);
      await RTDBService.deleteData(`blogs/${blogId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog';
      setError(errorMessage);
      throw err;
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setError(null);
      return await RTDBService.createBooking(bookingData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>): Promise<void> => {
    try {
      setError(null);
      await RTDBService.updateBooking(bookingId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteBooking = async (bookingId: string): Promise<void> => {
    try {
      setError(null);
      await RTDBService.deleteData(`bookings/${bookingId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw err;
    }
  };

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
    try {
      setError(null);
      return await RTDBService.createNotification(notificationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      setError(errorMessage);
      throw err;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      setError(null);
      await RTDBService.markNotificationAsRead(notificationId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
      throw err;
    }
  };

  const contextValue: RTDBContextType = {
    // Users
    users,
    currentUser,
    setCurrentUser,
    createUser,
    updateUser,
    
    // Tours
    tours,
    activeTours,
    createTour,
    updateTour,
    deleteTour,
    bulkUpdateTours,
    bulkEnableTours,
    bulkDisableTours,
    bulkDeleteTours,
    
    // Blogs
    blogs,
    publishedBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    
    // Bookings
    bookings,
    userBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    
    // Notifications
    notifications,
    userNotifications,
    unreadNotifications,
    createNotification,
    markNotificationAsRead,
    
    // Loading and error states
    loading,
    error,
    setError
  };

  return (
    <RTDBContext.Provider value={contextValue}>
      {children}
    </RTDBContext.Provider>
  );
};

export const useRTDB = (): RTDBContextType => {
  const context = useContext(RTDBContext);
  if (context === undefined) {
    throw new Error('useRTDB must be used within an RTDBProvider');
  }
  return context;
};

export default RTDBContext;
