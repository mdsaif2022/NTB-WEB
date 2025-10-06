import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { RTDBService } from "@/lib/rtdb";

export interface BlogPost {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
    avatar: string | null;
  };
  content: string;
  excerpt: string;
  status: "pending" | "approved" | "rejected" | "draft";
  submissionDate: string;
  publishDate?: string;
  rejectionReason?: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  views: number;
  images: string[];
  videos?: string[];
  heroImage?: string;
  tags: string[];
}

interface BlogContextType {
  blogPosts: BlogPost[];
  loading: boolean;
  error: string | null;
  addBlogPost: (post: Omit<BlogPost, "id" | "submissionDate">) => Promise<BlogPost>;
  updateBlogPost: (id: number, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: number) => Promise<void>;
  approveBlogPost: (id: number, adminNotes?: string) => Promise<void>;
  rejectBlogPost: (id: number, reason: string, adminNotes?: string) => Promise<void>;
  getBlogPostById: (id: number) => BlogPost | undefined;
  getPendingPosts: () => BlogPost[];
  getApprovedPosts: () => BlogPost[];
  getRejectedPosts: () => BlogPost[];
  refreshBlogs: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const initialBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "My Journey Through the Sundarbans",
    author: {
      name: "John Doe",
      email: "john@email.com",
      avatar: null,
    },
    content:
      "The Sundarbans mangrove forest was truly a magical experience. From the moment we entered the boat, I knew this was going to be special. The dense mangrove canopy created natural tunnels as we navigated through the narrow channels...",
    excerpt:
      "An unforgettable experience spotting Bengal tigers and exploring the world's largest mangrove forest.",
    status: "approved",
    submissionDate: "2024-01-15",
    publishDate: "2024-01-16",
    category: "Adventure",
    readTime: "5 min read",
    likes: 45,
    comments: 12,
    views: 387,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/123456789.hd.mp4?s=abc123"],
    tags: ["Sundarbans", "Wildlife", "Adventure", "Bengal Tiger"],
  },
  {
    id: 2,
    title: "Tea Gardens and Morning Mist in Srimangal",
    author: {
      name: "Jane Smith",
      email: "jane@email.com",
      avatar: null,
    },
    content:
      "Waking up at dawn in Srimangal to witness the morning mist rolling over the tea gardens is something that will stay with me forever. The rolling hills covered in emerald green tea bushes...",
    excerpt:
      "Walking through the rolling hills of tea gardens while learning about local tea culture.",
    status: "pending",
    submissionDate: "2024-01-14",
    category: "Culture",
    readTime: "4 min read",
    likes: 0,
    comments: 0,
    views: 0,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center",
    tags: ["Srimangal", "Tea", "Culture", "Nature"],
  },
  {
    id: 3,
    title: "Cox's Bazar Sunset Experience",
    author: {
      name: "Mike Johnson",
      email: "mike@email.com",
      avatar: null,
    },
    content:
      "The world's longest natural sea beach offers some of the most spectacular sunsets I've ever witnessed. As the golden hour approached, the entire beach transformed into a canvas of colors...",
    excerpt:
      "Witnessing the golden sunrise over the world's longest natural beach was truly magical.",
    status: "approved",
    submissionDate: "2024-01-13",
    publishDate: "2024-01-13",
    category: "Beach",
    readTime: "3 min read",
    likes: 24,
    comments: 8,
    views: 156,
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/987654321.hd.mp4?s=def456"],
    tags: ["Cox's Bazar", "Beach", "Sunset", "Photography"],
  },
  {
    id: 4,
    title: "Exploring Old Dhaka's Hidden Gems",
    author: {
      name: "Sarah Ahmed",
      email: "sarah@email.com",
      avatar: null,
    },
    content:
      "Old Dhaka is a treasure trove of history, culture, and architectural marvels. Walking through the narrow lanes of Old Dhaka feels like traveling back in time...",
    excerpt:
      "Discovering ancient architecture, vibrant markets, and rich Mughal heritage in Old Dhaka.",
    status: "approved",
    submissionDate: "2024-01-10",
    publishDate: "2024-01-11",
    category: "History",
    readTime: "6 min read",
    likes: 42,
    comments: 15,
    views: 298,
    images: [
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&crop=center",
    tags: ["Dhaka", "History", "Architecture", "Culture"],
  },
  {
    id: 5,
    title: "Inappropriate Content Test",
    author: {
      name: "Bad User",
      email: "bad@email.com",
      avatar: null,
    },
    content:
      "This is a test post with inappropriate content that should be rejected...",
    excerpt: "Test post that should be rejected",
    status: "rejected",
    submissionDate: "2024-01-12",
    rejectionReason: "Inappropriate content and language",
    category: "Other",
    readTime: "1 min read",
    likes: 0,
    comments: 0,
    views: 0,
    images: [],
    tags: [],
  },
  {
    id: 6,
    title: "Food Adventures in Bangladesh",
    author: {
      name: "Maria Rodriguez",
      email: "maria@email.com",
      avatar: null,
    },
    content:
      "Bangladesh cuisine is a delightful journey of flavors and spices. From street food to traditional dishes, every meal tells a story...",
    excerpt:
      "Exploring the rich culinary heritage of Bangladesh through local markets and traditional recipes.",
    status: "approved",
    submissionDate: "2024-01-09",
    publishDate: "2024-01-10",
    category: "Food",
    readTime: "7 min read",
    likes: 38,
    comments: 12,
    views: 234,
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center"
    ],
    heroImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
    videos: ["https://player.vimeo.com/external/456789123.hd.mp4?s=ghi789"],
    tags: ["Food", "Culture", "Street Food", "Traditional"],
  },
];

// Helper function to convert RTDB Blog to local BlogPost format
const convertRTDBBlogToLocal = (rtdbBlog: any): BlogPost => {
  return {
    id: parseInt(rtdbBlog.id) || Math.floor(Math.random() * 10000),
    title: rtdbBlog.title,
    author: {
      name: rtdbBlog.author?.name || "Unknown Author",
      email: rtdbBlog.author?.email || "unknown@email.com",
      avatar: rtdbBlog.author?.avatar || null,
    },
    content: rtdbBlog.content,
    excerpt: rtdbBlog.excerpt,
    status: rtdbBlog.isPublished ? "approved" : "pending",
    submissionDate: rtdbBlog.createdAt || new Date().toISOString().split("T")[0],
    publishDate: rtdbBlog.isPublished ? rtdbBlog.updatedAt : undefined,
    category: rtdbBlog.category || "General",
    readTime: rtdbBlog.readTime || "5 min read",
    likes: rtdbBlog.likes || 0,
    comments: rtdbBlog.comments || 0,
    views: rtdbBlog.views || 0,
    images: rtdbBlog.images || [],
    videos: rtdbBlog.videos || [],
    heroImage: rtdbBlog.heroImage,
    tags: rtdbBlog.tags || [],
  };
};

// Helper function to convert local BlogPost to RTDB Blog format
const convertLocalBlogToRTDB = (localBlog: BlogPost): any => {
  return {
    title: localBlog.title,
    content: localBlog.content,
    excerpt: localBlog.excerpt,
    category: localBlog.category,
    readTime: localBlog.readTime,
    likes: localBlog.likes,
    comments: localBlog.comments,
    views: localBlog.views,
    images: localBlog.images || [],
    videos: localBlog.videos || [],
    heroImage: localBlog.heroImage,
    tags: localBlog.tags || [],
    isPublished: localBlog.status === "approved",
    author: localBlog.author,
  };
};

// Helper function to load blogs from Firebase RTDB
const loadBlogsFromFirebase = async (): Promise<BlogPost[]> => {
  try {
    const rtdbBlogs = await RTDBService.getBlogs();
    if (rtdbBlogs && rtdbBlogs.length > 0) {
      return rtdbBlogs.map(convertRTDBBlogToLocal);
    } else {
      // If no blogs exist, create initial blogs
      console.log('No blogs found in Firebase, creating initial blogs');
      await createInitialBlogs();
      return initialBlogPosts;
    }
  } catch (error) {
    console.error("Error loading blogs from Firebase:", error);
    return initialBlogPosts;
  }
};

// Helper function to create initial blogs in Firebase
const createInitialBlogs = async () => {
  try {
    for (const blog of initialBlogPosts) {
      const rtdbBlog = convertLocalBlogToRTDB(blog);
      await RTDBService.createBlog(rtdbBlog);
    }
    console.log('Initial blogs created in Firebase');
  } catch (error) {
    console.error("Error creating initial blogs:", error);
  }
};

export function BlogProvider({ children }: { children: ReactNode }) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time Firebase listener for blogs
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupRealtimeListener = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time listener for blogs
        unsubscribe = RTDBService.listenToData('blogs', (data: any) => {
          console.log('Real-time blogs update received:', data);
          
          if (data) {
            // Convert RTDB data to local format
            const blogsArray = Object.values(data).map((blog: any) => convertRTDBBlogToLocal(blog));
            setBlogPosts(blogsArray);
            console.log('Blogs updated in real-time:', blogsArray.length, 'blogs');
          } else {
            // No data in Firebase, use initial blogs
            console.log('No blogs in Firebase, using initial blogs');
            setBlogPosts(initialBlogPosts);
          }
        });

        console.log('Real-time listener set up for blogs');
      } catch (err) {
        console.error("Error setting up real-time listener:", err);
        setError("Failed to connect to real-time updates");
        setBlogPosts(initialBlogPosts); // Fallback to initial blogs
      } finally {
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up real-time listener for blogs');
        unsubscribe();
      }
    };
  }, []);

  const addBlogPost = async (newPost: Omit<BlogPost, "id" | "submissionDate">): Promise<BlogPost> => {
    try {
      const post: BlogPost = {
        ...newPost,
        id: Math.max(...blogPosts.map((p) => p.id), 0) + 1,
        submissionDate: new Date().toISOString().split("T")[0],
      };
      
      const rtdbBlog = convertLocalBlogToRTDB(post);
      const blogId = await RTDBService.createBlog(rtdbBlog);
      
      // Real-time listener will automatically update the state
      console.log('Blog post created in Firebase with ID:', blogId);
      
      // Return the created post (real-time listener will update the state)
      const createdPost = { ...post, id: parseInt(blogId) || post.id };
      return createdPost;
    } catch (error) {
      console.error("Error adding blog post:", error);
      throw error;
    }
  };

  const updateBlogPost = async (id: number, updatedPost: Partial<BlogPost>): Promise<void> => {
    try {
      const rtdbUpdates = convertLocalBlogToRTDB(updatedPost as BlogPost);
      await RTDBService.updateBlog(id.toString(), rtdbUpdates);
      
      // Real-time listener will automatically update the state
      console.log("Blog post updated in Firebase, real-time listener will update state");
    } catch (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }
  };

  const deleteBlogPost = async (id: number): Promise<void> => {
    try {
      await RTDBService.deleteData(`blogs/${id}`);
      
      // Real-time listener will automatically update the state
      console.log("Blog post deleted from Firebase, real-time listener will update state");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  };

  const approveBlogPost = async (id: number, adminNotes?: string): Promise<void> => {
    try {
      await RTDBService.updateBlog(id.toString(), { isPublished: true });
      
      // Real-time listener will automatically update the state
      console.log("Blog post approved in Firebase, real-time listener will update state");
    } catch (error) {
      console.error("Error approving blog post:", error);
      throw error;
    }
  };

  const rejectBlogPost = async (id: number, reason: string, adminNotes?: string): Promise<void> => {
    try {
      await RTDBService.updateBlog(id.toString(), { isPublished: false });
      
      // Real-time listener will automatically update the state
      console.log("Blog post rejected in Firebase, real-time listener will update state");
    } catch (error) {
      console.error("Error rejecting blog post:", error);
      throw error;
    }
  };

  const getBlogPostById = (id: number) => {
    return blogPosts.find((post) => post.id === id);
  };

  const getPendingPosts = () => {
    return blogPosts.filter((post) => post.status === "pending");
  };

  const getApprovedPosts = () => {
    return blogPosts.filter((post) => post.status === "approved");
  };

  const getRejectedPosts = () => {
    return blogPosts.filter((post) => post.status === "rejected");
  };

  const refreshBlogs = async (): Promise<void> => {
    try {
      console.log("Manual refresh requested - real-time listener should handle updates");
      // The real-time listener is already active, so we don't need to manually refresh
      // Just trigger a small delay to show loading state
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error("Error refreshing blogs:", error);
      setError("Failed to refresh blogs");
    }
  };

  const value: BlogContextType = {
    blogPosts,
    loading,
    error,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    approveBlogPost,
    rejectBlogPost,
    getBlogPostById,
    getPendingPosts,
    getApprovedPosts,
    getRejectedPosts,
    refreshBlogs,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlogs() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlogs must be used within a BlogProvider");
  }
  return context;
}
