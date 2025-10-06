import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, Star, RefreshCw, Play, Image as ImageIcon, Video } from "lucide-react";
import { useTours } from "@/contexts/TourContext";
import { Helmet } from 'react-helmet-async';
import AdBanner from '@/components/AdBanner';
import { motion } from 'framer-motion';
import ImageVideoModal from '@/components/ImageVideoModal';

export default function Tours() {
  const { tours: allTours, getActiveTours, refreshTours } = useTours();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [updateStatus, setUpdateStatus] = useState('');
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tours = getActiveTours();

  // Force refresh when tours change
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
    setLastUpdateTime(new Date());
  }, [JSON.stringify(allTours)]); // Use JSON.stringify to detect content changes

  // Listen for tour updates from admin panel
  useEffect(() => {
    const handleToursUpdated = (event: CustomEvent) => {
      console.log("Tours page: Received toursUpdated event", event.detail);
      setRefreshKey((prev) => prev + 1);
      setLastUpdateTime(new Date());
      setUpdateStatus('Real-time update received!');
      setTimeout(() => setUpdateStatus(''), 3000);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'echoForgeTours' && event.newValue) {
        console.log("Tours page: Received storage change event", event.newValue);
        setRefreshKey((prev) => prev + 1);
        setLastUpdateTime(new Date());
        setUpdateStatus('Storage update received!');
        setTimeout(() => setUpdateStatus(''), 3000);
      }
    };

    window.addEventListener('toursUpdated', handleToursUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('toursUpdated', handleToursUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Periodic refresh as fallback (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Tours page: Periodic refresh check");
      refreshTours();
      setRefreshKey((prev) => prev + 1);
      setLastUpdateTime(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshTours]);

  // Debug information
  useEffect(() => {
    console.log("Tours page updated:", {
      totalTours: allTours.length,
      activeTours: tours.length,
      allTours: allTours.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        price: t.price,
      })),
      refreshKey,
      timestamp: new Date().toISOString(),
    });
  }, [allTours, tours, refreshKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      refreshTours();
      setRefreshKey((prev) => prev + 1);
      setLastUpdateTime(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImageClick = (tour: any) => {
    console.log('Clicked on tour:', tour.name, 'with media:', {
      images: tour.images,
      videos: tour.videos,
      heroImage: tour.heroImage
    });
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTour(null);
  };

  return (
    <>
      <Helmet>
        <title>Bangladesh Tours - Book Your Next Adventure</title>
        <meta name="description" content="Browse and book the best tours in Bangladesh. Find your next adventure in Sundarbans, Cox's Bazar, Srimangal, and more!" />
        <meta property="og:title" content="Bangladesh Tours - Book Your Next Adventure" />
        <meta property="og:description" content="Browse and book the best tours in Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/tours" />
        <meta property="og:image" content="https://yourdomain.com/og-image-tours.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bangladesh Tours - Book Your Next Adventure" />
        <meta name="twitter:description" content="Browse and book the best tours in Bangladesh." />
        <meta name="twitter:image" content="https://yourdomain.com/og-image-tours.jpg" />
      </Helmet>
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Discover Bangladesh Tours
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            Choose from our curated selection of authentic Bangladesh
            experiences
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white border-white hover:bg-white hover:text-emerald-700 bg-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Tours'}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-white border-white hover:bg-white hover:text-emerald-700 bg-white/10 backdrop-blur-sm"
            >
              Force Reload
            </Button>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour, index) => (
                <motion.div
                  key={`${tour.id}-${refreshKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border-0 shadow-lg hover:-translate-y-2 group"
                  >
                    {/* Enhanced Image/Video Preview */}
                    <div className="relative h-48 overflow-hidden">
                      {tour.heroImage || (tour.images && tour.images.length > 0) ? (
                        <div 
                          className="relative w-full h-full cursor-pointer"
                          onClick={() => handleImageClick(tour)}
                        >
                          <img
                            src={tour.heroImage || tour.images[0]}
                            alt={tour.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          {/* Overlay with gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Video indicator */}
                          {tour.videos && tour.videos.length > 0 && (
                            <div className="absolute top-4 right-16 bg-black/50 backdrop-blur-sm rounded-full p-2">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          {/* Image count indicator */}
                          {tour.images && tour.images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                              <ImageIcon className="w-3 h-3 text-white" />
                              <span className="text-white text-xs font-medium">{tour.images.length}</span>
                            </div>
                          )}
                          
                          {/* Play button for videos */}
                          {tour.videos && tour.videos.length > 0 && (
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
                        <div className="h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                          {tour.image}
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        ৳{tour.price.toLocaleString()}
                      </div>
                    </div>
                    <CardContent className="p-6 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                          {tour.name}
                        </h3>
                        <div className="flex items-center space-x-1 bg-orange-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                          <span className="text-sm font-semibold text-orange-600">
                            {tour.rating}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-emerald-600 mb-3 space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{tour.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">
                            Max {tour.maxParticipants}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm line-clamp-2 leading-relaxed">
                        {tour.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-emerald-700">
                          ৳{tour.price.toLocaleString()}
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                          asChild
                        >
                          <Link to={`/booking?tour=${tour.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                No Active Tours Available
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We're currently updating our tour offerings. Please check back
                later or contact us for custom tour arrangements.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Total tours in system: {allTours.length}</p>
                <p>Active tours: {tours.length}</p>
                <p>Debug key: {refreshKey}</p>
                <p>Last refresh: {new Date().toLocaleTimeString()}</p>
              </div>
              
              {/* Debug section - show all tours */}
              <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-2xl mx-auto">
                <h4 className="font-semibold text-gray-700 mb-3">Debug: All Tours in System</h4>
                <div className="space-y-2 text-xs">
                  {allTours.map((tour) => (
                    <div key={tour.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">{tour.name}</span>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tour.status === 'active' ? 'bg-green-100 text-green-800' :
                          tour.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tour.status}
                        </span>
                        <span className="text-gray-600">৳{tour.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Features Info */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">
              Easy Booking Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  Select Route
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose your departure and destination from our predefined
                  locations
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  Choose Seats
                </h3>
                <p className="text-gray-600 text-sm">
                  Select your preferred seats from our visual 40-seat layout
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-emerald-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    ৳
                  </div>
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  Pay with bKash
                </h3>
                <p className="text-gray-600 text-sm">
                  Secure payment via bKash with instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Place AdBanner after main tour list/grid */}
      <AdBanner />
      
      {/* Image/Video Modal */}
      {selectedTour && (
        <ImageVideoModal
          key={selectedTour.id}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedTour.name}
          images={selectedTour.images}
          videos={selectedTour.videos}
          heroImage={selectedTour.heroImage}
        />
      )}

      <Footer />
    </>
  );
}
