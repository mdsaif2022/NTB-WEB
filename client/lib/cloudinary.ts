import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxijk3ivo',
  api_key: process.env.VITE_CLOUDINARY_API_KEY || '155419187991824',
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET || 'ClE7gZfBykyHUs2l2Gz3RVc8wZ0',
  secure: true
};

// Initialize Cloudinary
cloudinary.config(cloudinaryConfig);

// Types for Cloudinary operations
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: 'image' | 'video' | 'raw';
  folder?: string;
  tags?: string[];
}

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: any;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'mp4' | 'webm';
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  eager?: any[];
  eager_async?: boolean;
  use_filename?: boolean;
  unique_filename?: boolean;
  overwrite?: boolean;
  invalidate?: boolean;
  public_id?: string;
}

export interface CloudinaryDeleteResult {
  result: string;
  deleted: {
    [key: string]: string;
  };
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'lfill' | 'limit' | 'mfit' | 'mpad' | 'pad' | 'crop' | 'thumb' | 'auto';
  gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'mp4' | 'webm';
  effect?: string;
  radius?: number;
  border?: string;
  background?: string;
  opacity?: number;
  angle?: number;
  flags?: string[];
}

// Cloudinary Service Class
export class CloudinaryService {
  // Upload file to Cloudinary
  static async uploadFile(
    file: File | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || 'narayanganj-traveller',
        tags: options.tags || [],
        resource_type: options.resource_type || 'auto',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
        use_filename: options.use_filename !== false,
        unique_filename: options.unique_filename !== false,
        overwrite: options.overwrite || false,
        invalidate: options.invalidate || true,
        ...options
      };

      const result = await cloudinary.uploader.upload(file, uploadOptions);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
        resource_type: result.resource_type as 'image' | 'video' | 'raw',
        folder: result.folder,
        tags: result.tags
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    files: File[],
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete file from Cloudinary
  static async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<CloudinaryDeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true
      });
      
      return {
        result: result.result,
        deleted: result.deleted || {}
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete multiple files
  static async deleteMultipleFiles(publicIds: string[], resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<CloudinaryDeleteResult[]> {
    try {
      const deletePromises = publicIds.map(publicId => this.deleteFile(publicId, resourceType));
      return await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cloudinary multiple delete error:', error);
      throw new Error(`Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate transformed URL
  static getTransformedUrl(
    publicId: string,
    transformations: CloudinaryTransformOptions = {},
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): string {
    try {
      return cloudinary.url(publicId, {
        resource_type: resourceType,
        ...transformations
      });
    } catch (error) {
      console.error('Cloudinary URL generation error:', error);
      throw new Error(`Failed to generate URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get optimized image URL for different use cases
  static getOptimizedImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    crop?: 'scale' | 'fit' | 'fill' | 'lfill' | 'limit' | 'mfit' | 'mpad' | 'pad' | 'crop' | 'thumb' | 'auto';
    gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  } = {}): string {
    return this.getTransformedUrl(publicId, {
      width: options.width,
      height: options.height,
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      crop: options.crop || 'auto',
      gravity: options.gravity || 'auto'
    }, 'image');
  }

  // Get thumbnail URL
  static getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      gravity: 'face',
      quality: 'auto',
      format: 'auto'
    });
  }

  // Get responsive image URLs for different screen sizes
  static getResponsiveImageUrls(publicId: string): {
    mobile: string;
    tablet: string;
    desktop: string;
    original: string;
  } {
    return {
      mobile: this.getOptimizedImageUrl(publicId, { width: 400, quality: 'auto' }),
      tablet: this.getOptimizedImageUrl(publicId, { width: 800, quality: 'auto' }),
      desktop: this.getOptimizedImageUrl(publicId, { width: 1200, quality: 'auto' }),
      original: this.getOptimizedImageUrl(publicId, { quality: 'auto' })
    };
  }

  // Get video thumbnail
  static getVideoThumbnail(publicId: string, time: number = 1): string {
    return this.getTransformedUrl(publicId, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'jpg'
    }, 'video') + `&t=${time}`;
  }

  // Get video URL with transformations
  static getVideoUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'mp4' | 'webm';
    bit_rate?: number;
  } = {}): string {
    return this.getTransformedUrl(publicId, {
      width: options.width,
      height: options.height,
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      bit_rate: options.bit_rate
    }, 'video');
  }

  // Search files in Cloudinary
  static async searchFiles(options: {
    expression?: string;
    max_results?: number;
    next_cursor?: string;
    sort_by?: Array<{ [key: string]: string }>;
    tags?: string[];
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw';
  } = {}): Promise<any> {
    try {
      const result = await cloudinary.search
        .expression(options.expression || '')
        .max_results(options.max_results || 20)
        .next_cursor(options.next_cursor)
        .sort_by(options.sort_by || [{ created_at: 'desc' }])
        .execute();

      return result;
    } catch (error) {
      console.error('Cloudinary search error:', error);
      throw new Error(`Failed to search files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file details
  static async getFileDetails(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Cloudinary get file details error:', error);
      throw new Error(`Failed to get file details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create folder
  static async createFolder(folderName: string): Promise<any> {
    try {
      // Cloudinary doesn't have a direct folder creation API
      // Folders are created automatically when you upload files to them
      return { success: true, message: 'Folder will be created when files are uploaded to it' };
    } catch (error) {
      console.error('Cloudinary create folder error:', error);
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get folder contents
  static async getFolderContents(folderName: string, options: {
    max_results?: number;
    next_cursor?: string;
  } = {}): Promise<any> {
    try {
      const result = await cloudinary.search
        .expression(`folder:${folderName}`)
        .max_results(options.max_results || 20)
        .next_cursor(options.next_cursor)
        .execute();

      return result;
    } catch (error) {
      console.error('Cloudinary get folder contents error:', error);
      throw new Error(`Failed to get folder contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Utility functions
export const CloudinaryUtils = {
  // Extract public ID from Cloudinary URL
  extractPublicId: (url: string): string | null => {
    const match = url.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi)$/i);
    return match ? match[1] : null;
  },

  // Check if URL is a Cloudinary URL
  isCloudinaryUrl: (url: string): boolean => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  },

  // Get file type from URL
  getFileType: (url: string): 'image' | 'video' | 'unknown' => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    const videoExtensions = /\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i;
    
    if (imageExtensions.test(url)) return 'image';
    if (videoExtensions.test(url)) return 'video';
    return 'unknown';
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  // Validate file size
  validateFileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
};

export default CloudinaryService;
