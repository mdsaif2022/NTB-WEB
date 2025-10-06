import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlogs } from "@/contexts/BlogContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  FileText,
  User,
  Calendar,
  MessageCircle,
  Heart,
  Share,
  Flag,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from 'react-helmet-async';

export default function BlogManagement() {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const BLOGS_LAST_SEEN_KEY = "echoForgeBlogsLastSeen";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const {
    blogPosts,
    deleteBlogPost,
    approveBlogPost,
    rejectBlogPost,
    updateBlogPost,
    getPendingPosts,
    getApprovedPosts,
  } = useBlogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const ReviewModal = () => (
    <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Blog Post</DialogTitle>
          <DialogDescription>
            Review and approve or reject this blog submission
          </DialogDescription>
        </DialogHeader>

        {selectedPost && (
          <div className="space-y-6">
            {/* Post Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={selectedPost.author.avatar || ""}
                    alt={selectedPost.author.name}
                  />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {selectedPost.author.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedPost.author.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPost.author.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted on {selectedPost.submissionDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedPost.status)}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPost.readTime}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedPost.title}
              </h2>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {selectedPost.submissionDate}
                </span>
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {selectedPost.category}
                </span>
                <span>{selectedPost.readTime}</span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedPost.content}
                </p>
              </div>

              {/* Tags */}
              {selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedPost.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Images */}
              {selectedPost.images.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Attached Images ({selectedPost.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedPost.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm"
                      >
                        📷 {image}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {selectedPost.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Admin Notes (Optional)
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes or feedback for the author..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    onClick={() => {
                      approveBlogPost(selectedPost.id, adminNotes);
                      setShowReviewModal(false);
                      setSelectedPost(null);
                      setAdminNotes("");
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Post
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) {
                        rejectBlogPost(selectedPost.id, reason, adminNotes);
                        setShowReviewModal(false);
                        setSelectedPost(null);
                        setAdminNotes("");
                      }
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Post
                  </Button>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedPost.status === "rejected" &&
              selectedPost.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">
                    Rejection Reason:
                  </h4>
                  <p className="text-red-700 text-sm">
                    {selectedPost.rejectionReason}
                  </p>
                </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowReviewModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const latestBlogId = blogPosts.length > 0 ? Math.max(...blogPosts.map((p) => p.id)) : 0;

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(BLOGS_LAST_SEEN_KEY) || 0);
    if (latestBlogId > lastSeen) {
      if (lastSeen !== 0) {
        toast({
          title: "New Blog Posts",
          description: "There are new blog posts awaiting your review.",
        });
      }
      localStorage.setItem(BLOGS_LAST_SEEN_KEY, String(latestBlogId));
    }
  }, [latestBlogId, toast]);

  return (
    <>
      <Helmet>
        <title>Blog Management | Admin | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin panel for managing blog posts on Explore Bangladesh." />
        <meta property="og:title" content="Blog Management | Admin | Explore Bangladesh" />
        <meta property="og:description" content="Admin panel for managing blog posts on Explore Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin/blogs" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-2">
              Review, approve, and manage user-generated blog posts
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogPosts.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPendingPosts().length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Approved Posts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getApprovedPosts().length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogPosts.reduce((sum, post) => sum + post.views, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <Eye className="w-6 h-6 text-emerald-600" />
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
                placeholder="Search by title or author..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Culture">Culture</SelectItem>
                <SelectItem value="Beach">Beach</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Nature">Nature</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs text-gray-500">
                            {post.readTime}
                          </span>
                          {post.images.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {post.images.length} 📷
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={post.author.avatar || ""}
                            alt={post.author.name}
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {post.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {post.author.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {post.author.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {post.submissionDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPost(post);
                              setShowReviewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review Post
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Edit functionality - could open an edit modal
                              console.log("Edit post:", post.id);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Post
                          </DropdownMenuItem>
                          {post.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => {
                                  approveBlogPost(post.id);
                                }}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  const reason = prompt(
                                    "Enter rejection reason:",
                                  );
                                  if (reason) {
                                    rejectBlogPost(post.id, reason);
                                  }
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() => {
                              // Report issue functionality
                              console.log("Report issue for post:", post.id);
                            }}
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Report Issue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete "${post.title}"?`,
                                )
                              ) {
                                deleteBlogPost(post.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Post
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

      <ReviewModal />
    </div>
    </>
  );
}
