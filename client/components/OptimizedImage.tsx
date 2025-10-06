import React from 'react';
import { useImageOptimization } from '@/hooks/useCloudinary';

interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  crop?: 'scale' | 'fit' | 'fill' | 'lfill' | 'limit' | 'mfit' | 'mpad' | 'pad' | 'crop' | 'thumb' | 'auto';
  gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  responsive?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  publicId,
  alt,
  width,
  height,
  quality = 'auto',
  crop = 'auto',
  gravity = 'auto',
  className = '',
  loading = 'lazy',
  onClick,
  responsive = false
}) => {
  const { getOptimizedImageUrl, getResponsiveImageUrls } = useImageOptimization();

  if (responsive) {
    const responsiveUrls = getResponsiveImageUrls(publicId);
    
    return (
      <img
        src={responsiveUrls.mobile}
        srcSet={`${responsiveUrls.mobile} 400w, ${responsiveUrls.tablet} 800w, ${responsiveUrls.desktop} 1200w`}
        sizes="(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px"
        alt={alt}
        className={className}
        loading={loading}
        onClick={onClick}
      />
    );
  }

  const imageUrl = getOptimizedImageUrl(publicId, {
    width,
    height,
    quality,
    crop,
    gravity
  });

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading={loading}
      onClick={onClick}
    />
  );
};

export default OptimizedImage;
