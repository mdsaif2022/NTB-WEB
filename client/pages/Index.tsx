import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import Footer from "@/components/Footer";
import AdBanner from '@/components/AdBanner';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Award, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Settings } from "lucide-react";

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Explore Bangladesh Tours - Authentic Experiences</title>
        <meta name="description" content="Book authentic tours and adventures in Bangladesh. Discover Sundarbans, Cox's Bazar, Srimangal, and more!" />
        <meta property="og:title" content="Explore Bangladesh Tours" />
        <meta property="og:description" content="Book authentic tours and adventures in Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Explore Bangladesh Tours" />
        <meta name="twitter:description" content="Book authentic tours and adventures in Bangladesh." />
        <meta name="twitter:image" content="https://yourdomain.com/og-image.jpg" />
      </Helmet>
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturedDestinations />
        <AdBanner />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-emerald-900 mb-4">
              Why Choose Explore BD?
            </h2>
            <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
              We provide authentic, safe, and memorable travel experiences with
              local expertise and personalized service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-4">
                  Expert Guides
                </h3>
                <p className="text-gray-600">
                  Local experts with deep knowledge of Bangladesh's culture,
                  history, and hidden gems
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-4">
                  Safe & Secure
                </h3>
                <p className="text-gray-600">
                  Your safety is our priority with comprehensive insurance and
                  emergency support
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-4">
                  Award Winning
                </h3>
                <p className="text-gray-600">
                  Recognized as Bangladesh's leading tourism company with
                  excellent customer reviews
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 mb-4">
                  24/7 Support
                </h3>
                <p className="text-gray-600">
                  Round-the-clock customer support for a worry-free travel
                  experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-emerald-900 mb-4">
              Travel Stories
            </h2>
            <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
              Read authentic travel experiences shared by fellow explorers and
              get inspired for your next adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "My Journey Through the Sundarbans",
                excerpt:
                  "An unforgettable experience spotting Bengal tigers and exploring the world's largest mangrove forest...",
                author: "Sarah Ahmed",
                date: "2 days ago",
                image: "🐅",
              },
              {
                title: "Sunrise at Cox's Bazar Beach",
                excerpt:
                  "Witnessing the golden sunrise over the world's longest natural beach was truly magical...",
                author: "Rahul Khan",
                date: "5 days ago",
                image: "🌅",
              },
              {
                title: "Tea Gardens of Srimangal",
                excerpt:
                  "Walking through the rolling hills of tea gardens while learning about local tea culture...",
                author: "Maya Begum",
                date: "1 week ago",
                image: "🍃",
              },
            ].map((post, index) => (
              <Card
                key={index}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-6xl">
                  {post.image}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span className="font-medium">{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-8 py-4 font-semibold"
              asChild
            >
              <Link to="/blog">Read All Stories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready for Your Bangladesh Adventure?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the magic of
            Bangladesh with Explore BD. Book your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link to="/tours">Explore Tours</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-sm"
              asChild
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Development Section - Remove in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <section className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Development Tools</h3>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              asChild
            >
              <Link to="/cloudinary-test" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Test Cloudinary Integration</span>
              </Link>
            </Button>
          </div>
        </section>
      )} */}

      <Footer />
    </div>
    </>
  );
}
