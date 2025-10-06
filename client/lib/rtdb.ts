import { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  onValue, 
  off, 
  query, 
  orderByChild, 
  equalTo, 
  limitToFirst, 
  limitToLast,
  startAt,
  endAt,
  DatabaseReference,
  DataSnapshot
} from "firebase/database";
import { database } from "./firebase";

// Types for common data structures
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string; // User profile picture URL
  createdAt: string;
  updatedAt: string;
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  images: string[]; // Cloudinary URLs
  heroImage?: string; // Main tour image URL
  gallery?: string[]; // Additional gallery images
  videos?: string[]; // Tour video URLs
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string; // Featured image URL
  gallery?: string[]; // Additional blog images
  videos?: string[]; // Blog video URLs
}

export interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl: string; // Cloudinary URL
  linkUrl?: string; // Click destination URL
  isActive: boolean;
  position: 'hero-top' | 'hero-bottom' | 'sidebar' | 'footer';
  priority: number; // Higher number = higher priority
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  tourTitle: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  numberOfPeople: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  tourDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string; // If null, it's a global notification
  isRead: boolean;
  createdAt: string;
}

// Generic CRUD operations
export class RTDBService {
  // Create/Set data
  static async setData<T>(path: string, data: T): Promise<void> {
    try {
      const dataRef = ref(database, path);
      await set(dataRef, data);
    } catch (error) {
      console.error('Error setting data:', error);
      throw error;
    }
  }

  // Get data once
  static async getData<T>(path: string): Promise<T | null> {
    try {
      const dataRef = ref(database, path);
      const snapshot = await get(dataRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  }

  // Push data (auto-generates key)
  static async pushData<T>(path: string, data: T): Promise<string> {
    try {
      const dataRef = ref(database, path);
      const newRef = await push(dataRef, data);
      return newRef.key!;
    } catch (error) {
      console.error('Error pushing data:', error);
      throw error;
    }
  }

  // Update specific fields
  static async updateData(path: string, updates: Record<string, any>): Promise<void> {
    try {
      const dataRef = ref(database, path);
      await update(dataRef, updates);
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  // Delete data
  static async deleteData(path: string): Promise<void> {
    try {
      const dataRef = ref(database, path);
      await remove(dataRef);
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  // Listen to real-time changes
  static listenToData<T>(
    path: string, 
    callback: (data: T | null) => void,
    options?: {
      orderBy?: string;
      equalTo?: any;
      limitToFirst?: number;
      limitToLast?: number;
      startAt?: any;
      endAt?: any;
    }
  ): () => void {
    try {
      let dataRef: DatabaseReference = ref(database, path);
      
      // Apply query options if provided
      if (options) {
        let queryRef = dataRef;
        
        if (options.orderBy) {
          queryRef = query(dataRef, orderByChild(options.orderBy));
        }
        
        if (options.equalTo !== undefined) {
          queryRef = query(queryRef, equalTo(options.equalTo));
        }
        
        if (options.limitToFirst) {
          queryRef = query(queryRef, limitToFirst(options.limitToFirst));
        }
        
        if (options.limitToLast) {
          queryRef = query(queryRef, limitToLast(options.limitToLast));
        }
        
        if (options.startAt !== undefined) {
          queryRef = query(queryRef, startAt(options.startAt));
        }
        
        if (options.endAt !== undefined) {
          queryRef = query(queryRef, endAt(options.endAt));
        }
        
        dataRef = queryRef;
      }

      const unsubscribe = onValue(dataRef, (snapshot: DataSnapshot) => {
        const data = snapshot.exists() ? snapshot.val() : null;
        callback(data);
      });

      return () => off(dataRef, 'value', unsubscribe);
    } catch (error) {
      console.error('Error listening to data:', error);
      throw error;
    }
  }

  // User-specific operations
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const user: User = {
      ...userData,
      id: '',
      createdAt: now,
      updatedAt: now
    };
    
    const userId = await this.pushData('users', user);
    await this.updateData(`users/${userId}`, { id: userId });
    return userId;
  }

  static async getUser(userId: string): Promise<User | null> {
    return this.getData<User>(`users/${userId}`);
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.updateData(`users/${userId}`, updateData);
  }

  // Tour-specific operations
  static async createTour(tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const tour: Tour = {
      ...tourData,
      id: '',
      createdAt: now,
      updatedAt: now
    };
    
    const tourId = await this.pushData('tours', tour);
    await this.updateData(`tours/${tourId}`, { id: tourId });
    
    return tourId;
  }

  static async getTours(activeOnly: boolean = false): Promise<Tour[]> {
    const tours = await this.getData<Record<string, Tour>>('tours');
    if (!tours) return [];
    
    const tourArray = Object.values(tours);
    return activeOnly ? tourArray.filter(tour => tour.isActive) : tourArray;
  }

  static async getTour(tourId: string): Promise<Tour | null> {
    return this.getData<Tour>(`tours/${tourId}`);
  }

  static async updateTour(tourId: string, updates: Partial<Tour>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.updateData(`tours/${tourId}`, updateData);
  }

  // Blog-specific operations
  static async createBlog(blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const blog: Blog = {
      ...blogData,
      id: '',
      createdAt: now,
      updatedAt: now
    };
    
    const blogId = await this.pushData('blogs', blog);
    await this.updateData(`blogs/${blogId}`, { id: blogId });
    return blogId;
  }

  static async getBlogs(publishedOnly: boolean = false): Promise<Blog[]> {
    const blogs = await this.getData<Record<string, Blog>>('blogs');
    if (!blogs) return [];
    
    const blogArray = Object.values(blogs);
    return publishedOnly ? blogArray.filter(blog => blog.isPublished) : blogArray;
  }

  static async getBlog(blogId: string): Promise<Blog | null> {
    return this.getData<Blog>(`blogs/${blogId}`);
  }

  static async updateBlog(blogId: string, updates: Partial<Blog>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.updateData(`blogs/${blogId}`, updateData);
  }

  // Booking-specific operations
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const booking: Booking = {
      ...bookingData,
      id: '',
      createdAt: now,
      updatedAt: now
    };
    
    const bookingId = await this.pushData('bookings', booking);
    await this.updateData(`bookings/${bookingId}`, { id: bookingId });
    return bookingId;
  }

  static async getBookings(userId?: string): Promise<Booking[]> {
    const bookings = await this.getData<Record<string, Booking>>('bookings');
    if (!bookings) return [];
    
    const bookingArray = Object.values(bookings);
    return userId ? bookingArray.filter(booking => booking.userId === userId) : bookingArray;
  }

  static async getBooking(bookingId: string): Promise<Booking | null> {
    return this.getData<Booking>(`bookings/${bookingId}`);
  }

  static async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.updateData(`bookings/${bookingId}`, updateData);
  }

  // Notification-specific operations
  static async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const now = new Date().toISOString();
    const notification: Notification = {
      ...notificationData,
      id: '',
      createdAt: now
    };
    
    const notificationId = await this.pushData('notifications', notification);
    await this.updateData(`notifications/${notificationId}`, { id: notificationId });
    return notificationId;
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    const notifications = await this.getData<Record<string, Notification>>('notifications');
    if (!notifications) return [];
    
    const notificationArray = Object.values(notifications);
    return userId 
      ? notificationArray.filter(notification => !notification.userId || notification.userId === userId)
      : notificationArray;
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.updateData(`notifications/${notificationId}`, { isRead: true });
  }

  // Bulk operations
  static async bulkUpdateTours(tourIds: string[], updates: Partial<Tour>): Promise<void> {
    try {
      const updatePromises = tourIds.map(tourId => 
        this.updateTour(tourId, updates)
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in bulk tour update:', error);
      throw error;
    }
  }

  static async bulkEnableTours(tourIds: string[]): Promise<void> {
    return this.bulkUpdateTours(tourIds, { isActive: true });
  }

  static async bulkDisableTours(tourIds: string[]): Promise<void> {
    return this.bulkUpdateTours(tourIds, { isActive: false });
  }

  static async bulkDeleteTours(tourIds: string[]): Promise<void> {
    try {
      const deletePromises = tourIds.map(tourId => 
        this.deleteData(`tours/${tourId}`)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error in bulk tour deletion:', error);
      throw error;
    }
  }

  // Ad Management Methods
  static async createAd(adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const ad: Ad = {
      ...adData,
      id: '',
      createdAt: now,
      updatedAt: now,
    };
    return this.createData('ads', ad);
  }

  static async getAd(adId: string): Promise<Ad | null> {
    return this.getData(`ads/${adId}`);
  }

  static async getAllAds(): Promise<Ad[]> {
    const ads = await this.getData('ads');
    return ads ? Object.values(ads) : [];
  }

  static async getActiveAds(position?: string): Promise<Ad[]> {
    const ads = await this.getAllAds();
    const now = new Date().toISOString();
    
    return ads
      .filter(ad => {
        if (!ad.isActive) return false;
        if (position && ad.position !== position) return false;
        if (ad.startDate && ad.startDate > now) return false;
        if (ad.endDate && ad.endDate < now) return false;
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  static async updateAd(adId: string, updates: Partial<Ad>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.updateData(`ads/${adId}`, updateData);
  }

  static async deleteAd(adId: string): Promise<void> {
    return this.deleteData(`ads/${adId}`);
  }

  static async toggleAdStatus(adId: string): Promise<void> {
    const ad = await this.getAd(adId);
    if (!ad) throw new Error('Ad not found');
    return this.updateAd(adId, { isActive: !ad.isActive });
  }

  // Utility functions
  static async getDataCount(path: string): Promise<number> {
    const data = await this.getData(path);
    if (!data) return 0;
    return Object.keys(data).length;
  }

  static async exists(path: string): Promise<boolean> {
    const data = await this.getData(path);
    return data !== null;
  }
}

export default RTDBService;
