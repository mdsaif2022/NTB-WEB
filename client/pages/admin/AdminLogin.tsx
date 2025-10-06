import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Lock } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useUser();
  const [adminLoginData, setAdminLoginData] = useState({ username: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing admin session on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token && isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsLoading(true);
    try {
      const success = await adminLogin(adminLoginData.username, adminLoginData.password);
      if (success) {
        // Store session token (for demo, use a static token)
        localStorage.setItem("adminToken", "demo-admin-token");
        navigate("/admin");
      } else {
        setAdminError("Invalid admin credentials.");
      }
    } catch (error) {
      setAdminError("Admin login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin login for Explore Bangladesh. Restricted access." />
        <meta property="og:title" content="Admin Login | Explore Bangladesh" />
        <meta property="og:description" content="Admin login for Explore Bangladesh. Restricted access." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin-login" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
      <Navigation />
      <section className="py-20 bg-gradient-to-b from-emerald-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">
              Admin Login
            </h1>
            <p className="text-emerald-700">
              Restricted access for administrators only
            </p>
          </div>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-emerald-900 flex items-center justify-center">
                <Lock className="w-5 h-5 mr-2" /> Admin Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{adminError}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter admin username"
                    value={adminLoginData.username}
                    onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminLoginData.password}
                    onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </>
  );
} 