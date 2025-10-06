import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
} from "firebase/auth";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profilePhoto: string | null;
  joinDate: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  };
  status: "active" | "banned" | "pending";
}

export interface UserProfile {
  user: User;
  tourHistory: string[];
  pendingTours: string[];
  blogHistory: number[];
  pendingBlogs: number[];
  rejectedBlogs: number[];
}

interface UserContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
  updateProfilePhoto: (photoUrl: string) => void;
  updateAddress: (address: User["address"]) => void;
  updateContactInfo: (email: string, phone: string) => void;
  updatePreferences: (preferences: Partial<User["preferences"]>) => void;
  banUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const USERS_STORAGE_KEY = "echoForgeUsers";
const USER_PROFILE_STORAGE_KEY = "echoForgeUserProfile";
const ADMIN_USER_STORAGE_KEY = "echoForgeAdminUser";

const loadUsersFromStorage = (): User[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.error("Error loading users from storage", e); }
  return [];
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: "genz@saifvaiya",
  password: "Gen-Z@Saif2025"
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("Error loading userProfile from storage", e); }
    return null;
  });
  const [users, setUsers] = useState<User[]>(() => loadUsersFromStorage());
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => !!localStorage.getItem("adminToken"));

  // Restore admin session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAdminSession(true);
      const savedAdmin = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
      if (savedAdmin) {
        setCurrentUser(JSON.parse(savedAdmin));
      } else {
        setCurrentUser({
          id: "admin",
          firstName: "Admin",
          lastName: "User",
          email: ADMIN_CREDENTIALS.username,
          phone: "",
          address: { street: "", city: "", state: "", zipCode: "", country: "" },
          profilePhoto: null,
          joinDate: new Date().toISOString().split("T")[0],
          isAuthenticated: true,
          isAdmin: true,
          preferences: { emailNotifications: true, smsNotifications: false, newsletter: true },
          status: "active",
        });
      }
      return; // Do not listen to Firebase auth if admin session is active
    } else {
      setIsAdminSession(false);
    }
    // Only listen to Firebase auth state if not admin
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const [firstName, ...rest] = (firebaseUser.displayName || "").split(" ");
        const lastName = rest.join(" ");
        setCurrentUser({
          id: firebaseUser.uid,
          firstName: firstName || "",
          lastName: lastName || "",
          email: firebaseUser.email || "",
          phone: "",
          address: { street: "", city: "", state: "", zipCode: "", country: "" },
          profilePhoto: firebaseUser.photoURL,
          joinDate: firebaseUser.metadata.creationTime || "",
          isAuthenticated: true,
          isAdmin: false, // Regular users are not admin
          preferences: { emailNotifications: true, smsNotifications: false, newsletter: true },
          status: "active",
        });
        // Optionally, load userProfile from Firestore here
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // Persist users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) { console.error("Error saving users to storage", e); }
  }, [users]);

  // Sync users across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === USERS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setUsers(parsed);
        } catch (e) { console.error("Error parsing users from storage event", e); }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Persist userProfile to localStorage
  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
      }
    } catch (e) { console.error("Error saving userProfile to storage", e); }
  }, [userProfile]);

  // Sync userProfile across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_PROFILE_STORAGE_KEY && e.newValue) {
        try {
          setUserProfile(JSON.parse(e.newValue));
        } catch (e) { console.error("Error parsing userProfile from storage event", e); }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Listen for booking updates to sync user profile in real-time
  useEffect(() => {
    const handleBookingUpdate = (event: CustomEvent) => {
      const { action, booking, userEmail } = event.detail;
      
      // Only update if this booking affects the current user
      if (currentUser && userEmail === currentUser.email && userProfile) {
        console.log("Real-time booking update received:", { action, booking, userEmail });
        
        let updatedProfile = { ...userProfile };
        
        if (action === 'add') {
          // Add to pending tours if status is pending
          if (booking.status === 'pending') {
            updatedProfile.pendingTours = [...userProfile.pendingTours, String(booking.id)];
          } else if (booking.status === 'confirmed') {
            updatedProfile.tourHistory = [...userProfile.tourHistory, String(booking.id)];
          }
        } else if (action === 'update') {
          const bookingIdString = String(booking.id);
          
          if (booking.status === 'confirmed') {
            // Move from pending to confirmed
            updatedProfile.pendingTours = userProfile.pendingTours.filter(id => id !== bookingIdString);
            if (!userProfile.tourHistory.includes(bookingIdString)) {
              updatedProfile.tourHistory = [...userProfile.tourHistory, bookingIdString];
            }
          } else if (booking.status === 'pending') {
            // Move from confirmed to pending (if it was confirmed before)
            updatedProfile.tourHistory = userProfile.tourHistory.filter(id => id !== bookingIdString);
            if (!userProfile.pendingTours.includes(bookingIdString)) {
              updatedProfile.pendingTours = [...userProfile.pendingTours, bookingIdString];
            }
          } else if (booking.status === 'cancelled') {
            // Remove from both lists
            updatedProfile.pendingTours = userProfile.pendingTours.filter(id => id !== bookingIdString);
            updatedProfile.tourHistory = userProfile.tourHistory.filter(id => id !== bookingIdString);
          }
        } else if (action === 'delete') {
          // Remove from both lists
          const bookingIdString = String(booking.id);
          updatedProfile.pendingTours = userProfile.pendingTours.filter(id => id !== bookingIdString);
          updatedProfile.tourHistory = userProfile.tourHistory.filter(id => id !== bookingIdString);
        }
        
        setUserProfile(updatedProfile);
        console.log("User profile updated in real-time:", updatedProfile);
      }
    };

    window.addEventListener('bookingUpdated', handleBookingUpdate as EventListener);
    return () => window.removeEventListener('bookingUpdated', handleBookingUpdate as EventListener);
  }, [currentUser, userProfile]);

  // On login, reconstruct userProfile from bookings if missing
  useEffect(() => {
    if (currentUser && !userProfile) {
      try {
        const bookingsRaw = localStorage.getItem("echoForgeBookings");
        const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];
        const userBookings = bookings.filter((b: any) => b.user.email === currentUser.email);
        const pendingTours = userBookings.filter((b: any) => b.status === "pending").map((b: any) => String(b.id));
        const tourHistory = userBookings.filter((b: any) => b.status === "confirmed").map((b: any) => String(b.id));
        // Blog post history
        const blogPostsRaw = localStorage.getItem("echoForgeBlogPosts");
        const blogPosts = blogPostsRaw ? JSON.parse(blogPostsRaw) : [];
        const userBlogPosts = blogPosts.filter((p: any) => p.author.email === currentUser.email);
        const pendingBlogs = userBlogPosts.filter((p: any) => p.status === "pending").map((p: any) => p.id);
        const blogHistory = userBlogPosts.filter((p: any) => p.status === "approved").map((p: any) => p.id);
        const rejectedBlogs = userBlogPosts.filter((p: any) => p.status === "rejected").map((p: any) => p.id);
        setUserProfile({
          user: currentUser,
          tourHistory,
          pendingTours,
          blogHistory,
          pendingBlogs,
          rejectedBlogs,
        });
      } catch (e) { 
        console.error("Error reconstructing user profile:", e);
      }
    }
  }, [currentUser, userProfile]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const [firstName, ...rest] = (firebaseUser.displayName || "").split(" ");
        const lastName = rest.join(" ");
        setCurrentUser({
          id: firebaseUser.uid,
          firstName: firstName || "",
          lastName: lastName || "",
          email: firebaseUser.email || "",
          phone: "",
          address: { street: "", city: "", state: "", zipCode: "", country: "" },
          profilePhoto: firebaseUser.photoURL,
          joinDate: firebaseUser.metadata.creationTime || "",
          isAuthenticated: true,
          isAdmin: false, // Regular users are not admin
          preferences: { emailNotifications: true, smsNotifications: false, newsletter: true },
          status: "active",
        });
        // Optionally, load userProfile from Firestore here
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      return false;
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      // Check admin credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Create admin user object
        const adminUser: User = {
          id: "admin",
          firstName: "Admin",
          lastName: "User",
          email: username,
          phone: "",
          address: { street: "", city: "", state: "", zipCode: "", country: "" },
          profilePhoto: null,
          joinDate: new Date().toISOString().split("T")[0],
          isAuthenticated: true,
          isAdmin: true,
          preferences: { emailNotifications: true, smsNotifications: false, newsletter: true },
          status: "active",
        };
        setCurrentUser(adminUser);
        setIsAdminSession(true);
        localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(adminUser));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await firebaseUpdateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });
      // Add new user to users list
      const newUser: User = {
        id: userCredential.user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        profilePhoto: null,
        joinDate: new Date().toISOString().split("T")[0],
        isAuthenticated: true,
        isAdmin: false,
        preferences: { emailNotifications: true, smsNotifications: false, newsletter: true },
        status: "active",
      };
      setUsers((prev) => [...prev, newUser]);
      return true;
    } catch (error) {
      console.error("Firebase register error:", error);
      return false;
    }
  };

  // Admin actions
  const banUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "banned" } : u));
  };
  const activateUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "active" } : u));
  };
  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const logout = async () => {
    if (currentUser?.isAdmin || isAdminSession) {
      // For admin users, just clear the state (no Firebase logout needed)
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdminSession(false);
      localStorage.removeItem("adminToken");
      localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
      // After logout, Firebase auth state will resume
    } else {
      // For regular users, use Firebase logout
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Firebase password reset error:", error);
      return false;
    }
  };

  // The following update functions are local only (not synced to Firebase)
  const updateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      if (userProfile) {
        setUserProfile({ ...userProfile, user: updatedUser });
      }
    }
  };

  const updateProfilePhoto = (photoUrl: string) => {
    updateProfile({ profilePhoto: photoUrl });
  };

  const updateAddress = (address: User["address"]) => {
    updateProfile({ address });
  };

  const updateContactInfo = (email: string, phone: string) => {
    updateProfile({ email, phone });
  };

  const updatePreferences = (preferences: Partial<User["preferences"]>) => {
    if (currentUser) {
      const updatedPreferences = { ...currentUser.preferences, ...preferences };
      updateProfile({ preferences: updatedPreferences });
    }
  };

  const value: UserContextType = {
    currentUser,
    userProfile,
    users,
    login,
    adminLogin,
    logout,
    register,
    sendPasswordReset,
    updateProfile,
    updateProfilePhoto,
    updateAddress,
    updateContactInfo,
    updatePreferences,
    banUser,
    activateUser,
    deleteUser,
    isLoggedIn: !!currentUser,
    isAdmin: isAdminSession || !!currentUser?.isAdmin,
    setUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 