# Cloudinary Integration Setup Guide

This guide will help you set up Cloudinary for media management in your Narayanganj Traveller BD project.

## 🚀 Quick Setup

### 1. Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to **Dashboard** → **Product Environment Credentials**
3. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret

# Optional: Upload Preset for unsigned uploads
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 4. Install Dependencies

The Cloudinary SDK has already been added to your `package.json`. Run:

```bash
npm install
```

## 📁 File Structure

```
client/
├── lib/
│   └── cloudinary.ts          # Cloudinary service and configuration
├── components/
│   ├── FileUpload.tsx         # File upload component
│   ├── MediaGallery.tsx       # Media gallery component
│   └── CloudinaryExample.tsx  # Example usage component
├── hooks/
│   └── useCloudinary.ts       # Custom hooks for Cloudinary
└── contexts/
    └── RTDBContext.tsx        # Updated to include media URLs
```

## 🔧 Available Components

### FileUpload Component

A comprehensive file upload component with drag-and-drop support:

```typescript
import FileUpload from '@/components/FileUpload';

<FileUpload
  onUploadComplete={(result) => {
    console.log('Upload completed:', result);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
  multiple={true}
  accept="image/*,video/*"
  maxFileSize={10}
  folder="narayanganj-traveller"
  tags={['tour', 'gallery']}
/>
```

**Props:**
- `onUploadComplete`: Callback when upload succeeds
- `onUploadError`: Callback when upload fails
- `multiple`: Allow multiple file selection
- `accept`: Accepted file types
- `maxFileSize`: Maximum file size in MB
- `folder`: Cloudinary folder to upload to
- `tags`: Tags to add to uploaded files

### MediaGallery Component

A media gallery for browsing and managing uploaded files:

```typescript
import MediaGallery from '@/components/MediaGallery';

<MediaGallery
  onSelect={(item) => {
    console.log('Selected media:', item);
  }}
  onDelete={(publicId) => {
    console.log('Deleted:', publicId);
  }}
  folder="narayanganj-traveller"
  resourceType="image"
/>
```

**Props:**
- `onSelect`: Callback when media is selected
- `onDelete`: Callback when media is deleted
- `folder`: Folder to browse
- `tags`: Filter by tags
- `resourceType`: Filter by type (image, video, raw, all)

## 🎣 Custom Hooks

### useFileUpload

Hook for handling file uploads:

```typescript
import { useFileUpload } from '@/hooks/useCloudinary';

const {
  uploading,
  uploadResults,
  uploadErrors,
  uploadFile,
  uploadMultipleFiles,
  clearResults
} = useFileUpload();

// Upload single file
const result = await uploadFile(file, {
  folder: 'tours',
  tags: ['tour-image']
});

// Upload multiple files
const results = await uploadMultipleFiles(files, {
  folder: 'gallery',
  tags: ['gallery']
});
```

### useMediaGallery

Hook for managing media gallery:

```typescript
import { useMediaGallery } from '@/hooks/useCloudinary';

const {
  mediaItems,
  loading,
  error,
  hasMore,
  loadMore,
  refresh,
  deleteMediaItem
} = useMediaGallery({
  folder: 'tours',
  resourceType: 'image',
  maxResults: 20
});
```

### useImageOptimization

Hook for image optimization:

```typescript
import { useImageOptimization } from '@/hooks/useCloudinary';

const {
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  getThumbnailUrl
} = useImageOptimization();

// Get optimized image
const optimizedUrl = getOptimizedImageUrl('public-id', {
  width: 800,
  height: 600,
  quality: 'auto',
  crop: 'fill'
});

// Get responsive URLs
const responsiveUrls = getResponsiveImageUrls('public-id');
// Returns: { mobile, tablet, desktop, original }

// Get thumbnail
const thumbnailUrl = getThumbnailUrl('public-id', 200);
```

### useVideoManagement

Hook for video management:

```typescript
import { useVideoManagement } from '@/hooks/useCloudinary';

const {
  getVideoUrl,
  getVideoThumbnail
} = useVideoManagement();

// Get optimized video
const videoUrl = getVideoUrl('public-id', {
  width: 800,
  height: 600,
  quality: 'auto'
});

// Get video thumbnail
const thumbnailUrl = getVideoThumbnail('public-id', 2);
```

## 🖼️ Image Optimization Examples

### Responsive Images

```typescript
const responsiveUrls = getResponsiveImageUrls('tour-image');

// Use in your component
<img
  src={responsiveUrls.mobile}
  srcSet={`${responsiveUrls.mobile} 400w, ${responsiveUrls.tablet} 800w, ${responsiveUrls.desktop} 1200w`}
  sizes="(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Tour image"
/>
```

### Thumbnails

```typescript
// Get thumbnail for gallery
const thumbnailUrl = getThumbnailUrl('tour-image', 300);

// Get profile picture thumbnail
const profileThumbnail = getThumbnailUrl('profile-pic', 150);
```

### Optimized Images

```typescript
// Get optimized image for different use cases
const heroImage = getOptimizedImageUrl('hero-image', {
  width: 1200,
  height: 600,
  quality: 'auto',
  crop: 'fill',
  gravity: 'auto'
});

const cardImage = getOptimizedImageUrl('card-image', {
  width: 400,
  height: 300,
  quality: 'auto',
  crop: 'fill'
});
```

## 🎥 Video Management Examples

### Video Player

```typescript
const videoUrl = getVideoUrl('tour-video', {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'mp4'
});

<video controls>
  <source src={videoUrl} type="video/mp4" />
</video>
```

### Video Thumbnails

```typescript
// Get thumbnail at 2 seconds
const thumbnailUrl = getVideoThumbnail('tour-video', 2);

<img src={thumbnailUrl} alt="Video thumbnail" />
```

## 🔄 Integration with Firebase RTDB

The Cloudinary integration works seamlessly with your Firebase RTDB. Here's how to use them together:

### Tour Images

```typescript
import { useTours } from '@/hooks/useRTDB';
import { useImageOptimization } from '@/hooks/useCloudinary';

function TourCard({ tourId }) {
  const { tours } = useTours();
  const { getOptimizedImageUrl } = useImageOptimization();
  
  const tour = tours.find(t => t.id === tourId);
  
  return (
    <div>
      <img
        src={getOptimizedImageUrl(tour.images[0], {
          width: 400,
          height: 300,
          quality: 'auto'
        })}
        alt={tour.title}
      />
    </div>
  );
}
```

### Blog Images

```typescript
import { useBlogs } from '@/hooks/useRTDB';
import { useImageOptimization } from '@/hooks/useCloudinary';

function BlogPost({ blogId }) {
  const { blogs } = useBlogs();
  const { getOptimizedImageUrl } = useImageOptimization();
  
  const blog = blogs.find(b => b.id === blogId);
  
  return (
    <article>
      <img
        src={getOptimizedImageUrl(blog.imageUrl, {
          width: 800,
          height: 400,
          quality: 'auto',
          crop: 'fill'
        })}
        alt={blog.title}
      />
    </article>
  );
}
```

## 🛡️ Security Best Practices

### 1. Environment Variables

- Never commit `.env.local` to version control
- Use different Cloudinary accounts for development and production
- Rotate API keys regularly

### 2. Upload Restrictions

```typescript
// Validate file types
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const isValidType = allowedTypes.includes(file.type);

// Validate file size
const maxSize = 10 * 1024 * 1024; // 10MB
const isValidSize = file.size <= maxSize;
```

### 3. Folder Structure

Organize your media with a clear folder structure:

```
narayanganj-traveller/
├── tours/
│   ├── hero-images/
│   ├── gallery/
│   └── thumbnails/
├── blogs/
│   ├── featured-images/
│   └── content-images/
├── users/
│   └── profile-pictures/
└── admin/
    └── banners/
```

## 📱 Usage in Your App

### 1. Add to Tour Creation

```typescript
import FileUpload from '@/components/FileUpload';
import { useTours } from '@/hooks/useRTDB';

function CreateTour() {
  const { createTour } = useTours();
  
  const handleImageUpload = (result) => {
    // Add image URL to tour data
    setTourData(prev => ({
      ...prev,
      images: [...prev.images, result.secure_url]
    }));
  };
  
  return (
    <div>
      <FileUpload
        onUploadComplete={handleImageUpload}
        folder="tours/gallery"
        tags={['tour', 'gallery']}
        accept="image/*"
        maxFileSize={5}
      />
    </div>
  );
}
```

### 2. Add to Blog Creation

```typescript
import FileUpload from '@/components/FileUpload';
import { useBlogs } from '@/hooks/useRTDB';

function CreateBlog() {
  const { createBlog } = useBlogs();
  
  const handleImageUpload = (result) => {
    setBlogData(prev => ({
      ...prev,
      imageUrl: result.secure_url
    }));
  };
  
  return (
    <div>
      <FileUpload
        onUploadComplete={handleImageUpload}
        folder="blogs/featured-images"
        tags={['blog', 'featured']}
        accept="image/*"
        maxFileSize={3}
      />
    </div>
  );
}
```

## 🧪 Testing

### 1. Test Upload Component

```typescript
import CloudinaryExample from '@/components/CloudinaryExample';

// Add this to your app to test all features
<CloudinaryExample />
```

### 2. Test Image Optimization

```typescript
import { useImageOptimization } from '@/hooks/useCloudinary';

function TestOptimization() {
  const { getOptimizedImageUrl } = useImageOptimization();
  
  const testUrl = getOptimizedImageUrl('sample-image', {
    width: 400,
    height: 300,
    quality: 'auto'
  });
  
  return <img src={testUrl} alt="Test" />;
}
```

## 🚀 Next Steps

1. **Set up your Cloudinary account** and get credentials
2. **Add environment variables** to `.env.local`
3. **Test the upload component** with the example
4. **Integrate into your existing forms** (tours, blogs, etc.)
5. **Set up proper folder structure** in Cloudinary
6. **Configure security rules** if needed

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Integration Guide](https://cloudinary.com/documentation/react_integration)
- [Image Optimization Best Practices](https://cloudinary.com/blog/image_optimization_best_practices)

Your Cloudinary integration is now ready to use! You can upload, manage, and optimize images and videos throughout your application.
