import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ImageVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images?: string[];
  videos?: string[];
  heroImage?: string;
}

export default function ImageVideoModal({ 
  isOpen, 
  onClose, 
  title, 
  images = [], 
  videos = [], 
  heroImage 
}: ImageVideoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Combine all media items
  const allMedia = [
    ...(heroImage ? [{ type: 'image', url: heroImage }] : []),
    ...images.map(url => ({ type: 'image', url })),
    ...videos.map(url => ({ type: 'video', url }))
  ];

  const currentMedia = allMedia[currentIndex];

  // Reset state when modal opens with new content
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsVideoPlaying(false);
      setIsMuted(false);
      console.log('Modal opened for:', title, 'with media:', allMedia);
    }
  }, [isOpen, title, heroImage, images, videos]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allMedia.length - 1));
    setIsVideoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : 0));
    setIsVideoPlaying(false);
  };

  const handleVideoPlay = () => {
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

  const handleMuteToggle = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isOpen || allMedia.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          {allMedia.length > 1 && (
            <p className="text-sm text-gray-600 mt-2">
              {currentIndex + 1} of {allMedia.length}
            </p>
          )}
        </DialogHeader>

        <div className="relative bg-black">
          {/* Media Display */}
          <div className="relative h-96 md:h-[500px] lg:h-[600px] flex items-center justify-center">
            {currentMedia?.type === 'image' ? (
              <img
                src={currentMedia.url}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <video
                ref={setVideoRef}
                src={currentMedia?.url}
                className="max-w-full max-h-full object-contain rounded-lg"
                onEnded={handleVideoEnded}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                controls={false}
                muted={isMuted}
              />
            )}

            {/* Video Controls Overlay */}
            {currentMedia?.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVideoPlay}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMuteToggle}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full w-12 h-12 p-0 shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full w-12 h-12 p-0 shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {allMedia.length > 1 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsVideoPlaying(false);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex
                        ? 'border-emerald-500 shadow-lg scale-105'
                        : 'border-gray-300 hover:border-gray-400 hover:scale-102'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`${title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
