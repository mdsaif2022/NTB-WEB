import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import AdBanner from '@/components/AdBanner';

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us - Explore Bangladesh</title>
        <meta name="description" content="Contact Explore Bangladesh for tour inquiries, support, or partnership opportunities. We're here to help!" />
        <meta property="og:title" content="Contact Us - Explore Bangladesh" />
        <meta property="og:description" content="Contact Explore Bangladesh for tour inquiries, support, or partnership opportunities." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/contact" />
        <meta property="og:image" content="https://yourdomain.com/og-image-contact.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - Explore Bangladesh" />
        <meta name="twitter:description" content="Contact Explore Bangladesh for tour inquiries, support, or partnership opportunities." />
        <meta name="twitter:image" content="https://yourdomain.com/og-image-contact.jpg" />
      </Helmet>
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-emerald-100">
            We're here to help you plan your perfect Bangladesh adventure
          </p>
        </div>
      </section>

      <AdBanner />

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-emerald-900 mb-8">
                Contact Information
              </h2>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-2">
                          Office Address
                        </h3>
                        <p className="text-gray-600">
                          123 Gulshan Avenue
                          <br />
                          Dhaka 1212, Bangladesh
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-2">
                          Phone Numbers
                        </h3>
                        <p className="text-gray-600">
                          +880 1700-000000
                          <br />
                          +880 2-9876543
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-2">
                          Email Address
                        </h3>
                        <p className="text-gray-600">
                          info@explorebd.com
                          <br />
                          support@explorebd.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900 mb-2">
                          Business Hours
                        </h3>
                        <p className="text-gray-600">
                          Mon - Fri: 9:00 AM - 7:00 PM
                          <br />
                          Sat - Sun: 10:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-emerald-900 mb-8">
                    Send us a Message
                  </h2>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-2">
                          First Name
                        </label>
                        <Input
                          placeholder="Enter your first name"
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-2">
                          Last Name
                        </label>
                        <Input
                          placeholder="Enter your last name"
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-2">
                          Phone Number
                        </label>
                        <Input
                          placeholder="Enter your phone number"
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">
                        Subject
                      </label>
                      <Input
                        placeholder="What can we help you with?"
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">
                        Message
                      </label>
                      <Textarea
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-semibold"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
