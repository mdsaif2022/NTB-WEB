import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Eye,
  MessageCircle,
  X,
  Heart,
  Share2,
  Facebook,
  Send,
  Reply,
  Play,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogs } from "@/contexts/BlogContext";
import { Helmet } from 'react-helmet-async';
import AdBanner from '@/components/AdBanner';
import { motion } from 'framer-motion';

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  replies: Comment[];
}

export default function Blog() {
  const { blogPosts, getApprovedPosts, updateBlogPost } = useBlogs();
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const approvedPosts = getApprovedPosts();
  const postsToShow = approvedPosts.slice(0, visiblePosts);

  const loadMorePosts = () => {
    setVisiblePosts((prev) => Math.min(prev + 6, approvedPosts.length));
  };

  const openBlogDetail = (blog: any) => {
    setSelectedBlog(blog);
    setShowComments(false);
    setNewComment("");
    setReplyTo(null);
    setReplyContent("");
  };

  const closeBlogDetail = () => {
    setSelectedBlog(null);
    setShowComments(false);
    setNewComment("");
    setReplyTo(null);
    setReplyContent("");
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const addComment = (blogId: number) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      author: "Anonymous User", // In real app, would use logged-in user
      content: newComment.trim(),
      date: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => ({
      ...prev,
      [blogId]: [...(prev[blogId] || []), comment],
    }));

    // Update blog post comment count
    updateBlogPost(blogId, {
      comments: (selectedBlog?.comments || 0) + 1,
    });

    // Update selected blog state
    if (selectedBlog && selectedBlog.id === blogId) {
      setSelectedBlog((prev) => ({
        ...prev,
        comments: prev.comments + 1,
      }));
    }

    setNewComment("");
  };

  const addReply = (blogId: number, commentId: number) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: Date.now(),
      author: "Anonymous User",
      content: replyContent.trim(),
      date: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => ({
      ...prev,
      [blogId]:
        prev[blogId]?.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment,
        ) || [],
    }));

    setReplyTo(null);
    setReplyContent("");
  };

  const handleLikeStory = (blogId: number) => {
    const isLiked = likedPosts.has(blogId);
    const targetPost = approvedPosts.find((post) => post.id === blogId);

    if (!targetPost) return;

    if (isLiked) {
      // Unlike
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(blogId);
        return newSet;
      });
      updateBlogPost(blogId, {
        likes: targetPost.likes - 1,
      });
    } else {
      // Like
      setLikedPosts((prev) => new Set(prev).add(blogId));
      updateBlogPost(blogId, {
        likes: targetPost.likes + 1,
      });
    }

    // Update the selected blog state if it's the same post
    if (selectedBlog && selectedBlog.id === blogId) {
      setSelectedBlog((prev) => ({
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    }
  };

  const handleShareToFacebook = (blog: any) => {
    const shareUrl = `${window.location.origin}/blog?post=${blog.id}`;
    const shareText = `Check out this amazing travel story: "${blog.title}" by ${blog.author.name}`;

    // Facebook share URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

    // Open Facebook share dialog
    window.open(
      facebookShareUrl,
      "facebook-share-dialog",
      "width=626,height=436,resizable=yes,scrollbars=yes",
    );
  };

  const handleGenericShare = async (blog: any) => {
    const shareUrl = `${window.location.origin}/blog?post=${blog.id}`;
    const shareText = `Amazing travel story: "${blog.title}" by ${blog.author.name}`;
    const shareContent = `${shareText}\n\n${blog.excerpt}\n\nRead more: ${shareUrl}`;

    // Try multiple sharing methods in order

    // Method 1: Native Web Share API (mobile devices)
    if (navigator.share && navigator.canShare) {
      try {
        const shareData = {
          title: blog.title,
          text: shareText,
          url: shareUrl,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (error) {
        console.log("Native share failed, trying fallback methods");
      }
    }

    // Method 2: Try clipboard API with permission check
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareContent);
        alert(
          "✅ Story link copied to clipboard!\n\nYou can now paste it anywhere to share.",
        );
        return;
      } catch (error) {
        console.log("Clipboard API failed, trying manual method");
      }
    }

    // Method 3: Manual copy using textarea (most compatible)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = shareContent;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        alert(
          "✅ Story link copied!\n\nYou can now paste it anywhere to share.",
        );
        return;
      }
    } catch (error) {
      console.log("Manual copy failed");
    }

    // Method 4: Show share options modal as final fallback
    const userChoice = confirm(
      `Share this story:\n\n"${blog.title}"\nby ${blog.author.name}\n\n` +
        `Click OK to copy the link, or Cancel to see share options.`,
    );

    if (userChoice) {
      // Try one more manual copy attempt
      prompt("Copy this link to share the story:", shareUrl);
    } else {
      // Show platform-specific share options
      const platform = prompt(
        "Choose sharing platform:\n\n" +
          "1. WhatsApp\n" +
          "2. Twitter\n" +
          "3. Telegram\n" +
          "4. Email\n\n" +
          "Enter number (1-4):",
      );

      switch (platform) {
        case "1":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(shareContent)}`,
            "_blank",
          );
          break;
        case "2":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            "_blank",
          );
          break;
        case "3":
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            "_blank",
          );
          break;
        case "4":
          window.open(
            `mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(shareContent)}`,
            "_blank",
          );
          break;
        default:
          alert("You can manually copy this link:\n\n" + shareUrl);
      }
    }
  };
  return (
    <>
      <Helmet>
        <title>Travel Stories & Blog - Explore Bangladesh</title>
        <meta name="description" content="Read authentic travel stories and tips from real travelers in Bangladesh. Get inspired for your next adventure!" />
        <meta property="og:title" content="Travel Stories & Blog - Explore Bangladesh" />
        <meta property="og:description" content="Read authentic travel stories and tips from real travelers in Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/blog" />
        <meta property="og:image" content="https://yourdomain.com/og-image-blog.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Travel Stories & Blog - Explore Bangladesh" />
        <meta name="twitter:description" content="Read authentic travel stories and tips from real travelers in Bangladesh." />
        <meta name="twitter:image" content="https://yourdomain.com/og-image-blog.jpg" />
      </Helmet>
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Travel Stories & Experiences
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            Read authentic travel stories from fellow explorers and share your
            own adventures
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 font-semibold"
            asChild
          >
            <Link to="/blog/submit">Share Your Story</Link>
          </Button>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsToShow.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer group border-0 shadow-lg hover:-translate-y-2"
                  onClick={() => openBlogDetail(post)}
                >
                  {/* Enhanced Image/Video Preview */}
                  <div className="relative h-56 overflow-hidden">
                    {post.heroImage || (post.images && post.images.length > 0) ? (
                      <div className="relative w-full h-full">
                        <img
                          src={post.heroImage || post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Overlay with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Video indicator */}
                        {post.videos && post.videos.length > 0 && (
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Video className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        {/* Image count indicator */}
                        {post.images && post.images.length > 1 && (
                          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                            <ImageIcon className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">{post.images.length}</span>
                          </div>
                        )}
                        
                        {/* Play button for videos */}
                        {post.videos && post.videos.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-6xl mb-2">📖</div>
                          <div className="text-sm font-medium opacity-80">No Preview Available</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/90 text-emerald-700 hover:bg-white border-0 shadow-lg backdrop-blur-sm">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 text-sm line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>
                          {new Date(
                            post.publishDate || post.submissionDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openBlogDetail(post);
                            setShowComments(true);
                          }}
                          className="flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comments}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeStory(post.id);
                          }}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 ${
                            likedPosts.has(post.id)
                              ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                              : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              likedPosts.has(post.id) ? "fill-current" : ""
                            }`}
                          />
                          <span>{post.likes}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {visiblePosts < approvedPosts.length && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-8 py-4 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={loadMorePosts}
              >
                Load More Stories ({approvedPosts.length - visiblePosts}{" "}
                remaining)
              </Button>
            </motion.div>
          )}

          {postsToShow.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No stories available yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to share your travel experience!
              </p>
              <Button asChild>
                <Link to="/blog/submit">Share Your Story</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* User Content Submission Info */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-emerald-900 mb-6">
            Share Your Travel Experience
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have an amazing Bangladesh travel story? Share it with our community
            and inspire others to explore!
          </p>
          <div className="bg-emerald-50 rounded-2xl p-8 text-left">
            <h3 className="text-xl font-semibold text-emerald-900 mb-4">
              Submission Guidelines:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Include a compelling title and detailed description</li>
              <li>• Add high-quality images or videos from your trip</li>
              <li>• Verified users only (registration required)</li>
              <li>• All submissions reviewed by admin before publishing</li>
              <li>• Share authentic experiences and helpful tips</li>
            </ul>
          </div>
        </div>
      </section>

      <AdBanner />

      {/* Blog Detail Modal */}
      <Dialog open={!!selectedBlog} onOpenChange={closeBlogDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBlog && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        {selectedBlog.category}
                      </Badge>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-emerald-900 mb-4">
                      {selectedBlog.title}
                    </DialogTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedBlog.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(
                            selectedBlog.publishDate ||
                              selectedBlog.submissionDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{selectedBlog.views} views</span>
                      </div>
                      <span className="text-emerald-600 font-medium">
                        {selectedBlog.readTime}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeBlogDetail}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Images and Videos */}
                {(selectedBlog.images && selectedBlog.images.length > 0) || (selectedBlog.videos && selectedBlog.videos.length > 0) ? (
                  <div className="space-y-4">
                    {/* Hero Image/Video */}
                    {selectedBlog.heroImage && (
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={selectedBlog.heroImage}
                          alt={selectedBlog.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Additional Images */}
                    {selectedBlog.images && selectedBlog.images.length > 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedBlog.images.slice(1).map((image: string, index: number) => (
                          <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                            <img
                              src={image}
                              alt={`${selectedBlog.title} - Image ${index + 2}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Videos */}
                    {selectedBlog.videos && selectedBlog.videos.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Video className="w-5 h-5 mr-2 text-emerald-600" />
                          Videos
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {selectedBlog.videos.map((video: string, index: number) => (
                            <div key={index} className="rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                              <video
                                controls
                                className="w-full h-64 object-cover"
                                poster={selectedBlog.heroImage}
                              >
                                <source src={video} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Content */}
                <div className="prose prose-emerald max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {selectedBlog.content}
                  </div>
                </div>

                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedBlog.views} views</span>
                    </div>
                    <button
                      onClick={toggleComments}
                      className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{selectedBlog.comments} comments</span>
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenericShare(selectedBlog)}
                      className="flex items-center space-x-1"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareToFacebook(selectedBlog)}
                      className="flex items-center space-x-1 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Facebook className="w-4 h-4" />
                      <span>Facebook</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLikeStory(selectedBlog.id)}
                      className={`flex items-center space-x-1 ${
                        likedPosts.has(selectedBlog.id)
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedPosts.has(selectedBlog.id) ? "fill-current" : ""
                        }`}
                      />
                      <span>
                        {likedPosts.has(selectedBlog.id) ? "Liked" : "Like"} (
                        {selectedBlog.likes})
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Comments ({selectedBlog.comments})
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowComments(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Add Comment Form */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                        <div className="flex-1">
                          <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this story..."
                            rows={3}
                            className="mb-2"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => addComment(selectedBlog.id)}
                              disabled={!newComment.trim()}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(comments[selectedBlog.id] || []).map((comment) => (
                        <div
                          key={comment.id}
                          className="border-b border-gray-100 pb-4"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.date).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">
                                {comment.content}
                              </p>
                              <button
                                onClick={() => setReplyTo(comment.id)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                              >
                                <Reply className="w-3 h-3" />
                                <span>Reply</span>
                              </button>

                              {/* Reply Form */}
                              {replyTo === comment.id && (
                                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                  <div className="flex items-start space-x-2">
                                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                      U
                                    </div>
                                    <div className="flex-1">
                                      <Textarea
                                        value={replyContent}
                                        onChange={(e) =>
                                          setReplyContent(e.target.value)
                                        }
                                        placeholder="Write a reply..."
                                        rows={2}
                                        className="mb-2 text-sm"
                                      />
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setReplyTo(null);
                                            setReplyContent("");
                                          }}
                                          className="text-xs"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            addReply(
                                              selectedBlog.id,
                                              comment.id,
                                            )
                                          }
                                          disabled={!replyContent.trim()}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                                        >
                                          <Send className="w-3 h-3 mr-1" />
                                          Reply
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Replies */}
                              {comment.replies.length > 0 && (
                                <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                                  {comment.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="flex items-start space-x-2"
                                    >
                                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {reply.author.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-gray-900 text-sm">
                                            {reply.author}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(
                                              reply.date,
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                          {reply.content}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty State */}
                      {(!comments[selectedBlog.id] ||
                        comments[selectedBlog.id].length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">No comments yet</p>
                          <p className="text-sm">
                            Be the first to share your thoughts!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
