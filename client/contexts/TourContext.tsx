import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { RTDBService } from "@/lib/rtdb";

export interface Tour {
  id: number;
  name: string;
  location: string;
  destination: string;
  duration: string;
  maxParticipants: number;
  price: number;
  rating: number;
  status: "active" | "draft" | "inactive";
  bookings: number;
  image: string;
  images?: string[];
  videos?: string[];
  heroImage?: string;
  description: string;
  highlights: string[];
  includes: string[];
  createdDate: string;
  hasBusSeatSelection?: boolean;
  busSeatCapacity?: number;
}

interface TourContextType {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  addTour: (
    tour: Omit<Tour, "id" | "rating" | "bookings" | "createdDate">,
  ) => Promise<Tour>;
  updateTour: (id: number, tour: Partial<Tour>) => Promise<void>;
  deleteTour: (id: number) => Promise<void>;
  getTourById: (id: number) => Tour | undefined;
  getActiveTours: () => Tour[];
  refreshTours: () => Promise<void>;
  resetToursToDefault: () => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const initialTours: Tour[] = [
  {
    id: 1,
    name: "Sundarbans Adventure",
    location: "Khulna Division",
    destination: "Khulna",
    duration: "3 Days",
    maxParticipants: 12,
    price: 15000,
    rating: 4.9,
    status: "active",
    bookings: 142,
    image: "🌿",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/123456789.hd.mp4?s=abc123"],
    description:
      "Explore the world's largest mangrove forest and spot Bengal tigers in their natural habitat.",
    highlights: ["Royal Bengal Tiger", "Boat Safari", "Mangrove Ecosystem"],
    includes: ["Accommodation", "Meals", "Guide", "Transportation"],
    createdDate: "2024-01-01",
  },
  {
    id: 2,
    name: "Cox's Bazar Beach",
    location: "Chittagong Division",
    destination: "Cox's Bazar",
    duration: "2 Days",
    maxParticipants: 20,
    price: 8000,
    rating: 4.8,
    status: "active",
    bookings: 98,
    image: "🏖️",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/987654321.hd.mp4?s=def456"],
    description:
      "Experience the world's longest natural sea beach with golden sand and stunning sunsets.",
    highlights: ["Longest Sea Beach", "Sunset Views", "Water Sports"],
    includes: ["Hotel Stay", "Breakfast", "Transportation"],
    createdDate: "2024-01-02",
  },
  {
    id: 3,
    name: "Srimangal Tea Gardens",
    location: "Sylhet Division",
    destination: "Sylhet",
    duration: "2 Days",
    maxParticipants: 15,
    price: 6500,
    rating: 4.7,
    status: "active",
    bookings: 76,
    image: "🍃",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/456789123.hd.mp4?s=ghi789"],
    description:
      "Walk through rolling hills covered in lush tea gardens and learn about tea culture.",
    highlights: ["Tea Plantations", "Lawachara Forest", "Tribal Culture"],
    includes: ["Accommodation", "Tea Tasting", "Forest Guide"],
    createdDate: "2024-01-03",
  },
  {
    id: 4,
    name: "Historical Dhaka",
    location: "Dhaka Division",
    destination: "Dhaka",
    duration: "1 Day",
    maxParticipants: 25,
    price: 3500,
    rating: 4.6,
    status: "draft",
    bookings: 0,
    image: "🏛️",
    images: [
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&crop=center",
    description:
      "Discover ancient architecture, vibrant markets, and rich Mughal heritage.",
    highlights: ["Lalbagh Fort", "Old Dhaka", "Mughal Architecture"],
    includes: ["Guide", "Lunch", "Entry Tickets"],
    createdDate: "2024-01-15",
  },
  {
    id: 5,
    name: "Bandarban Hills",
    location: "Chittagong Division",
    destination: "Bandarban",
    duration: "3 Days",
    maxParticipants: 10,
    price: 12000,
    rating: 4.5,
    status: "active",
    bookings: 45,
    image: "⛰️",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/789123456.hd.mp4?s=jkl012"],
    description:
      "Adventure through the hills and valleys of Bandarban with tribal culture experience.",
    highlights: ["Hill Trekking", "Tribal Villages", "Natural Springs"],
    includes: ["Camping", "Local Guide", "Meals"],
    createdDate: "2024-01-10",
  },
  {
    id: 6,
    name: "River Cruise",
    location: "Dhaka Division",
    destination: "Dhaka",
    duration: "1 Day",
    maxParticipants: 30,
    price: 5000,
    rating: 4.4,
    status: "active",
    bookings: 67,
    image: "🚤",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
    description:
      "Enjoy a relaxing river cruise through the heart of Bangladesh.",
    highlights: ["River Views", "Local Life", "Traditional Boats"],
    includes: ["Boat Ride", "Lunch", "Guide"],
    createdDate: "2024-01-12",
  },
];

// Helper function to convert RTDB Tour to local Tour format
const convertRTDBTourToLocal = (rtdbTour: any): Tour => {
  return {
    id: parseInt(rtdbTour.id) || Math.floor(Math.random() * 10000),
    name: rtdbTour.title || rtdbTour.name,
    location: rtdbTour.location,
    destination: rtdbTour.location,
    duration: rtdbTour.duration,
    maxParticipants: 20, // Default value
    price: rtdbTour.price,
    rating: 4.5, // Default value
    status: rtdbTour.isActive ? "active" : "inactive",
    bookings: 0, // Default value
    image: "🌍", // Default emoji
    images: rtdbTour.images || [],
    videos: rtdbTour.videos || [],
    heroImage: rtdbTour.heroImage,
    description: rtdbTour.description,
    highlights: [], // Default empty array
    includes: [], // Default empty array
    createdDate: rtdbTour.createdAt || new Date().toISOString().split("T")[0],
    hasBusSeatSelection: rtdbTour.hasBusSeatSelection || false,
    busSeatCapacity: rtdbTour.busSeatCapacity,
  };
};

// Helper function to convert local Tour to RTDB Tour format
const convertLocalTourToRTDB = (localTour: Tour): any => {
  return {
    title: localTour.name,
    description: localTour.description,
    price: localTour.price,
    duration: localTour.duration,
    location: localTour.location,
    images: localTour.images || [],
    heroImage: localTour.heroImage,
    videos: localTour.videos || [],
    isActive: localTour.status === "active",
    createdBy: "admin", // Default value
    hasBusSeatSelection: localTour.hasBusSeatSelection || false,
    busSeatCapacity: localTour.busSeatCapacity,
  };
};

// Helper function to load tours from Firebase RTDB
const loadToursFromFirebase = async (): Promise<Tour[]> => {
  try {
    const rtdbTours = await RTDBService.getTours();
    if (rtdbTours && rtdbTours.length > 0) {
      return rtdbTours.map(convertRTDBTourToLocal);
    } else {
      // If no tours exist, create initial tours
      console.log('No tours found in Firebase, creating initial tours');
      await createInitialTours();
      return initialTours;
    }
  } catch (error) {
    console.error("Error loading tours from Firebase:", error);
    return initialTours;
  }
};

// Helper function to create initial tours in Firebase
const createInitialTours = async () => {
  try {
    for (const tour of initialTours) {
      const rtdbTour = convertLocalTourToRTDB(tour);
      await RTDBService.createTour(rtdbTour);
    }
    console.log('Initial tours created in Firebase');
  } catch (error) {
    console.error("Error creating initial tours:", error);
  }
};

export function TourProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time Firebase listener for tours
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupRealtimeListener = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time listener for tours
        unsubscribe = RTDBService.listenToData('tours', (data: any) => {
          if (data && typeof data === 'object') {
            // Convert RTDB data to local format
            const toursArray = Object.values(data).map((tour: any) => convertRTDBTourToLocal(tour));
            setTours(toursArray);
          } else {
            // No data in Firebase, use initial tours
            setTours(initialTours);
          }
        });

        console.log('Real-time listener set up for tours');
      } catch (err) {
        console.error("Error setting up real-time listener:", err);
        setError("Failed to connect to real-time updates");
        setTours(initialTours); // Fallback to initial tours
      } finally {
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up real-time listener for tours');
        unsubscribe();
      }
    };
  }, []);

  const addTour = async (
    newTour: Omit<Tour, "id" | "rating" | "bookings" | "createdDate">,
  ): Promise<Tour> => {
    try {
      const tour: Tour = {
        ...newTour,
        id: Math.max(...tours.map((t) => t.id), 0) + 1,
        rating: 4.5,
        bookings: 0,
        createdDate: new Date().toISOString().split("T")[0],
      };
      
      const rtdbTour = convertLocalTourToRTDB(tour);
      const tourId = await RTDBService.createTour(rtdbTour);
      
      // Real-time listener will automatically update the state
      const createdTour = { ...tour, id: parseInt(tourId) || tour.id };
      return createdTour;
    } catch (error) {
      console.error("Error adding tour:", error);
      throw error;
    }
  };

  const updateTour = async (id: number, updatedTour: Partial<Tour>): Promise<void> => {
    try {
      const rtdbUpdates = convertLocalTourToRTDB(updatedTour as Tour);
      await RTDBService.updateTour(id.toString(), rtdbUpdates);
      
      // Real-time listener will automatically update the state
    } catch (error) {
      console.error("Error updating tour:", error);
      throw error;
    }
  };

  const deleteTour = async (id: number): Promise<void> => {
    try {
      await RTDBService.deleteData(`tours/${id}`);
      
      // Real-time listener will automatically update the state
    } catch (error) {
      console.error("Error deleting tour:", error);
      throw error;
    }
  };

  const getTourById = (id: number) => {
    return tours.find((tour) => tour.id === id);
  };

  const getActiveTours = () => {
    return tours.filter((tour) => tour.status === "active");
  };

  const refreshTours = async (): Promise<void> => {
    try {
      // The real-time listener is already active, so we don't need to manually refresh
      // Just trigger a small delay to show loading state
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error("Error refreshing tours:", error);
      setError("Failed to refresh tours");
    }
  };

  const resetToursToDefault = async (): Promise<void> => {
    try {
      setLoading(true);
      // Delete all existing tours from Firebase
      const allTours = await RTDBService.getTours();
      for (const tour of allTours) {
        await RTDBService.deleteData(`tours/${tour.id}`);
      }
      // Create initial tours
      await createInitialTours();
      
      // Real-time listener will automatically update the state
    } catch (error) {
      console.error("Error resetting tours:", error);
      setError("Failed to reset tours");
    } finally {
      setLoading(false);
    }
  };

  const value: TourContextType = {
    tours,
    loading,
    error,
    addTour,
    updateTour,
    deleteTour,
    getTourById,
    getActiveTours,
    refreshTours,
    resetToursToDefault,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTours() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTours must be used within a TourProvider");
  }
  return context;
}
