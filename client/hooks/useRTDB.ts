import { useState, useEffect, useCallback } from 'react';
import { useRTDB } from '@/contexts/RTDBContext';
import RTDBService, { User, Tour, Blog, Booking, Notification } from '@/lib/rtdb';

// Hook for managing current user
export const useCurrentUser = () => {
  const { currentUser, setCurrentUser, updateUser } = useRTDB();
  
  const updateCurrentUser = useCallback(async (updates: Partial<User>) => {
    if (!currentUser) return;
    await updateUser(currentUser.id, updates);
  }, [currentUser, updateUser]);

  return {
    currentUser,
    setCurrentUser,
    updateCurrentUser,
    isLoggedIn: !!currentUser
  };
};

// Hook for managing tours
export const useTours = () => {
  const { 
    tours, 
    activeTours, 
    loading, 
    createTour, 
    updateTour, 
    deleteTour,
    bulkUpdateTours,
    bulkEnableTours,
    bulkDisableTours,
    bulkDeleteTours
  } = useRTDB();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);

  // Filter tours based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTours(tours);
    } else {
      const filtered = tours.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTours(filtered);
    }
  }, [tours, searchTerm]);

  const getTourById = useCallback((tourId: string) => {
    return tours.find(tour => tour.id === tourId);
  }, [tours]);

  const getToursByLocation = useCallback((location: string) => {
    return tours.filter(tour => 
      tour.location.toLowerCase().includes(location.toLowerCase())
    );
  }, [tours]);

  return {
    tours,
    activeTours,
    filteredTours,
    loading: loading.tours,
    searchTerm,
    setSearchTerm,
    createTour,
    updateTour,
    deleteTour,
    bulkUpdateTours,
    bulkEnableTours,
    bulkDisableTours,
    bulkDeleteTours,
    getTourById,
    getToursByLocation
  };
};

// Hook for managing blogs
export const useBlogs = () => {
  const { 
    blogs, 
    publishedBlogs, 
    loading, 
    createBlog, 
    updateBlog, 
    deleteBlog 
  } = useRTDB();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags))
  ).sort();

  // Filter blogs based on search term and tag
  useEffect(() => {
    let filtered = blogs;

    if (searchTerm.trim()) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(blog =>
        blog.tags.includes(selectedTag)
      );
    }

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedTag]);

  const getBlogById = useCallback((blogId: string) => {
    return blogs.find(blog => blog.id === blogId);
  }, [blogs]);

  const getBlogsByAuthor = useCallback((authorId: string) => {
    return blogs.filter(blog => blog.authorId === authorId);
  }, [blogs]);

  return {
    blogs,
    publishedBlogs,
    filteredBlogs,
    allTags,
    loading: loading.blogs,
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    getBlogsByAuthor
  };
};

// Hook for managing bookings
export const useBookings = () => {
  const { 
    bookings, 
    userBookings, 
    loading, 
    createBooking, 
    updateBooking, 
    deleteBooking 
  } = useRTDB();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // Filter bookings based on status
  useEffect(() => {
    if (!statusFilter) {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking => booking.status === statusFilter);
      setFilteredBookings(filtered);
    }
  }, [bookings, statusFilter]);

  const getBookingById = useCallback((bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  }, [bookings]);

  const getBookingsByStatus = useCallback((status: Booking['status']) => {
    return bookings.filter(booking => booking.status === status);
  }, [bookings]);

  const getBookingsByTour = useCallback((tourId: string) => {
    return bookings.filter(booking => booking.tourId === tourId);
  }, [bookings]);

  const getTotalRevenue = useCallback(() => {
    return bookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
      .reduce((total, booking) => total + booking.totalPrice, 0);
  }, [bookings]);

  return {
    bookings,
    userBookings,
    filteredBookings,
    loading: loading.bookings,
    statusFilter,
    setStatusFilter,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    getBookingsByStatus,
    getBookingsByTour,
    getTotalRevenue
  };
};

// Hook for managing notifications
export const useNotifications = () => {
  const { 
    notifications, 
    userNotifications, 
    unreadNotifications, 
    loading, 
    createNotification, 
    markNotificationAsRead 
  } = useRTDB();

  const [typeFilter, setTypeFilter] = useState<string>('');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  // Filter notifications based on type
  useEffect(() => {
    if (!typeFilter) {
      setFilteredNotifications(userNotifications);
    } else {
      const filtered = userNotifications.filter(notification => notification.type === typeFilter);
      setFilteredNotifications(filtered);
    }
  }, [userNotifications, typeFilter]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = unreadNotifications.map(notification => notification.id);
    await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
  }, [unreadNotifications, markNotificationAsRead]);

  const createGlobalNotification = useCallback(async (
    title: string, 
    message: string, 
    type: Notification['type'] = 'info'
  ) => {
    return await createNotification({
      title,
      message,
      type,
      isRead: false
    });
  }, [createNotification]);

  const createUserNotification = useCallback(async (
    userId: string,
    title: string, 
    message: string, 
    type: Notification['type'] = 'info'
  ) => {
    return await createNotification({
      title,
      message,
      type,
      userId,
      isRead: false
    });
  }, [createNotification]);

  return {
    notifications,
    userNotifications,
    unreadNotifications,
    filteredNotifications,
    loading: loading.notifications,
    typeFilter,
    setTypeFilter,
    createNotification,
    markNotificationAsRead,
    markAllAsRead,
    createGlobalNotification,
    createUserNotification
  };
};

// Hook for real-time data listening
export const useRealtimeData = <T>(
  path: string,
  options?: {
    orderBy?: string;
    equalTo?: any;
    limitToFirst?: number;
    limitToLast?: number;
    startAt?: any;
    endAt?: any;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = RTDBService.listenToData<T>(
      path,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      options
    );

    return unsubscribe;
  }, [path, JSON.stringify(options)]);

  return { data, loading, error };
};

// Hook for pagination
export const usePagination = <T>(
  items: T[],
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  return {
    currentItems,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: items.length,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage
  };
};

// Hook for search functionality
export const useSearch = <T>(
  items: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredItems(items);
      } else {
        const filtered = items.filter(item =>
          searchFields.some(field => {
            const value = item[field];
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            if (Array.isArray(value)) {
              return value.some(v => 
                typeof v === 'string' && 
                v.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            return false;
          })
        );
        setFilteredItems(filtered);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [items, searchTerm, searchFields, debounceMs]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length
  };
};

export default {
  useCurrentUser,
  useTours,
  useBlogs,
  useBookings,
  useNotifications,
  useRealtimeData,
  usePagination,
  useSearch
};
