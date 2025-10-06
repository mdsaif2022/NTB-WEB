import { useState, useEffect } from "react";
import { Bell, X, Check, Trash2, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUser } from "@/contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    settings,
    updateSettings,
    requestNotificationPermission,
    isNotificationSupported,
  } = useNotifications();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if (isNotificationSupported && settings.pushNotifications) {
      requestNotificationPermission();
    }
  }, [isNotificationSupported, settings.pushNotifications, requestNotificationPermission]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setIsOpen(false);
  };

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 text-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleSound}>
                      {settings.soundEnabled ? (
                        <>
                          <VolumeX className="w-4 h-4 mr-2" />
                          Mute Sound
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Unmute Sound
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={togglePushNotifications}>
                      {settings.pushNotifications ? "Disable" : "Enable"} Push Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={markAllAsRead}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark All as Read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            From: {notification.sender.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {notifications.length > 10 && (
              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/notifications");
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
} 