import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useUser } from "@/contexts/UserContext";
import { useBookings } from "@/contexts/BookingContext";
import { useBlogs } from "@/contexts/BlogContext";
import { useTours } from "@/contexts/TourContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Star,
  Edit,
  Camera,
  Mail,
  Phone,
  Home,
  Settings,
  BookOpen,
  Map,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Helmet } from 'react-helmet-async';
import AdBanner from '@/components/AdBanner';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProfile, updateProfilePhoto, updateAddress, updateContactInfo, updatePreferences, logout, setUserProfile } = useUser();
  const { bookings } = useBookings();
  const { blogPosts, updateBlogPost, deleteBlogPost } = useBlogs();
  const { getTourById } = useTours();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: currentUser?.preferences.emailNotifications || false,
    smsNotifications: currentUser?.preferences.smsNotifications || false,
    newsletter: currentUser?.preferences.newsletter || false,
  });

  const [editingPost, setEditingPost] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "", tags: [], category: "", excerpt: "", images: [] as string[] });
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [updateStatus, setUpdateStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Periodic sync as fallback (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && userProfile) {
        setIsSyncing(true);
        refreshUserProfile();
        setTimeout(() => setIsSyncing(false), 1000);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, userProfile]);

  // Listen for real-time booking updates
  useEffect(() => {
    const handleBookingUpdate = (event: CustomEvent) => {
      const { action, booking, userEmail } = event.detail;
      
      // Only show update if it affects the current user
      if (currentUser && userEmail === currentUser.email) {
        console.log("Profile page: Real-time booking update received:", { action, booking });
        setLastUpdateTime(new Date());
        
        let statusMessage = '';
        if (action === 'update' && booking.status === 'confirmed') {
          statusMessage = `🎉 Your booking for "${booking.tourName}" has been approved!`;
        } else if (action === 'update' && booking.status === 'cancelled') {
          statusMessage = `❌ Your booking for "${booking.tourName}" has been cancelled.`;
        } else if (action === 'add') {
          statusMessage = `📝 New booking added for "${booking.tourName}"`;
        }
        
        if (statusMessage) {
          setUpdateStatus(statusMessage);
          setTimeout(() => setUpdateStatus(''), 5000);
        }
      }
    };

    window.addEventListener('bookingUpdated', handleBookingUpdate as EventListener);
    return () => window.removeEventListener('bookingUpdated', handleBookingUpdate as EventListener);
  }, [currentUser]);

  // Redirect to admin page if current user is an admin
  useEffect(() => {
    if (currentUser?.isAdmin) {
      navigate("/admin");
    }
  }, [currentUser, navigate]);

  // Get user's tour bookings
  const getPendingBookings = () => {
    if (!userProfile) return [];
    const pending = bookings.filter(booking => userProfile.pendingTours.includes(String(booking.id)));
    console.log("Pending bookings:", {
      userProfilePending: userProfile.pendingTours,
      allBookings: bookings.map(b => ({ id: b.id, email: b.user.email, status: b.status })),
      filtered: pending
    });
    return pending;
  };
  const getConfirmedBookings = () => {
    if (!userProfile) return [];
    const confirmed = bookings.filter(booking => userProfile.tourHistory.includes(String(booking.id)));
    console.log("Confirmed bookings:", {
      userProfileHistory: userProfile.tourHistory,
      allBookings: bookings.map(b => ({ id: b.id, email: b.user.email, status: b.status })),
      filtered: confirmed
    });
    return confirmed;
  };

  // Manual refresh function to sync user profile with current bookings
  const refreshUserProfile = () => {
    if (!currentUser || !setUserProfile) return;
    
    try {
      const userBookings = bookings.filter(b => b.user.email === currentUser.email);
      const pendingTours = userBookings.filter(b => b.status === "pending").map(b => String(b.id));
      const tourHistory = userBookings.filter(b => b.status === "confirmed").map(b => String(b.id));
      
      setUserProfile({
        ...userProfile!,
        pendingTours,
        tourHistory,
      });
      
      console.log("User profile refreshed:", { pendingTours, tourHistory, userBookings });
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  // Get user's blog posts
  const getPendingBlogPosts = () => {
    if (!userProfile) return [];
    return blogPosts.filter(post => userProfile.pendingBlogs.includes(post.id));
  };
  const getApprovedBlogPosts = () => {
    if (!userProfile) return [];
    return blogPosts.filter(post => userProfile.blogHistory.includes(post.id));
  };
  const getRejectedBlogPosts = () => {
    if (!userProfile) return [];
    return blogPosts.filter(post => userProfile.rejectedBlogs.includes(post.id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update profile data
      updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
      
      // Update contact info
      updateContactInfo(profileData.email, profileData.phone);
      
      // Update address
      updateAddress(profileData.address);
      
      // Update preferences
      updatePreferences(preferences);
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        updateProfilePhoto(photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getBlogStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Edit/Resubmit logic
  const handleEdit = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      tags: post.tags,
      category: post.category,
      excerpt: post.excerpt,
      images: post.images || [],
    });
    setEditModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((base64s) => {
      setEditForm((prev) => ({ ...prev, images: [...(prev.images || []), ...base64s as string[]] }));
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = () => {
    if (!editingPost) return;
    let updateObj = {
      title: editForm.title,
      content: editForm.content,
      tags: editForm.tags,
      category: editForm.category,
      excerpt: editForm.excerpt,
      images: editForm.images,
    };
    // If editing an approved post, set to pending and move to pendingBlogs
    if (editingPost.status === "approved") {
      updateObj = { ...updateObj, status: "pending" };
      if (setUserProfile && userProfile) {
        setUserProfile({
          ...userProfile,
          blogHistory: userProfile.blogHistory.filter((id) => id !== editingPost.id),
          pendingBlogs: [...userProfile.pendingBlogs, editingPost.id],
        });
      }
    }
    updateBlogPost(editingPost.id, updateObj);
    setEditModalOpen(false);
  };

  const handleResubmit = () => {
    if (!editingPost) return;
    updateBlogPost(editingPost.id, {
      title: editForm.title,
      content: editForm.content,
      tags: editForm.tags,
      category: editForm.category,
      excerpt: editForm.excerpt,
      status: "pending",
      rejectionReason: undefined,
    });
    // Move from rejectedBlogs to pendingBlogs in userProfile
    if (setUserProfile && userProfile) {
      setUserProfile({
        ...userProfile,
        rejectedBlogs: userProfile.rejectedBlogs.filter((id) => id !== editingPost.id),
        pendingBlogs: [...userProfile.pendingBlogs, editingPost.id],
      });
    }
    setEditModalOpen(false);
  };

  const handleDelete = (post) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    deleteBlogPost(post.id);
    // Remove from all userProfile lists
    if (setUserProfile && userProfile) {
      setUserProfile({
        ...userProfile,
        pendingBlogs: userProfile.pendingBlogs.filter((id) => id !== post.id),
        blogHistory: userProfile.blogHistory.filter((id) => id !== post.id),
        rejectedBlogs: userProfile.rejectedBlogs.filter((id) => id !== post.id),
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to view your profile.
            </p>
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Profile | Explore Bangladesh</title>
        <meta name="description" content="View and manage your bookings, blog posts, and personal information on your Explore Bangladesh profile." />
        <meta property="og:title" content="User Profile | Explore Bangladesh" />
        <meta property="og:description" content="View and manage your bookings, blog posts, and personal information on your Explore Bangladesh profile." />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://yourdomain.com/profile" />
        <meta property="og:image" content="https://yourdomain.com/og-profile.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="User Profile | Explore Bangladesh" />
        <meta name="twitter:description" content="View and manage your bookings, blog posts, and personal information on your Explore Bangladesh profile." />
        <meta name="twitter:image" content="https://yourdomain.com/og-profile.jpg" />
      </Helmet>
      <Navigation />

      {/* Profile Header */}
      <section className="pt-24 pb-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-emerald-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-emerald-100 mb-4">
                Member since {new Date(currentUser.joinDate).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-100">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {currentUser.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {currentUser.phone}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="text-white border-white hover:bg-white hover:text-emerald-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    logout();
                  }
                }}
                className="text-white border-white hover:bg-white hover:text-emerald-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Real-time update notification */}
          {updateStatus && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-medium">{updateStatus}</span>
                </div>
                <button 
                  onClick={() => setUpdateStatus('')}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tours">Tour History</TabsTrigger>
              <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Map className="w-5 h-5 mr-2" />
                      Tour Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Tours</span>
                        <span className="font-semibold">{getPendingBookings().length + getConfirmedBookings().length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <span className="font-semibold text-green-600">
                          {getConfirmedBookings().length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="font-semibold text-yellow-600">
                          {getPendingBookings().length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Blog Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Posts</span>
                        <span className="font-semibold">{blogPosts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Published</span>
                        <span className="font-semibold text-green-600">
                          {blogPosts.filter(b => b.status === "approved").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="font-semibold text-yellow-600">
                          {blogPosts.filter(b => b.status === "pending").length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Profile Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Name</span>
                        <span className="font-semibold">
                          {currentUser.firstName} {currentUser.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email</span>
                        <span className="font-semibold">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone</span>
                        <span className="font-semibold">{currentUser.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tours Tab */}
            <TabsContent value="tours" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                <h2 className="text-2xl font-bold text-gray-900">Tour History</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {lastUpdateTime.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={refreshUserProfile} className="flex items-center gap-2" disabled={isSyncing}>
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Refresh'}
                  </Button>
                <Button asChild>
                  <Link to="/tours">Book New Tour</Link>
                </Button>
                </div>
              </div>

              {/* Pending Bookings */}
              <h3 className="text-lg font-semibold text-yellow-700 mt-6 mb-2">Pending Bookings</h3>
              {getPendingBookings().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getPendingBookings().map((booking) => {
                    const tour = getTourById(booking.tourId);
                    const cardRef = useRef<HTMLDivElement>(null);
                    const handleDownloadImage = async () => {
                      if (cardRef.current) {
                        const dataUrl = await toPng(cardRef.current);
                        const link = document.createElement("a");
                        link.download = `booking-summary-${booking.id}.png`;
                        link.href = dataUrl;
                        link.click();
                      }
                    };
                    return (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{booking.tourName}</CardTitle>
                            {getStatusBadge(booking.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div ref={cardRef} className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {booking.from} → {booking.to}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              {booking.persons} person(s)
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-semibold text-emerald-600">
                                ৳{booking.amount.toLocaleString()}
                              </span>
                            </div>
                            {tour && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                                {tour.rating} rating
                              </div>
                            )}
                          </div>
                          <div className="pt-3">
                            <Button variant="outline" size="sm" onClick={handleDownloadImage}>
                              Download as Image
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-yellow-700">
                    <h4>No pending bookings.</h4>
                  </CardContent>
                </Card>
              )}

              {/* Confirmed Bookings */}
              <h3 className="text-lg font-semibold text-green-700 mt-8 mb-2">Confirmed Bookings</h3>
              {getConfirmedBookings().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getConfirmedBookings().map((booking) => {
                    const tour = getTourById(booking.tourId);
                    const cardRef = useRef<HTMLDivElement>(null);
                    const handleDownloadImage = async () => {
                      if (cardRef.current) {
                        const dataUrl = await toPng(cardRef.current);
                        const link = document.createElement("a");
                        link.download = `booking-summary-${booking.id}.png`;
                        link.href = dataUrl;
                        link.click();
                      }
                    };
                    return (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{booking.tourName}</CardTitle>
                            {getStatusBadge(booking.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div ref={cardRef} className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {booking.from} → {booking.to}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              {booking.persons} person(s)
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-semibold text-emerald-600">
                                ৳{booking.amount.toLocaleString()}
                              </span>
                            </div>
                            {tour && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                                {tour.rating} rating
                              </div>
                            )}
                          </div>
                          <div className="pt-3">
                            <Button variant="outline" size="sm" onClick={handleDownloadImage}>
                              Download as Image
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-green-700">
                    <h4>No confirmed bookings yet.</h4>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Blogs Tab */}
            <TabsContent value="blogs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
                <Button asChild>
                  <Link to="/blog/submit">Write New Post</Link>
                </Button>
              </div>

              {/* Pending Blog Posts */}
              <h3 className="text-lg font-semibold text-yellow-700 mt-6 mb-2">Pending Blog Posts</h3>
              {getPendingBlogPosts().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getPendingBlogPosts().map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {getBlogStatusBadge(post.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.submissionDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {post.readTime}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(post)}>Delete</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-yellow-700">
                    <h4>No pending blog posts.</h4>
                  </CardContent>
                </Card>
              )}

              {/* Approved Blog Posts */}
              <h3 className="text-lg font-semibold text-green-700 mt-8 mb-2">Approved Blog Posts</h3>
              {getApprovedBlogPosts().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getApprovedBlogPosts().map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {getBlogStatusBadge(post.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{__html: post.excerpt}} />
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.submissionDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {post.readTime}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>👁️ {post.views} views</span>
                            <span>💬 {post.comments} comments</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>Edit</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-green-700">
                    <h4>No approved blog posts yet.</h4>
                  </CardContent>
                </Card>
              )}

              {/* Rejected Blog Posts */}
              <h3 className="text-lg font-semibold text-red-700 mt-8 mb-2">Rejected Blog Posts</h3>
              {getRejectedBlogPosts().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getRejectedBlogPosts().map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {getBlogStatusBadge(post.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.submissionDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {post.readTime}
                          </div>
                          {post.rejectionReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-600">
                                <strong>Reason:</strong> {post.rejectionReason}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>Edit</Button>
                            <Button size="sm" variant="default" onClick={handleResubmit}>Resubmit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(post)}>Delete</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-red-700">
                    <h4>No rejected blog posts.</h4>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Home className="w-5 h-5 mr-2" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={profileData.address.street}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          address: { ...profileData.address, street: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileData.address.city}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, city: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileData.address.state}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, state: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={profileData.address.zipCode}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, zipCode: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={profileData.address.country}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, country: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          emailNotifications: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="rounded"
                      />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={preferences.smsNotifications}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          smsNotifications: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="rounded"
                      />
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="newsletter"
                        checked={preferences.newsletter}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          newsletter: e.target.checked
                        })}
                        disabled={!isEditing}
                        className="rounded"
                      />
                      <Label htmlFor="newsletter">Newsletter</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                {isEditing && (
                  <Card>
                    <CardContent className="flex justify-end pt-6">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Blog Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Blog Post</h2>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={editForm.title} onChange={e => handleEditChange("title", e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={editForm.category} onChange={e => handleEditChange("category", e.target.value)} />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input value={editForm.tags.join(", ")} onChange={e => handleEditChange("tags", e.target.value.split(",").map(t => t.trim()))} />
              </div>
              <div>
                <Label>Content</Label>
                <ReactQuill theme="snow" value={editForm.content} onChange={val => handleEditChange("content", val)} />
              </div>
              <div>
                <Label>Images</Label>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.images && editForm.images.map((img, idx) => (
                    <img key={idx} src={img} alt="blog-img" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
              {editingPost && editingPost.status === "rejected" && (
                <Button variant="default" onClick={handleResubmit}>Resubmit</Button>
              )}
            </div>
          </div>
        </div>
      )}

      <AdBanner />
      <Footer />
    </>
  );
} 