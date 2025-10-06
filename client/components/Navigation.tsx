import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useUser } from "@/contexts/UserContext";
import NotificationBell from "./NotificationBell";
import {
  MapPin,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function Navigation() {
  const { settings } = useSettings();
  const { currentUser, isLoggedIn, logout } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Tours", path: "/tours" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-black/20 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                isScrolled 
                  ? "bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent"
                  : "text-white"
              }`}>
                {settings.siteName}
              </h1>
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isScrolled 
                  ? "text-emerald-600"
                  : "text-emerald-100"
              }`}>
                {settings.siteDescription}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? isScrolled
                      ? "text-emerald-700 border-b-2 border-emerald-700 pb-1"
                      : "text-white border-b-2 border-white pb-1"
                    : isScrolled
                      ? "text-gray-700 hover:text-emerald-600"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{currentUser?.firstName || "User"}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="flex items-center">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className={`transition-colors duration-300 ${
                isScrolled 
                  ? "text-gray-700 hover:text-emerald-600" 
                  : "text-white hover:text-emerald-100"
              }`}
              asChild
            >
              <Link to="/auth" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            </Button>
            )}
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              asChild
            >
              <Link to="/booking">Book Tour</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block text-base font-medium transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? "text-emerald-700"
                    : "text-gray-700 hover:text-emerald-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <Separator className="my-4" />
            
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)}>
                    <MapPin className="w-4 h-4 mr-2" />
                    My Bookings
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-4 h-4 mr-2" />
                  Login
              </Link>
              </Button>
            )}
            
            <Separator className="my-4" />
            
              <Button
                size="sm"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                asChild
              >
              <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                  Book Tour
                </Link>
              </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
