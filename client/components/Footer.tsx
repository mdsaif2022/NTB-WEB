import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{settings.siteName}</h3>
                <p className="text-sm text-emerald-300">
                  {settings.siteDescription}
                </p>
              </div>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Your trusted partner for exploring the natural beauty, rich
              culture, and heritage of Bangladesh. Experience authentic travel
              with local expertise.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center hover:bg-emerald-700 cursor-pointer transition-colors">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center hover:bg-emerald-700 cursor-pointer transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center hover:bg-emerald-700 cursor-pointer transition-colors">
                <Twitter className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/tours"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Tours & Packages
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Travel Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Popular Destinations</h4>
            <ul className="space-y-3">
              <li className="text-emerald-200">Sundarbans</li>
              <li className="text-emerald-200">Cox's Bazar</li>
              <li className="text-emerald-200">Srimangal</li>
              <li className="text-emerald-200">Sylhet</li>
              <li className="text-emerald-200">Chittagong Hill Tracts</li>
              <li className="text-emerald-200">Rangamati</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-emerald-200 text-sm">
                  {settings.address.split(",").map((line, index) => (
                    <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="text-emerald-200 text-sm">
                  {settings.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="text-emerald-200 text-sm">
                  {settings.contactEmail}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-emerald-300 text-sm">
            © 2024 {settings.siteName}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-emerald-300 text-sm hover:text-white cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-emerald-300 text-sm hover:text-white cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
