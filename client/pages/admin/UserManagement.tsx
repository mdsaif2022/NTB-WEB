import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import { Helmet } from 'react-helmet-async';

export default function UserManagement() {
  const { isAdmin, users, banUser, activateUser, deleteUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleBanUser = (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      banUser(userId);
    }
  };
  const handleActivateUser = (userId: string) => {
    activateUser(userId);
  };
  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    // For now, role isAdmin, blogger, user (if you want to add role filtering, add a role field to User)
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "banned":
        return <Badge className="bg-red-100 text-red-800">Banned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "blogger":
        return <Badge className="bg-blue-100 text-blue-800">Blogger</Badge>;
      case "user":
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management | Admin | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin panel for managing users on Explore Bangladesh." />
        <meta property="og:title" content="User Management | Admin | Explore Bangladesh" />
        <meta property="og:description" content="Admin panel for managing users on Explore Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin/users" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts, verification status, and permissions
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                    Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Verification
                </p>
                <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "pending").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                    Banned Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "banned").length}
                </p>
              </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="blogger">Blogger</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Online</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={user.profilePhoto || ""} alt={user.firstName + ' ' + user.lastName} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {(user.firstName[0] || "") + (user.lastName[0] || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.password || '-'}</TableCell>
                    <TableCell>{user.joinDate || '-'}</TableCell>
                    <TableCell>{user.lastOnline || '-'}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.isAdmin ? 'Admin' : 'User'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                              onClick={() => handleBanUser(user.id)}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                              {user.status === "active" ? "Ban" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                  Detailed information about {selectedUser.firstName} {selectedUser.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedUser.profilePhoto || ""} alt={selectedUser.firstName + ' ' + selectedUser.lastName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                        {(selectedUser.firstName[0] || "") + (selectedUser.lastName[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                        {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <div className="flex space-x-2 mt-1">
                      {getStatusBadge(selectedUser.status)}
                        {selectedUser.isAdmin ? 'Admin' : 'User'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedUser.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                      Account Info
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Join Date:</span>
                        <span className="text-sm font-medium">{selectedUser.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">User ID:</span>
                        <span className="text-sm font-medium">{selectedUser.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
}
