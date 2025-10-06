import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Mountain, Waves, Trees } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdBanner from "./AdBanner";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Top Ad Banner */}
      <AdBanner position="hero-top" className="absolute top-4 left-4 right-4 z-20 max-w-4xl mx-auto" />
      
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 z-0">
        {/* Beautiful gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-emerald-800/60 to-green-900/40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-green-800/30" />
        <div className="absolute inset-0 bg-gradient-to-bl from-yellow-900/10 via-transparent to-orange-900/20" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      </div>

      {/* Enhanced Content with Animations */}
      <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-6xl pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="block"
            >
              Discover the
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="block bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent"
            >
              Beauty of Bangladesh
            </motion.span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl text-emerald-50 mb-10 max-w-4xl mx-auto leading-relaxed px-4 font-light"
        >
          From the mystical Sundarbans mangrove forests to the pristine beaches of Cox's Bazar,
          experience the rich culture, heritage, and natural wonders of Bangladesh's diverse ecosystems
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              asChild
            >
              <Link to="/tours">
                <Calendar className="w-6 h-6 mr-3" />
                Book Your Adventure
              </Link>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/80 text-white hover:bg-white hover:text-emerald-700 px-10 py-5 text-xl font-semibold backdrop-blur-sm hover:shadow-white/25 transition-all duration-300 bg-white/10"
              asChild
            >
              <Link to="/tours">
                <MapPin className="w-6 h-6 mr-3" />
                Explore Destinations
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats with Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <Mountain className="w-8 h-8 text-orange-300 mr-3" />
              <div className="text-4xl font-bold text-orange-300">50+</div>
            </div>
            <div className="text-emerald-50 font-medium text-lg">Destinations</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-orange-300 mr-3" />
              <div className="text-4xl font-bold text-orange-300">10K+</div>
            </div>
            <div className="text-emerald-50 font-medium text-lg">Happy Travelers</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl font-bold text-orange-300 mr-3">⭐</div>
              <div className="text-4xl font-bold text-orange-300">5.0</div>
            </div>
            <div className="text-emerald-50 font-medium text-lg">Customer Rating</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center cursor-pointer hover:border-white/80 transition-colors"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-4 bg-white/80 rounded-full mt-3"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
