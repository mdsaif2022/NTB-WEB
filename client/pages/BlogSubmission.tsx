import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Send,
  AlertCircle,
  CheckCircle,
  Play,
} from "lucide-react";
import { useBlogs } from "@/contexts/BlogContext";
import { useUser } from "@/contexts/UserContext";

const categories = [
  "Adventure",
  "Culture",
  "Beach",
  "History",
  "Nature",
  "Food",
  "Wildlife",
  "Photography",
  "Budget Travel",
  "Luxury Travel",
];

const destinations = [
  "Sundarbans",
  "Cox's Bazar",
  "Srimangal",
  "Sylhet",
  "Chittagong Hill Tracts",
  "Rangamati",
  "Bandarban",
  "Kuakata",
  "Saint Martin's Island",
  "Paharpur",
  "Mahasthangarh",
  "Old Dhaka",
];

export default function BlogSubmission() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    destination: "",
    content: "",
    tags: [] as string[],
    images: [] as File[],
    videos: [] as File[],
  });

  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addBlogPost } = useBlogs();
  const { userProfile, setUserProfile, currentUser } = useUser();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          `${file.name} is not a valid image format. Please use JPG, PNG, or GIF.`,
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Please use images under 5MB.`);
        return false;
      }
      return true;
    });

    if (formData.images.length + validFiles.length > 5) {
      alert("You can upload maximum 5 images per blog post.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate video files
    const validFiles = files.filter((file) => {
      const allowedTypes = [
        "video/mp4",
        "video/mov",
        "video/avi",
        "video/mkv",
        "video/webm",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          `${file.name} is not a valid video format. Please use MP4, MOV, AVI, MKV, or WebM.`,
        );
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit for videos
        alert(`${file.name} is too large. Please use videos under 50MB.`);
        return false;
      }
      return true;
    });

    if (formData.videos.length + validFiles.length > 3) {
      alert("You can upload maximum 3 videos per blog post.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, ...validFiles],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      if (formData.tags.length >= 8) {
        alert("Maximum 8 tags allowed");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.destination)
      newErrors.destination = "Destination is required";
    if (!formData.content.trim() || formData.content.trim().length < 100) {
      newErrors.content = "Content must be at least 100 characters";
    }
    if (formData.tags.length === 0)
      newErrors.tags = "At least one tag is required";

    setErrors(newErrors);

    // Debug: Log validation results
    console.log("Form validation:", {
      hasErrors: Object.keys(newErrors).length > 0,
      errors: newErrors,
      formData: {
        title: formData.title,
        category: formData.category,
        destination: formData.destination,
        contentLength: formData.content.length,
        tagsCount: formData.tags.length,
      },
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission started");
    console.log("Current form data:", formData);

    // Clear previous errors
    setErrors({});

    if (!validateForm()) {
      console.log("Form validation failed");
      // Scroll to first error
      const firstErrorElement = document.querySelector(".border-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    console.log("Form validation passed, submitting...");
    setIsSubmitting(true);

    try {
      // Simulate API submission with more realistic timing
      console.log("Sending data to server...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Actually add the blog post
      const newPost = addBlogPost({
        title: formData.title,
        author: {
          name: currentUser?.firstName + " " + currentUser?.lastName,
          email: currentUser?.email || "",
          avatar: currentUser?.profilePhoto || null,
        },
        content: formData.content,
        excerpt: formData.content.slice(0, 120),
        status: "pending",
        category: formData.category,
        readTime: Math.max(1, Math.round(formData.content.length / 250)),
        likes: 0,
        comments: 0,
        views: 0,
        images: [], // You can add image upload logic if needed
        tags: formData.tags,
      });
      // Add to user profile pendingBlogs
      if (setUserProfile && userProfile && newPost?.id) {
        setUserProfile({
          ...userProfile,
          pendingBlogs: [...userProfile.pendingBlogs, newPost.id],
      });
      }
      setSubmitted(true);
      console.log("Submission state updated, showing success page");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                Story Submitted Successfully!
              </h2>

              <p className="text-gray-600 mb-6">
                Thank you for sharing your travel experience! Your blog post has
                been submitted for review. Our admin team will review it and
                publish it within 24-48 hours.
              </p>

              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-emerald-900 mb-2">
                      What happens next?
                    </h3>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>
                        • Admin will review your content for quality and
                        guidelines
                      </li>
                      <li>
                        • You'll receive an email notification about the status
                      </li>
                      <li>
                        • Once approved, your story will be published on our
                        blog
                      </li>
                      <li>
                        • Your story will be visible to thousands of travelers
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  asChild
                >
                  <Link to="/blog">View All Stories</Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      title: "",
                      category: "",
                      destination: "",
                      content: "",
                      tags: [],
                      images: [],
                      videos: [],
                    });
                  }}
                >
                  Submit Another Story
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">
                  Share Your Travel Story
                </h1>
                <p className="text-emerald-600">
                  Inspire others with your Bangladesh travel experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Validation Error Summary */}
            {Object.keys(errors).length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">
                        Please fix the following errors:
                      </h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field}>• {message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Story Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Story Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g., My Magical Journey Through the Sundarbans"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="destination">Main Destination *</Label>
                      <Select
                        value={formData.destination}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            destination: value,
                          }))
                        }
                      >
                        <SelectTrigger
                          className={errors.destination ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map((destination) => (
                            <SelectItem key={destination} value={destination}>
                              {destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.destination && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.destination}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Your Story *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Share your travel experience, tips, and memorable moments..."
                      rows={12}
                      className={errors.content ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.content && (
                        <p className="text-red-500 text-sm">{errors.content}</p>
                      )}
                      <p className="text-gray-500 text-sm text-right">
                        {formData.content.length} characters (minimum 100)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Media & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <Label htmlFor="images">Images (Optional, max 5)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload travel photos to make your story more engaging
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Supports JPG, PNG, GIF (max 5MB each)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("images")?.click()
                        }
                      >
                        Choose Images
                      </Button>
                    </div>

                    {/* Uploaded Images */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {file.name}
                            </p>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <Label htmlFor="videos">Videos (Optional, max 3)</Label>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="videos"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your enjoyable travel moments and experiences
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Supports MP4, MOV, AVI, MKV, WebM (max 50MB each)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("videos")?.click()
                        }
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Videos
                      </Button>
                    </div>

                    {/* Uploaded Videos */}
                    {formData.videos.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {formData.videos.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-32 bg-purple-100 rounded-lg flex flex-col items-center justify-center border-2 border-purple-200">
                              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-2">
                                <Play className="w-6 h-6 text-purple-600" />
                              </div>
                              <p className="text-xs text-purple-600 font-medium">
                                Video File
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {file.name}
                            </p>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeVideo(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Video className="w-3 h-3 mr-1" />
                      <span>{formData.videos.length}/3 videos uploaded</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label htmlFor="tags">
                      Tags * (help people find your story)
                    </Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="e.g., wildlife, photography, adventure"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className={errors.tags ? "border-red-500" : ""}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        Add
                      </Button>
                    </div>

                    {errors.tags && (
                      <p className="text-red-500 text-sm mb-2">{errors.tags}</p>
                    )}

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            #{tag}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {formData.tags.length}/8 tags
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log("Submit button clicked");
                  // The form onSubmit will handle the actual submission
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting Story...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Your Story
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Progress */}
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-900 mb-3">
                    Form Progress:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Title:</span>
                      <span
                        className={
                          formData.title.trim()
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {formData.title.trim() ? "✓" : "○"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Category:</span>
                      <span
                        className={
                          formData.category ? "text-green-600" : "text-gray-400"
                        }
                      >
                        {formData.category ? "✓" : "○"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Destination:</span>
                      <span
                        className={
                          formData.destination
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {formData.destination ? "✓" : "○"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Content (100+ chars):</span>
                      <span
                        className={
                          formData.content.length >= 100
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {formData.content.length >= 100
                          ? "✓"
                          : `${formData.content.length}/100`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tags (1+ required):</span>
                      <span
                        className={
                          formData.tags.length > 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {formData.tags.length > 0 ? "✓" : "○"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-2">
                    Content Requirements:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Minimum 100 characters</li>
                    <li>• Must be about Bangladesh travel</li>
                    <li>• Include personal experiences and tips</li>
                    <li>• Write in English or Bengali</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-900 mb-2">
                    Image Guidelines:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Maximum 5 images per story</li>
                    <li>• JPG, PNG, GIF formats only</li>
                    <li>• Each image under 5MB</li>
                    <li>• High quality photos preferred</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-900 mb-2">
                    Video Guidelines:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Maximum 3 videos per story</li>
                    <li>• MP4, MOV, AVI, MKV, WebM formats</li>
                    <li>• Each video under 50MB</li>
                    <li>• Share your enjoyable travel moments</li>
                    <li>• Keep videos under 2 minutes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-900 mb-2">
                    Review Process:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Stories reviewed within 24-48 hours</li>
                    <li>• Email notification on status</li>
                    <li>• Published stories featured in blog</li>
                    <li>• Author credit always given</li>
                  </ul>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-xs text-emerald-800">
                    <strong>Note:</strong> Only verified users can submit blog
                    posts. Make sure you're logged in with a verified account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
