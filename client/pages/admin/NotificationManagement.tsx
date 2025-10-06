import { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  AlertTriangle,
  Clock,
  Trash2,
  Eye,
  Plus,
  Settings,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NotificationManagement() {
  const {
    notifications,
    groups,
    sendAnnouncement,
    sendBroadcastMessage,
    sendGroupAlert,
    createGroup,
    deleteNotification,
  } = useNotifications();

  const { isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const [isSending, setIsSending] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Announcement form state
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  // Group alert form state
  const [groupAlertData, setGroupAlertData] = useState({
    groupId: "",
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  // Broadcast message form state
  const [messageData, setMessageData] = useState({
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  // New group form state
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    description: "",
  });

  const handleSendAnnouncement = async () => {
    if (!announcementData.title.trim() || !announcementData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSending(true);
    try {
      sendAnnouncement({
        title: announcementData.title,
        message: announcementData.message,
        priority: announcementData.priority,
        sender: {
          id: 1,
          name: "Admin Team",
          role: "admin",
        },
      });

      setAnnouncementData({ title: "", message: "", priority: "medium" });
      setShowAnnouncementDialog(false);
      alert("Announcement sent successfully!");
    } catch (error) {
      console.error("Error sending announcement:", error);
      alert("Failed to send announcement");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendGroupAlert = async () => {
    if (!groupAlertData.groupId || !groupAlertData.title.trim() || !groupAlertData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSending(true);
    try {
      sendGroupAlert(parseInt(groupAlertData.groupId), {
        title: groupAlertData.title,
        message: groupAlertData.message,
        priority: groupAlertData.priority,
        sender: {
          id: 1,
          name: "Admin Team",
          role: "admin",
        },
      });

      setGroupAlertData({ groupId: "", title: "", message: "", priority: "medium" });
      setShowGroupDialog(false);
      alert("Group alert sent successfully!");
    } catch (error) {
      console.error("Error sending group alert:", error);
      alert("Failed to send group alert");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBroadcastMessage = async () => {
    if (!messageData.title.trim() || !messageData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSending(true);
    try {
      sendBroadcastMessage({
        title: messageData.title,
        message: messageData.message,
        priority: messageData.priority,
        sender: {
          id: 1,
          name: "Admin Team",
          role: "admin",
        },
      });

      setMessageData({ title: "", message: "", priority: "medium" });
      setShowMessageDialog(false);
      alert("Broadcast message sent successfully!");
    } catch (error) {
      console.error("Error sending broadcast message:", error);
      alert("Failed to send broadcast message");
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupData.name.trim() || !newGroupData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      createGroup({
        name: newGroupData.name,
        description: newGroupData.description,
        members: [],
        adminIds: [1],
        isActive: true,
      });

      setNewGroupData({ name: "", description: "" });
      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group");
    }
  };

  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const announcements = notifications.filter(n => n.type === "announcement").length;
    const groupAlerts = notifications.filter(n => n.type === "group_alert").length;
    const messages = notifications.filter(n => n.type === "message").length;

    return { total, unread, announcements, groupAlerts, messages };
  };

  const stats = getNotificationStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notification Management
            </h1>
            <p className="text-gray-600 mt-2">
              Send announcements, group alerts, and broadcast messages
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.announcements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Group Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.groupAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.messages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Announcement</DialogTitle>
              <DialogDescription>
                Send an announcement to all users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <Label htmlFor="announcement-message">Message</Label>
                <Textarea
                  id="announcement-message"
                  value={announcementData.message}
                  onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
                  placeholder="Enter announcement message"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="announcement-priority">Priority</Label>
                <Select
                  value={announcementData.priority}
                  onValueChange={(value: any) => setAnnouncementData({ ...announcementData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendAnnouncement} disabled={isSending}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Announcement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Users className="w-4 h-4 mr-2" />
              Send Group Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Group Alert</DialogTitle>
              <DialogDescription>
                Send an alert to a specific group
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-select">Group</Label>
                <Select
                  value={groupAlertData.groupId}
                  onValueChange={(value) => setGroupAlertData({ ...groupAlertData, groupId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group-alert-title">Title</Label>
                <Input
                  id="group-alert-title"
                  value={groupAlertData.title}
                  onChange={(e) => setGroupAlertData({ ...groupAlertData, title: e.target.value })}
                  placeholder="Enter alert title"
                />
              </div>
              <div>
                <Label htmlFor="group-alert-message">Message</Label>
                <Textarea
                  id="group-alert-message"
                  value={groupAlertData.message}
                  onChange={(e) => setGroupAlertData({ ...groupAlertData, message: e.target.value })}
                  placeholder="Enter alert message"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="group-alert-priority">Priority</Label>
                <Select
                  value={groupAlertData.priority}
                  onValueChange={(value: any) => setGroupAlertData({ ...groupAlertData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGroupDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendGroupAlert} disabled={isSending}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Group Alert"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Broadcast Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Broadcast Message</DialogTitle>
              <DialogDescription>
                Send a message to all users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message-title">Title</Label>
                <Input
                  id="message-title"
                  value={messageData.title}
                  onChange={(e) => setMessageData({ ...messageData, title: e.target.value })}
                  placeholder="Enter message title"
                />
              </div>
              <div>
                <Label htmlFor="message-content">Message</Label>
                <Textarea
                  id="message-content"
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Enter message content"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="message-priority">Priority</Label>
                <Select
                  value={messageData.priority}
                  onValueChange={(value: any) => setMessageData({ ...messageData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendBroadcastMessage} disabled={isSending}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Recent Notifications</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="create-group">Create Group</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {notification.type === "announcement" && "📢"}
                          {notification.type === "group_alert" && "👥"}
                          {notification.type === "message" && "💬"}
                        </div>
                        <div>
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="text-xs">{notification.priority}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Groups</CardTitle>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No groups created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <Card key={group.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{group.name}</h4>
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{group.members.length} members</span>
                          <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-group" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 