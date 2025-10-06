import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail, Eye, EyeOff, CheckCircle, ArrowLeft, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Helmet } from 'react-helmet-async';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoggedIn, sendPasswordReset, adminLogin, isAdmin } = useUser();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [adminLoginData, setAdminLoginData] = useState({ username: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!loginData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!loginData.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    if (!signupData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!signupData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!signupData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!signupData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateLogin()) return;
    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
      setIsSuccess(true);
      setTimeout(() => {
          navigate("/profile");
      }, 1500);
      } else {
        setErrors({ general: "Invalid credentials. Please try again." });
      }
    } catch (error) {
      setErrors({ general: "Login failed. Please check your credentials." });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateSignup()) return;
    setIsLoading(true);
    try {
      const userData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
      };
      const success = await register(userData);
      if (success) {
        const loginSuccess = await login(signupData.email, signupData.password);
        if (loginSuccess) {
      setIsSuccess(true);
      setTimeout(() => {
            navigate("/profile");
      }, 1500);
        } else {
          setErrors({ general: "Account created but login failed. Please try logging in manually." });
        }
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } catch (error) {
      setErrors({ general: "Signup failed. Please try again." });
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!forgotPasswordEmail.trim()) {
      setErrors({ forgotPasswordEmail: "Email is required" });
      return;
    }
    if (!forgotPasswordEmail.includes("@")) {
      setErrors({ forgotPasswordEmail: "Please enter a valid email address" });
      return;
    }
    setIsLoading(true);
    try {
      const sent = await sendPasswordReset(forgotPasswordEmail);
      if (sent) {
        setForgotPasswordSent(true);
      } else {
        setErrors({ forgotPasswordEmail: "Failed to send reset email. Please try again." });
      }
    } catch (error) {
      setErrors({ forgotPasswordEmail: "Failed to send reset email. Please try again." });
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsLoading(true);
    try {
      const success = await adminLogin(adminLoginData.username, adminLoginData.password);
      if (success) {
        setAdminSuccess(true);
        setTimeout(() => {
          navigate("/admin/tours");
        }, 1500);
      } else {
        setAdminError("Invalid admin credentials.");
      }
    } catch (error) {
      setAdminError("Admin login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCheckedAuth(true);
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    // Only redirect if not on an admin route
    if (checkedAuth && isLoggedIn && !location.pathname.startsWith("/admin")) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    }
  }, [checkedAuth, isLoggedIn, isAdmin, navigate, location.pathname]);

  if (isSuccess) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">
              Welcome to Explore BD!
            </h2>
            <p className="text-emerald-700 mb-6">
              You have been successfully logged in. Redirecting to profile...
            </p>
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
              {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordSent(false);
                    setErrors({});
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Forgot Password
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {!forgotPasswordSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  {errors.forgotPasswordEmail && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{errors.forgotPasswordEmail}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className={errors.forgotPasswordEmail ? "border-red-500" : ""}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reset Link Sent!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Please check your email and follow the instructions to reset your password.
                  </p>
                  <Button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail("");
                      setForgotPasswordSent(false);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login or Register | Explore Bangladesh</title>
        <meta name="description" content="Login or create an account to book tours, submit blogs, and manage your profile on Explore Bangladesh." />
        <meta property="og:title" content="Login or Register | Explore Bangladesh" />
        <meta property="og:description" content="Login or create an account to book tours, submit blogs, and manage your profile on Explore Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/auth" />
        <meta property="og:image" content="https://yourdomain.com/og-auth.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Login or Register | Explore Bangladesh" />
        <meta name="twitter:description" content="Login or create an account to book tours, submit blogs, and manage your profile on Explore Bangladesh." />
        <meta name="twitter:image" content="https://yourdomain.com/og-auth.jpg" />
      </Helmet>
      <Navigation />

      {/* Auth Section */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-emerald-50 to-white min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">
              Welcome to Explore BD
            </h1>
            <p className="text-emerald-700">
              Sign in to book tours and share your travel stories
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-emerald-900">
                Login or Sign Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* User Login Tab */}
                <TabsContent value="login" className="space-y-4 mt-6">
                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Error Display */}
                    {errors.general && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Email Address
                      </label>
                        <Input
                          type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                            email: e.target.value,
                            })
                          }
                        className={errors.email ? "border-red-500" : ""}
                        />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Password
                      </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                          className={errors.password ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                      </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                {/* User Signup Tab */}
                <TabsContent value="signup" className="space-y-4 mt-6">
                  {/* Signup Form */}
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Error Display */}
                    {errors.general && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          First Name
                        </label>
                        <Input
                          placeholder="Enter first name"
                          value={signupData.firstName}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              firstName: e.target.value,
                            })
                          }
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Last Name
                        </label>
                        <Input
                          placeholder="Enter last name"
                          value={signupData.lastName}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              lastName: e.target.value,
                            })
                          }
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Email Address
                      </label>
                        <Input
                          type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                            email: e.target.value,
                            })
                          }
                        className={errors.email ? "border-red-500" : ""}
                        />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Password
                      </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                          className={errors.password ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                      </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </>
  );
}
