import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { RTDBService, Ad } from '@/lib/rtdb';
import { Button } from '@/components/ui/button';

interface AdBannerProps {
  position: 'hero-top' | 'hero-bottom' | 'sidebar' | 'footer';
  className?: string;
}

export default function AdBanner({ position, className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const activeAds = await RTDBService.getActiveAds(position);
        setAds(activeAds);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading ads:', error);
        setIsLoading(false);
      }
    };

    loadAds();
  }, [position]);

  // Auto-rotate ads every 5 seconds
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const handleAdClick = (ad: Ad) => {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if no ads or loading
  if (isLoading || ads.length === 0 || !isVisible) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('top') ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.includes('top') ? -50 : 50 }}
          transition={{ duration: 0.5 }}
          className={`relative ${className}`}
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden shadow-lg">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Ad content */}
            <div
              className="flex items-center p-4 cursor-pointer"
              onClick={() => handleAdClick(currentAd)}
            >
              {/* Ad image */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden mr-4">
                <img
                  src={currentAd.imageUrl}
                  alt={currentAd.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ad text */}
              <div className="flex-1 text-white">
                <h3 className="font-semibold text-lg mb-1">{currentAd.title}</h3>
                {currentAd.description && (
                  <p className="text-sm opacity-90">{currentAd.description}</p>
                )}
              </div>

              {/* External link icon */}
              {currentAd.linkUrl && (
                <div className="flex-shrink-0 ml-4">
                  <ExternalLink className="w-5 h-5 text-white opacity-70" />
                </div>
              )}
            </div>

            {/* Ad indicator dots */}
            {ads.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {ads.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentAdIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Ad label */}
            <div className="absolute top-2 left-2 bg-black/20 text-white text-xs px-2 py-1 rounded">
              Advertisement
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}