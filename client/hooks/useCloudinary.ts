import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import CloudinaryService, { CloudinaryUploadResult, CloudinaryUploadOptions } from '@/lib/cloudinary';
import { CloudinaryUtils } from '@/lib/cloudinary';

// Hook for file upload
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<CloudinaryUploadResult[]>([]);
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

  const uploadFile = useCallback(async (
    file: File,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult | null> => {
    setUploading(true);
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[file.name];
      return newErrors;
    });

    try {
      const result = await CloudinaryService.uploadFile(file, options);
      setUploadResults(prev => [...prev, result]);
      toast.success(`${file.name} uploaded successfully!`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadErrors(prev => ({ ...prev, [file.name]: errorMessage }));
      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult[]> => {
    setUploading(true);
    const results: CloudinaryUploadResult[] = [];

    try {
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await CloudinaryService.uploadFile(file, options);
          results.push(result);
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setUploadErrors(prev => ({ ...prev, [file.name]: errorMessage }));
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      setUploadResults(prev => [...prev, ...results]);
      toast.success(`${files.length} files uploaded successfully!`);
    } catch (error) {
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }

    return results;
  }, []);

  const clearResults = useCallback(() => {
    setUploadResults([]);
    setUploadErrors({});
    setUploadProgress({});
  }, []);

  const removeResult = useCallback((index: number) => {
    setUploadResults(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadResults,
    uploadErrors,
    uploadFile,
    uploadMultipleFiles,
    clearResults,
    removeResult
  };
};

// Hook for media gallery
export const useMediaGallery = (options: {
  folder?: string;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'all';
  maxResults?: number;
} = {}) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadMediaItems = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const searchOptions: any = {
        max_results: options.maxResults || 20,
        sort_by: [{ created_at: 'desc' }]
      };

      if (options.folder) {
        searchOptions.folder = options.folder;
      }

      if (options.tags && options.tags.length > 0) {
        searchOptions.tags = options.tags;
      }

      if (options.resourceType !== 'all') {
        searchOptions.resource_type = options.resourceType;
      }

      if (!reset && nextCursor) {
        searchOptions.next_cursor = nextCursor;
      }

      const result = await CloudinaryService.searchFiles(searchOptions);
      
      if (reset) {
        setMediaItems(result.resources || []);
      } else {
        setMediaItems(prev => [...prev, ...(result.resources || [])]);
      }

      setNextCursor(result.next_cursor || null);
      setHasMore(!!result.next_cursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media items';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.folder, options.tags, options.resourceType, options.maxResults, nextCursor]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMediaItems(false);
    }
  }, [hasMore, loading, loadMediaItems]);

  const refresh = useCallback(() => {
    setNextCursor(null);
    setHasMore(false);
    loadMediaItems(true);
  }, [loadMediaItems]);

  const deleteMediaItem = useCallback(async (publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') => {
    try {
      await CloudinaryService.deleteFile(publicId, resourceType);
      setMediaItems(prev => prev.filter(item => item.public_id !== publicId));
      toast.success('Media item deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media item';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadMediaItems(true);
  }, [options.folder, options.tags, options.resourceType]);

  return {
    mediaItems,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    deleteMediaItem
  };
};

// Hook for image optimization
export const useImageOptimization = () => {
  const getOptimizedImageUrl = useCallback((
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'jpg' | 'png' | 'webp';
      crop?: 'scale' | 'fit' | 'fill' | 'lfill' | 'limit' | 'mfit' | 'mpad' | 'pad' | 'crop' | 'thumb' | 'auto';
      gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
    } = {}
  ) => {
    return CloudinaryService.getOptimizedImageUrl(publicId, options);
  }, []);

  const getResponsiveImageUrls = useCallback((publicId: string) => {
    return CloudinaryService.getResponsiveImageUrls(publicId);
  }, []);

  const getThumbnailUrl = useCallback((publicId: string, size: number = 150) => {
    return CloudinaryService.getThumbnailUrl(publicId, size);
  }, []);

  return {
    getOptimizedImageUrl,
    getResponsiveImageUrls,
    getThumbnailUrl
  };
};

// Hook for video management
export const useVideoManagement = () => {
  const getVideoUrl = useCallback((
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'mp4' | 'webm';
      bit_rate?: number;
    } = {}
  ) => {
    return CloudinaryService.getVideoUrl(publicId, options);
  }, []);

  const getVideoThumbnail = useCallback((publicId: string, time: number = 1) => {
    return CloudinaryService.getVideoThumbnail(publicId, time);
  }, []);

  return {
    getVideoUrl,
    getVideoThumbnail
  };
};

// Hook for file validation
export const useFileValidation = () => {
  const validateFile = useCallback((
    file: File,
    options: {
      allowedTypes?: string[];
      maxSizeInMB?: number;
      minSizeInMB?: number;
    } = {}
  ) => {
    const errors: string[] = [];

    // Check file type
    if (options.allowedTypes && !CloudinaryUtils.validateFileType(file, options.allowedTypes)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file size
    if (options.maxSizeInMB && !CloudinaryUtils.validateFileSize(file, options.maxSizeInMB)) {
      errors.push(`File size exceeds ${options.maxSizeInMB}MB limit`);
    }

    if (options.minSizeInMB) {
      const minSizeInBytes = options.minSizeInMB * 1024 * 1024;
      if (file.size < minSizeInBytes) {
        errors.push(`File size must be at least ${options.minSizeInMB}MB`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateMultipleFiles = useCallback((
    files: File[],
    options: {
      allowedTypes?: string[];
      maxSizeInMB?: number;
      minSizeInMB?: number;
      maxFiles?: number;
    } = {}
  ) => {
    const errors: string[] = [];

    // Check number of files
    if (options.maxFiles && files.length > options.maxFiles) {
      errors.push(`Maximum ${options.maxFiles} files allowed`);
    }

    // Validate each file
    files.forEach((file, index) => {
      const validation = validateFile(file, options);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          errors.push(`File ${index + 1} (${file.name}): ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validateFile]);

  return {
    validateFile,
    validateMultipleFiles
  };
};

// Hook for drag and drop
export const useDragAndDrop = (
  onFilesDropped: (files: File[]) => void,
  options: {
    accept?: string[];
    maxFiles?: number;
    disabled?: boolean;
  } = {}
) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (options.disabled) return;
    
    setDragCounter(prev => prev + 1);
    if (dragCounter === 0) {
      setIsDragOver(true);
    }
  }, [dragCounter, options.disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (options.disabled) return;
    
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  }, [dragCounter, options.disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (options.disabled) return;
    
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    
    if (options.maxFiles && files.length > options.maxFiles) {
      toast.error(`Maximum ${options.maxFiles} files allowed`);
      return;
    }

    if (options.accept) {
      const validFiles = files.filter(file => 
        options.accept!.some(type => file.type.includes(type))
      );
      
      if (validFiles.length !== files.length) {
        toast.error('Some files have invalid types');
      }
      
      if (validFiles.length > 0) {
        onFilesDropped(validFiles);
      }
    } else {
      onFilesDropped(files);
    }
  }, [onFilesDropped, options]);

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
};

// Hook for media search
export const useMediaSearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchMedia = useCallback(async (query: string, options: {
    folder?: string;
    tags?: string[];
    resourceType?: 'image' | 'video' | 'raw' | 'all';
    maxResults?: number;
  } = {}) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      const searchOptions: any = {
        expression: query,
        max_results: options.maxResults || 20,
        sort_by: [{ created_at: 'desc' }]
      };

      if (options.folder) {
        searchOptions.folder = options.folder;
      }

      if (options.tags && options.tags.length > 0) {
        searchOptions.tags = options.tags;
      }

      if (options.resourceType !== 'all') {
        searchOptions.resource_type = options.resourceType;
      }

      const result = await CloudinaryService.searchFiles(searchOptions);
      setSearchResults(result.resources || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setSearchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    searchMedia,
    clearSearch
  };
};

export default {
  useFileUpload,
  useMediaGallery,
  useImageOptimization,
  useVideoManagement,
  useFileValidation,
  useDragAndDrop,
  useMediaSearch
};
