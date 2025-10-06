import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { TourProvider } from "./contexts/TourContext";
import { BlogProvider } from "./contexts/BlogContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { BookingProvider } from "./contexts/BookingContext";
import { RTDBProvider } from "./contexts/RTDBContext";
import Index from "./pages/Index";
import Tours from "./pages/Tours";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import BlogSubmission from "./pages/BlogSubmission";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TourManagement from "./pages/admin/TourManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import NewTour from "./pages/admin/NewTour";
import NotificationManagement from "./pages/admin/NotificationManagement";
import NotFound from "./pages/NotFound";
import BookingManagement from "./pages/admin/BookingManagement";
import AdManagement from "./components/admin/AdManagement";
import { HelmetProvider } from 'react-helmet-async';
import AdminLogin from "./pages/admin/AdminLogin";
// import FirebaseTest from "./components/FirebaseTest";
// import CloudinaryTest from "./components/CloudinaryTest";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <RTDBProvider>
      <SettingsProvider>
          <UserProvider>
            <NotificationProvider>
        <BookingProvider>
          <TourProvider>
            <BlogProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/tours" element={<Tours />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/auth" element={<Auth />} />
                        <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/blog/submit" element={<BlogSubmission />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/notifications" element={<Notifications />} />
                  {/* <Route path="/firebase-test" element={<FirebaseTest />} /> */}
                  {/* <Route path="/cloudinary-test" element={<CloudinaryTest />} /> */}

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="tours" element={<TourManagement />} />
                    <Route path="tours/new" element={<NewTour />} />
                    <Route path="blogs" element={<BlogManagement />} />
                          <Route path="notifications" element={<NotificationManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                          <Route path="bookings" element={<BookingManagement />} />
                    <Route path="ads" element={<AdManagement />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </BlogProvider>
          </TourProvider>
        </BookingProvider>
            </NotificationProvider>
          </UserProvider>
      </SettingsProvider>
    </RTDBProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
