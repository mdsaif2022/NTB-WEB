import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="text-center px-4">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <MapPin className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-emerald-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            It looks like you've wandered off the beaten path. The page you're
            looking for doesn't exist on our Bangladesh travel guide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              asChild
            >
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
              asChild
            >
              <Link to="/tours">Explore Tours</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
