# Cloudinary Configuration Instructions

## ✅ Your Cloudinary Credentials

Your Cloudinary account is now configured with the following credentials:

- **Cloud Name**: `dxijk3ivo`
- **API Key**: `155419187991824`
- **API Secret**: `ClE7gZfBykyHUs2l2Gz3RVc8wZ0`

## 🔧 Setup Instructions

### 1. Create Environment File

Create a file named `.env.local` in your project root with the following content:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dxijk3ivo
VITE_CLOUDINARY_API_KEY=155419187991824
VITE_CLOUDINARY_API_SECRET=ClE7gZfBykyHUs2l2Gz3RVc8wZ0

# Development Environment
NODE_ENV=development
```

### 2. Install Dependencies

Run the following command to install Cloudinary:

```bash
npm install
```

### 3. Test Your Configuration

Your Cloudinary is now ready to use! Here's how to test it:

#### Option 1: Use the Example Component
```typescript
import CloudinaryExample from '@/components/CloudinaryExample';

// Add this to your app to test all Cloudinary features
<CloudinaryExample />
```

#### Option 2: Test Basic Upload
```typescript
import { useFileUpload } from '@/hooks/useCloudinary';

function TestUpload() {
  const { uploadFile } = useFileUpload();
  
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const result = await uploadFile(file, {
        folder: 'test-uploads',
        tags: ['test']
      });
      console.log('Upload result:', result);
    }
  };
  
  return (
    <input 
      type="file" 
      onChange={handleFileSelect}
      accept="image/*"
    />
  );
}
```

## 🚀 Quick Start Examples

### Upload Tour Images
```typescript
import FileUpload from '@/components/FileUpload';

<FileUpload
  onUploadComplete={(result) => {
    console.log('Tour image uploaded:', result.secure_url);
    // Add this URL to your tour data
  }}
  folder="tours"
  tags={['tour', 'gallery']}
  accept="image/*"
  maxFileSize={10}
/>
```

### Display Optimized Images
```typescript
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  publicId="tours/your-image-id"
  alt="Tour Image"
  width={800}
  height={600}
  quality="auto"
  responsive={true}
/>
```

### Browse Media Gallery
```typescript
import MediaGallery from '@/components/MediaGallery';

<MediaGallery
  onSelect={(item) => {
    console.log('Selected media:', item);
  }}
  folder="tours"
  resourceType="image"
/>
```

## 📁 Recommended Folder Structure

Set up these folders in your Cloudinary account:

```
dxijk3ivo/
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

## 🔐 Security Notes

1. **Never commit `.env.local`** to version control
2. **Use different accounts** for development and production
3. **Rotate API keys** regularly
4. **Set up upload restrictions** in Cloudinary dashboard

## 🧪 Testing Checklist

- [ ] Environment file created
- [ ] Dependencies installed
- [ ] Test file upload
- [ ] Test image optimization
- [ ] Test media gallery
- [ ] Verify folder structure

## 📞 Support

If you encounter any issues:

1. Check your Cloudinary dashboard for uploads
2. Verify environment variables are loaded
3. Check browser console for errors
4. Ensure file types and sizes are within limits

Your Cloudinary integration is now ready to use! 🎉
