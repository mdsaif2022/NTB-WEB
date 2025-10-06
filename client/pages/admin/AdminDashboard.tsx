import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  Eye,
  Calendar,
  Star,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTours } from "@/contexts/TourContext";
import { useBlogs } from "@/contexts/BlogContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useBookings } from "@/contexts/BookingContext";
import { Helmet } from 'react-helmet-async';

export default function AdminDashboard() {
  const { isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const { tours } = useTours();
  const { blogPosts } = useBlogs();
  const { settings } = useSettings();
  const { bookings, getRecentBookings } = useBookings();

  // Calculate dynamic statistics
  const totalUsers = 2847; // Mock data - in real app would come from user context
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );
  const activeTours = tours.filter((tour) => tour.status === "active").length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Tours",
      value: activeTours.toString(),
      change: `+${activeTours > 20 ? 3 : 1}`,
      trend: "up",
      icon: MapPin,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Bookings",
      value: totalBookings.toLocaleString(),
      change: "+8%",
      trend: "up",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  // Get real-time recent bookings with user notes
  const recentBookings = getRecentBookings(4).map((booking) => ({
    id: booking.id,
    user: booking.user.name,
    tour: booking.tourName,
    date: booking.date,
    amount: `৳${booking.amount.toLocaleString()}`,
    status: booking.status,
    notes: booking.notes,
    persons: booking.persons,
    seats: booking.selectedSeats.join(", "),
    phone: booking.user.phone,
  }));

  // Get real pending blog posts
  const pendingBlogs = blogPosts
    .filter((post) => post.status === "pending")
    .slice(0, 3)
    .map((post) => ({
      id: post.id,
      title: post.title,
      author: post.author.name,
      date: post.date,
      status: "pending",
    }));

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin dashboard for managing tours, bookings, users, and content on Explore Bangladesh." />
        <meta property="og:title" content="Admin Dashboard | Explore Bangladesh" />
        <meta property="og:description" content="Admin dashboard for managing tours, bookings, users, and content on Explore Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin/dashboard" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with {settings.siteName} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      from last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Quick Actions
              <Plus className="w-5 h-5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/tours/new">
              <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                <MapPin className="w-4 h-4 mr-2" />
                Add New Tour
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/blogs">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Review Blog Posts
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Bookings
              <Calendar className="w-5 h-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{booking.user}</p>
                    <p className="text-xs text-gray-600">{booking.tour}</p>
                    <p className="text-xs text-gray-500">
                      {booking.date} • {booking.persons} person
                      {booking.persons > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-blue-600">
                      Seats: {booking.seats} • {booking.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{booking.amount}</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-800 mb-1">
                      User Notes:
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {booking.notes.length > 120
                        ? `${booking.notes.substring(0, 120)}...`
                        : booking.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <Link to="/admin/tours">
              <Button variant="outline" size="sm" className="w-full">
                View All Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Blog Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pending Reviews
              <Eye className="w-5 h-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingBlogs.length > 0 ? (
              <>
                {pendingBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <p className="font-medium text-sm line-clamp-2">
                      {blog.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      by {blog.author}
                    </p>
                    <p className="text-xs text-gray-500">{blog.date}</p>
                  </div>
                ))}
                <Link to="/admin/blogs">
                  <Button variant="outline" size="sm" className="w-full">
                    Review All Posts
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No pending reviews</p>
              </div>
            )}
          </CardContent>
        </Card>

          {/* Manage Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Manage Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/admin/bookings">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-5 h-5 mr-2" />
                  Manage Bookings
                </Button>
              </Link>
            </CardContent>
          </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {tours.length}
              </div>
              <p className="text-sm text-blue-800">Total Tours</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {blogPosts.filter((post) => post.status === "approved").length}
              </div>
              <p className="text-sm text-green-800">Published Posts</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {blogPosts.reduce((sum, post) => sum + post.views, 0)}
              </div>
              <p className="text-sm text-purple-800">Total Views</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
