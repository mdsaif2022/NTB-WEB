import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Trash2,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  AlertCircle,
  Users,
  MessageSquare,
  MapPin,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    settings,
    updateSettings,
    requestNotificationPermission,
    isNotificationSupported,
  } = useNotifications();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.sender.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return "📢";
      case "group_alert":
        return "👥";
      case "message":
        return "💬";
      case "tour_update":
        return "🗺️";
      case "blog_update":
        return "📝";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement":
        return "Announcement";
      case "group_alert":
        return "Group Alert";
      case "message":
        return "Message";
      case "tour_update":
        return "Tour Update";
      case "blog_update":
        return "Blog Update";
      default:
        return type;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const togglePushNotifications = async () => {
    if (!settings.pushNotifications) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateSettings({ pushNotifications: true });
      }
    } else {
      updateSettings({ pushNotifications: false });
    }
  };

  const notificationTypes = [
    { value: "all", label: "All", count: notifications.length },
    { value: "announcement", label: "Announcements", count: getNotificationsByType("announcement").length },
    { value: "group_alert", label: "Group Alerts", count: getNotificationsByType("group_alert").length },
    { value: "message", label: "Messages", count: getNotificationsByType("message").length },
    { value: "tour_update", label: "Tour Updates", count: getNotificationsByType("tour_update").length },
    { value: "blog_update", label: "Blog Updates", count: getNotificationsByType("blog_update").length },
  ];

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
              Please log in to view your notifications.
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
    <div className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Notifications
              </h1>
              <p className="text-emerald-100">
                Stay updated with announcements, messages, and alerts
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="text-white border-white hover:bg-white hover:text-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                onClick={clearAllNotifications}
                className="text-white border-white hover:bg-white hover:text-emerald-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Push Notifications</span>
                    <Button
                      variant={settings.pushNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={togglePushNotifications}
                    >
                      {settings.pushNotifications ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sound</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSound}
                    >
                      {settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    {notificationTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">{type.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="announcement">Announcements</option>
                      <option value="group_alert">Group Alerts</option>
                      <option value="message">Messages</option>
                      <option value="tour_update">Tour Updates</option>
                      <option value="blog_update">Blog Updates</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      Notifications ({filteredNotifications.length})
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-blue-500">
                          {unreadCount} unread
                        </Badge>
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No notifications found
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm || filterType !== "all" || filterPriority !== "all"
                          ? "Try adjusting your search or filters"
                          : "You're all caught up!"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-6 hover:bg-gray-50 transition-colors ${
                            !notification.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="text-3xl">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                    {notification.title}
                                  </h4>
                                  <p className="text-gray-600 mb-3">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Badge className={getPriorityColor(notification.priority)}>
                                    {notification.priority}
                                  </Badge>
                                  <Badge variant="outline">
                                    {getTypeLabel(notification.type)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>From: {notification.sender.name}</span>
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                  {!notification.isRead && (
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                      <span>Unread</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Mark Read
                                    </Button>
                                  )}
                                  {notification.actionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleNotificationClick(notification)}
                                    >
                                      View Details
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 