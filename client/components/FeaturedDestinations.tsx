import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star, Play, Image as ImageIcon, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useTours } from "@/contexts/TourContext";
import { motion } from "framer-motion";
import ImageVideoModal from "./ImageVideoModal";

export default function FeaturedDestinations() {
  const { tours: allTours, getActiveTours } = useTours();
  const destinations = getActiveTours().slice(0, 4); // Show first 4 active tours
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug information
  useEffect(() => {
    console.log("FeaturedDestinations updated:", {
      totalTours: allTours.length,
      activeTours: getActiveTours().length,
      featuredCount: destinations.length,
    });
  }, [allTours, destinations.length]);

  const handleImageClick = (destination: any) => {
    console.log('Clicked on destination:', destination.name, 'with media:', {
      images: destination.images,
      videos: destination.videos,
      heroImage: destination.heroImage
    });
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDestination(null);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-emerald-900 mb-4">
            Featured Destinations
          </h2>
          <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
            Discover Bangladesh's most breathtaking locations, from pristine
            beaches to ancient forests and historical landmarks
          </p>
        </div>

        {/* Destinations Grid */}
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    {/* Enhanced Image/Video Preview */}
                    {destination.heroImage || (destination.images && destination.images.length > 0) ? (
                      <div 
                        className="relative w-full h-64 cursor-pointer"
                        onClick={() => handleImageClick(destination)}
                      >
                        <img
                          src={destination.heroImage || destination.images[0]}
                          alt={destination.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Overlay with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Video indicator */}
                        {destination.videos && destination.videos.length > 0 && (
                          <div className="absolute top-4 right-16 bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Video className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        {/* Image count indicator */}
                        {destination.images && destination.images.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                            <ImageIcon className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">{destination.images.length}</span>
                          </div>
                        )}
                        
                        {/* Play button for videos */}
                        {destination.videos && destination.videos.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                          </div>
                        )}
                        
                        {/* Click to view overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                            <span className="text-white text-sm font-medium">Click to view</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500">
                        {destination.image}
                      </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      ৳{destination.price.toLocaleString()}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                      <span className="font-semibold text-sm">
                        {destination.rating}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                        {destination.name}
                      </h3>
                    </div>

                    <div className="flex items-center text-emerald-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {destination.location}
                      </span>
                      <Clock className="w-4 h-4 ml-4 mr-1" />
                      <span className="text-sm font-medium">
                        {destination.duration}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {destination.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {destination.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full hover:bg-emerald-200 transition-colors duration-200"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      asChild
                    >
                      <Link to={`/booking?tour=${destination.id}`}>Book Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Featured Destinations Available
            </h3>
            <p className="text-gray-500 mb-4">
              We're currently updating our destinations. Check back soon!
            </p>
            <p className="text-sm text-gray-400">
              Active tours: {getActiveTours().length} | Total: {allTours.length}
            </p>
          </div>
        )}

        {/* View All Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-8 py-4 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            asChild
          >
            <Link to="/tours">View All Destinations</Link>
          </Button>
        </motion.div>
      </div>

      {/* Image/Video Modal */}
      {selectedDestination && (
        <ImageVideoModal
          key={selectedDestination.id}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedDestination.name}
          images={selectedDestination.images}
          videos={selectedDestination.videos}
          heroImage={selectedDestination.heroImage}
        />
      )}
    </section>
  );
}
