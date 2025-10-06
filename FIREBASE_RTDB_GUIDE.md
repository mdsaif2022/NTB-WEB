# Firebase Realtime Database Integration Guide

This guide explains how to use Firebase Realtime Database (RTDB) in your Narayanganj Traveller BD project.

## 🚀 Quick Start

### 1. Firebase Configuration

Your Firebase configuration is already set up in `client/lib/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // Your config here
  databaseURL: "https://narayanganj-traveller-bd-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
```

### 2. Using RTDB in Components

The RTDB is integrated through React Context and custom hooks. Here's how to use it:

```typescript
import { useRTDB, useTours, useCurrentUser } from '@/hooks/useRTDB';

function MyComponent() {
  const { tours, createTour, updateTour } = useTours();
  const { currentUser } = useCurrentUser();
  
  const handleCreateTour = async () => {
    await createTour({
      title: "New Tour",
      description: "Tour description",
      price: 100,
      duration: "1 day",
      location: "Narayanganj",
      images: [],
      isActive: true,
      createdBy: currentUser?.id || 'admin'
    });
  };
  
  return (
    <div>
      {tours.map(tour => (
        <div key={tour.id}>{tour.title}</div>
      ))}
    </div>
  );
}
```

## 📁 File Structure

```
client/
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   └── rtdb.ts             # RTDB service functions
├── contexts/
│   └── RTDBContext.tsx     # React context for RTDB
├── hooks/
│   └── useRTDB.ts          # Custom hooks for RTDB operations
└── components/
    └── RTDBExample.tsx     # Example component
```

## 🔧 Available Services

### RTDBService Class

The `RTDBService` class provides low-level database operations:

```typescript
import RTDBService from '@/lib/rtdb';

// Create data
await RTDBService.setData('users/123', userData);
await RTDBService.pushData('tours', tourData);

// Read data
const user = await RTDBService.getData('users/123');
const tours = await RTDBService.getData('tours');

// Update data
await RTDBService.updateData('users/123', { name: 'New Name' });

// Delete data
await RTDBService.deleteData('users/123');

// Listen to real-time changes
const unsubscribe = RTDBService.listenToData('tours', (data) => {
  console.log('Tours updated:', data);
});
```

### Custom Hooks

#### useTours()
```typescript
const {
  tours,           // All tours
  activeTours,     // Only active tours
  filteredTours,   // Tours filtered by search
  loading,         // Loading state
  searchTerm,      // Current search term
  setSearchTerm,   // Update search term
  createTour,      // Create new tour
  updateTour,      // Update existing tour
  deleteTour,      // Delete tour
  getTourById,     // Get tour by ID
  getToursByLocation // Get tours by location
} = useTours();
```

#### useBlogs()
```typescript
const {
  blogs,              // All blogs
  publishedBlogs,     // Only published blogs
  filteredBlogs,      // Blogs filtered by search/tag
  allTags,           // All unique tags
  searchTerm,        // Current search term
  selectedTag,       // Currently selected tag
  createBlog,        // Create new blog
  updateBlog,        // Update existing blog
  deleteBlog,        // Delete blog
  getBlogById,       // Get blog by ID
  getBlogsByAuthor   // Get blogs by author
} = useBlogs();
```

#### useBookings()
```typescript
const {
  bookings,          // All bookings
  userBookings,      // Current user's bookings
  filteredBookings,  // Bookings filtered by status
  statusFilter,      // Current status filter
  createBooking,     // Create new booking
  updateBooking,     // Update existing booking
  deleteBooking,     // Delete booking
  getBookingById,    // Get booking by ID
  getBookingsByStatus, // Get bookings by status
  getTotalRevenue    // Calculate total revenue
} = useBookings();
```

#### useNotifications()
```typescript
const {
  notifications,        // All notifications
  userNotifications,    // Current user's notifications
  unreadNotifications,  // Unread notifications
  createNotification,   // Create new notification
  markNotificationAsRead, // Mark as read
  markAllAsRead,        // Mark all as read
  createGlobalNotification, // Create global notification
  createUserNotification    // Create user-specific notification
} = useNotifications();
```

#### useCurrentUser()
```typescript
const {
  currentUser,      // Current user data
  setCurrentUser,   // Set current user
  updateCurrentUser, // Update current user
  isLoggedIn        // Boolean: is user logged in
} = useCurrentUser();
```

## 📊 Data Types

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}
```

### Tour
```typescript
interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### Blog
```typescript
interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}
```

### Booking
```typescript
interface Booking {
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
```

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string; // If null, it's a global notification
  isRead: boolean;
  createdAt: string;
}
```

## 🔄 Real-time Features

The RTDB integration provides real-time updates for all data. When data changes in the database, all connected clients automatically receive updates.

### Example: Real-time Tour Updates
```typescript
function ToursList() {
  const { tours, loading } = useTours();
  
  // This will automatically update when tours change in the database
  return (
    <div>
      {loading ? (
        <div>Loading tours...</div>
      ) : (
        tours.map(tour => (
          <div key={tour.id}>{tour.title}</div>
        ))
      )}
    </div>
  );
}
```

## 🛡️ Security Rules

Make sure to set up proper Firebase Security Rules for your Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "tours": {
      ".read": true,
      ".write": "auth != null && (auth.token.admin === true || data.child('createdBy').val() === auth.uid)"
    },
    "blogs": {
      ".read": true,
      ".write": "auth != null"
    },
    "bookings": {
      "$uid": {
        ".read": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid)",
        ".write": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid)"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "auth != null && (auth.token.admin === true || data.child('userId').val() === auth.uid || !data.child('userId').exists())",
        ".write": "auth != null"
      }
    }
  }
}
```

## 🚨 Error Handling

All RTDB operations include error handling:

```typescript
const { error, setError } = useRTDB();

// Errors are automatically caught and stored in the context
// You can display them in your UI:

if (error) {
  return <div className="error">Error: {error}</div>;
}
```

## 📱 Example Usage

Check out `client/components/RTDBExample.tsx` for a complete example of how to use all the RTDB features in a React component.

## 🔧 Advanced Features

### Pagination
```typescript
import { usePagination } from '@/hooks/useRTDB';

function ToursList() {
  const { tours } = useTours();
  const {
    currentItems,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage
  } = usePagination(tours, 10);
  
  return (
    <div>
      {currentItems.map(tour => (
        <div key={tour.id}>{tour.title}</div>
      ))}
      <button onClick={goToPreviousPage}>Previous</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={goToNextPage}>Next</button>
    </div>
  );
}
```

### Search
```typescript
import { useSearch } from '@/hooks/useRTDB';

function ToursList() {
  const { tours } = useTours();
  const {
    searchTerm,
    setSearchTerm,
    filteredItems,
    hasResults
  } = useSearch(tours, ['title', 'description', 'location']);
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tours..."
      />
      {hasResults ? (
        filteredItems.map(tour => (
          <div key={tour.id}>{tour.title}</div>
        ))
      ) : (
        <div>No tours found</div>
      )}
    </div>
  );
}
```

## 🎯 Best Practices

1. **Use the custom hooks** instead of directly calling RTDBService
2. **Handle loading states** in your UI
3. **Implement proper error handling**
4. **Use TypeScript interfaces** for type safety
5. **Set up proper security rules** in Firebase Console
6. **Optimize queries** by using filters and limits
7. **Clean up listeners** when components unmount (handled automatically by hooks)

## 🚀 Getting Started

1. Make sure Firebase is properly configured
2. Import the hooks you need in your components
3. Use the provided data and functions
4. Handle loading and error states
5. Test your implementation

The RTDB integration is now ready to use throughout your application!
