import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  CreditCard,
  Check,
  Upload,
  Clock,
  X,
} from "lucide-react";
import { useTours } from "@/contexts/TourContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useBookings } from "@/contexts/BookingContext";
import { useUser } from "@/contexts/UserContext";
import AdBanner from '@/components/AdBanner';
import { Helmet } from 'react-helmet-async';
import { BusSeatMap } from "../../shared/api";
import { toast } from "@/components/ui/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { v4 as uuidv4 } from 'uuid';

const locations = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Gazipur",
];

// Generate 40-seat layout (A1-I4 + J,K,L,M at back)
const generateSeats = () => {
  const seats = [];
  // Rows A-I with 4 seats each (A1-A4, B1-B4, etc.)
  for (let row of ["A", "B", "C", "D", "E", "F", "G", "H", "I"]) {
    for (let num = 1; num <= 4; num++) {
      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        isAvailable: Math.random() > 0.3, // Random availability for demo
      });
    }
  }

  // Back row seats J, K, L, M
  for (let seat of ["J", "K", "L", "M"]) {
    seats.push({
      id: seat,
      row: seat,
      number: 1,
      isAvailable: Math.random() > 0.3,
    });
  }

  return seats;
};

// Add fetch and sync logic for backend seat map
const API_BASE = "/api/buses";

// Helper: IDs of the last 8 seats in bus 1
const LAST_8_SEATS = ["I1", "I2", "I3", "I4", "J", "K", "L", "M"];

const getSeatSelectionStorageKey = (tourId: string | number) => `echoForgeSeatSelection_${tourId}`;

export default function Booking() {
  const [searchParams] = useSearchParams();
  const { getTourById, tours } = useTours();
  const { settings } = useSettings();
  const tourId = searchParams.get("tour");
  const selectedTour = tourId ? getTourById(Number(tourId)) : tours[0];
  if (!selectedTour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Tour Not Found</h2>
        <p className="text-gray-600">The selected tour does not exist. Please go back and select a valid tour.</p>
        <Link to="/tours" className="mt-4 text-blue-600 underline">Back to Tours</Link>
      </div>
    );
  }
  const seatSelectionStorageKey = getSeatSelectionStorageKey(selectedTour.id);

  const [step, setStep] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState<{
    from: string;
    to: string;
    persons: number;
    date: string;
    selectedSeatsByBus: string[][];
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    notes: string;
    transactionId: string;
    paymentProof: File | null;
  }>({
    from: "",
    to: selectedTour.destination, // Set fixed destination based on selected tour
    persons: 1,
    date: "",
    // Each bus has its own selectedSeats array
    selectedSeatsByBus: [[], []],
    customerInfo: {
      name: "",
      email: "",
      phone: "",
    },
    notes: "",
    transactionId: "",
    paymentProof: null,
  });

  // Add state for selected bus (0-based index)
  const [selectedBus, setSelectedBus] = useState(0); // 0 = Bus 1
  // For now, keep a single seats array (per-bus seat state comes next)
  const [seats] = useState(generateSeats());
  const summaryRef = useRef<HTMLDivElement>(null);
  const { addBooking, bookings } = useBookings();
  const { currentUser, userProfile, setUserProfile } = useUser();
  const { addNotification } = useNotifications();

  // Backend seat map state (per tour)
  const [backendSeatMap, setBackendSeatMap] = useState<BusSeatMap>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Booking status state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'approved' | 'expired' | 'rejected' | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timer, setTimer] = useState<string>("");

  // Payment method settings
  const [paymentSettings, setPaymentSettings] = useState({ manualPayment: true, bkashPayment: false });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'manual' | 'bkash'>("manual");

  // Add modal state
  const [showNonThursdayPopup, setShowNonThursdayPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        setPaymentSettings(data);
        // Default to bKash if only bKash is enabled
        if (data.bkashPayment && !data.manualPayment) setSelectedPaymentMethod("bkash");
        else setSelectedPaymentMethod("manual");
      });
  }, []);

  // Helper to format time left
  function getTimeLeft(expires: string) {
    const ms = new Date(expires).getTime() - Date.now();
    if (ms <= 0) return "Expired";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // Helper: Check if user can access next bus (must be inside Booking to access backendSeatMaps)
  function canAccessNextBus() {
    const bus1Seats = backendSeatMap.length > 0 ? backendSeatMap : generateSeats();
    const availableSeats = bus1Seats.filter((s) => s.isAvailable).map((s) => s.id);
    // All 40 booked (no available seats)
    if (availableSeats.length === 0) return true;
    // Only last 8 seats remain, and all are in LAST_8_SEATS
    if (
      availableSeats.length === 8 &&
      LAST_8_SEATS.every((id) => availableSeats.includes(id))
    ) {
      return true;
    }
    return false;
  }

  // Fetch seat map for selected bus
  const fetchTourSeats = async () => {
    setLoadingSeats(true);
    try {
      const res = await fetch(`/api/tours/${selectedTour.id}/seats`);
      const data = await res.json();
      setBackendSeatMap(data.seats);
    } finally {
      setLoadingSeats(false);
    }
  };

  // On mount or tour change, fetch seat map
  useEffect(() => {
    fetchTourSeats();
    // eslint-disable-next-line
  }, [selectedTour.id]);

  // Poll for seat map updates every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTourSeats();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTour.id]);

  // Generate or load a user/session ID for seat reservation
  const [userId] = useState(() => {
    let id = localStorage.getItem('echoForgeUserId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('echoForgeUserId', id);
    }
    return id;
  });

  // Load seat selection from localStorage on mount (per tour)
  useEffect(() => {
    const saved = localStorage.getItem(seatSelectionStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.selectedSeats)) {
          setBookingData(prev => ({ ...prev, selectedSeatsByBus: [parsed.selectedSeats] }));
        }
      } catch (e) { /* ignore */ }
    }
  }, [seatSelectionStorageKey]);

  // Save seat selection to localStorage whenever it changes (per tour)
  useEffect(() => {
    localStorage.setItem(seatSelectionStorageKey, JSON.stringify({ selectedSeats: bookingData.selectedSeatsByBus[0] }));
  }, [bookingData.selectedSeatsByBus, seatSelectionStorageKey]);

  // Listen for storage events to sync seat selection across tabs (per tour)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === seatSelectionStorageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && Array.isArray(parsed.selectedSeats)) {
            setBookingData(prev => ({ ...prev, selectedSeatsByBus: [parsed.selectedSeats] }));
          }
        } catch (e) { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [seatSelectionStorageKey]);

  // When user selects/deselects seats, POST to backend with userId and tourId
  const handleSeatSelect = (seatId: string) => {
    setBookingData((prev) => {
      const selectedSeats = prev.selectedSeatsByBus[0] || [];
      const newSelectedSeats = selectedSeats.includes(seatId)
        ? selectedSeats.filter((id) => id !== seatId)
        : selectedSeats.length < prev.persons
          ? [...selectedSeats, seatId]
          : selectedSeats;
      // POST to backend for this tour with userId
      fetch(`/api/tours/${selectedTour.id}/seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: String(selectedTour.id),
          selectedSeats: newSelectedSeats,
          userId,
        }),
      })
        .then(() => fetchTourSeats()); // Refresh after update
      return {
        ...prev,
        selectedSeatsByBus: [newSelectedSeats],
      };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only image files (JPG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setBookingData((prev) => ({
        ...prev,
        paymentProof: file,
      }));
    }
  };

  // After booking, store bookingId, status, expiresAt
  const handleConfirmBooking = async () => {
    // Validate required fields
    if (!bookingData.transactionId && !bookingData.paymentProof) {
      alert("Please provide either transaction ID or payment screenshot");
      return;
    }

    setIsConfirming(true);

    try {
      // Simulate API call for booking confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const bookingObj = {
        user: {
          name: bookingData.customerInfo.name,
          email: bookingData.customerInfo.email,
          phone: bookingData.customerInfo.phone,
        },
        tourId: selectedTour.id,
        tourName: selectedTour.name,
        from: bookingData.from,
        to: bookingData.to,
        date: bookingData.date,
        persons: bookingData.persons,
        selectedSeats: selectedTour.hasBusSeatSelection ? bookingData.selectedSeatsByBus[0] : [], // Only include seats if bus seat selection is enabled
        notes: bookingData.notes,
        amount: selectedTour.price * bookingData.persons,
        status: 'pending' as 'pending',
        transactionId: bookingData.transactionId,
        paymentProof: bookingData.paymentProof ? bookingData.paymentProof.name : undefined,
      };
      
      // Add booking and get the generated ID
      addBooking(bookingObj);
      
      // Get the latest booking (which should be the one we just added)
      const latestBooking = bookings[0]; // Since addBooking adds to the beginning
      
      // Update user profile tour history with the correct booking ID
      if (userProfile && setUserProfile && latestBooking) {
        const updatedPendingTours = [...(userProfile.pendingTours || []), String(latestBooking.id)];
        setUserProfile({ ...userProfile, pendingTours: updatedPendingTours });
      }
      
      setBookingId(String(latestBooking?.id || Date.now()));
      setBookingStatus('pending');
      // For demo, set expiresAt to 30 min from now
      setExpiresAt(new Date(Date.now() + 30 * 60 * 1000).toISOString());
      setBookingConfirmed(true);
      setStep(selectedTour.hasBusSeatSelection ? 5 : 4); // Move to confirmation step

      // Simulate SMS confirmation
      alert(
        `🎉 Booking Confirmed!\n\nBooking ID: BD${latestBooking?.id || Date.now()}\n\nYou will receive a confirmation SMS shortly at ${bookingData.customerInfo.phone}`,
      );
    } catch (error) {
      alert("Booking failed. Please try again.");
      console.error("Booking error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Poll booking status if bookingId exists and step === confirmation step
  useEffect(() => {
    const confirmationStep = selectedTour.hasBusSeatSelection ? 5 : 4;
    if (!bookingId || step !== confirmationStep) return;
    let interval: NodeJS.Timeout;
    const fetchStatus = async () => {
      const res = await fetch(`/api/bookings/${bookingId}/status`);
      if (res.ok) {
        const data = await res.json();
        setBookingStatus(data.status);
        setExpiresAt(data.expiresAt);
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [bookingId, step]);

  // Update timer every second
  useEffect(() => {
    if (!expiresAt || bookingStatus !== 'pending') return;
    const update = () => setTimer(getTimeLeft(expiresAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, bookingStatus]);

  // Show toast and notification on booking status change
  useEffect(() => {
    if (!bookingStatus || !bookingId) return;
    if (["approved", "rejected", "expired"].includes(bookingStatus)) {
      let title = "";
      let message = "";
      if (bookingStatus === "approved") {
        title = "Booking Approved";
        message = "Your booking has been approved! You will receive an SMS confirmation.";
      } else if (bookingStatus === "rejected") {
        title = "Booking Rejected";
        message = "Sorry, your booking was rejected by the admin.";
      } else if (bookingStatus === "expired") {
        title = "Booking Expired";
        message = "Your booking was not approved in time and has expired.";
      }
      toast({ title, description: message });
      addNotification({
        type: "tour_update",
        title,
        message,
        sender: { id: 1, name: "System", role: "system" },
        priority: "high",
        actionUrl: "/my-bookings",
        metadata: { bookingId },
      });
    }
  }, [bookingStatus, bookingId, addNotification]);

  const totalAmount = selectedTour.price * bookingData.persons;

  // Create professional booking summary HTML
  const createProfessionalSummaryHTML = () => {
    const logoSection = settings.siteLogo ? `
      <div style="margin-bottom: 16px;">
        <img src="${settings.siteLogo}" alt="${settings.siteName}" style="max-height: 50px; max-width: 180px; object-fit: contain; filter: brightness(0) invert(1);" />
      </div>
    ` : '';
    
    const travelDetailsSection = bookingData.from && bookingData.to ? `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="background: #3b82f6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #1e293b;">Travel Details</h4>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Route</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${bookingData.from} → ${bookingData.to}</div>
          </div>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Travel Date</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${new Date(bookingData.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Travelers</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${bookingData.persons} ${bookingData.persons === 1 ? 'Person' : 'Persons'}</div>
          </div>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Status</div>
            <div style="font-size: 14px; font-weight: 600; color: #059669;">Confirmed</div>
          </div>
        </div>
      </div>
    ` : '';
    
    const seatSelectionSection = selectedTour.hasBusSeatSelection && bookingData.selectedSeatsByBus[0].length > 0 ? `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="background: #8b5cf6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #1e293b;">Selected Seats</h4>
        </div>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${bookingData.selectedSeatsByBus[0].map(seat => `
              <div style="background: #8b5cf6; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${seat}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    ` : '';
    
    const specialNotesSection = bookingData.notes ? `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="background: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 9V5a3 3 0 0 0-6 0v4"/>
              <rect x="5" y="9" width="14" height="10" rx="2" ry="2"/>
            </svg>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #1e293b;">Special Notes</h4>
        </div>
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 8px; font-size: 14px; color: #92400e; line-height: 1.5;">
          ${bookingData.notes}
        </div>
      </div>
    ` : '';

    return `
      <!-- Professional Header -->
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 24px; margin: -32px -32px 32px -32px; border-radius: 8px 8px 0 0;">
        <div style="text-align: center;">
          ${logoSection}
          <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">BOOKING CONFIRMATION</h1>
          <div style="font-size: 14px; opacity: 0.9; font-weight: 500;">${settings.siteName || 'Explore Bangladesh'}</div>
        </div>
      </div>
      
      <!-- Booking Reference -->
      <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Booking Reference</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e293b; font-family: 'Courier New', monospace;">BD-${Date.now().toString().slice(-8)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Generated</div>
            <div style="font-size: 14px; font-weight: 600; color: #059669;">${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
        </div>
      </div>
      
      <!-- Tour Information Card -->
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="background: #059669; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
          </div>
          <div>
            <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b;">${selectedTour.name}</h3>
            <p style="font-size: 14px; color: #64748b; margin: 0; font-weight: 500;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; margin-right: 4px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              ${selectedTour.location}
            </p>
          </div>
        </div>
        
        <!-- Tour Details Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Duration</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${selectedTour.duration}</div>
          </div>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Rating</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">
              ⭐ ${selectedTour.rating} (${selectedTour.bookings || 0} bookings)
            </div>
          </div>
        </div>
      </div>
      
      ${travelDetailsSection}
      ${seatSelectionSection}
      ${specialNotesSection}
      
      <!-- Payment Summary Card -->
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="background: #10b981; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #1e293b;">Payment Summary</h4>
        </div>
        
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; color: #64748b;">Price per person:</span>
            <span style="font-size: 14px; font-weight: 600; color: #1e293b;">৳${selectedTour.price.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; color: #64748b;">Number of travelers:</span>
            <span style="font-size: 14px; font-weight: 600; color: #1e293b;">× ${bookingData.persons}</span>
          </div>
          <div style="border-top: 2px solid #e2e8f0; margin-top: 12px; padding-top: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 18px; font-weight: 700; color: #1e293b;">Total Amount:</span>
              <span style="font-size: 18px; font-weight: 700; color: #059669;">৳${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
        <div style="font-size: 14px; font-weight: 600; color: #059669; margin-bottom: 8px;">
          Thank you for choosing ${settings.siteName || 'Explore Bangladesh'}!
        </div>
        <div style="font-size: 12px; color: #64748b; line-height: 1.4;">
          For any questions or support, please contact us at ${settings.contactEmail || 'info@explorebd.com'} or call ${settings.phone || '+880 1700-000000'}
        </div>
      </div>
    `;
  };

  const handleDownloadImage = async () => {
    // Create a clean, static version for download
    const downloadElement = document.createElement('div');
    downloadElement.className = 'bg-white p-8 max-w-md mx-auto';
    downloadElement.style.fontFamily = 'Arial, sans-serif';
    downloadElement.style.color = '#000';
    
    downloadElement.innerHTML = createProfessionalSummaryHTML();
    
    // Temporarily add to DOM for capture
    document.body.appendChild(downloadElement);
    
    // Wait for element to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const dataUrl = await toPng(downloadElement, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        quality: 1,
        width: 600,
        height: 800,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement("a");
      link.download = `booking-summary-${selectedTour.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      // Clean up
      document.body.removeChild(downloadElement);
    }
  };

  const handleDownloadPDF = async () => {
    // Create a clean, static version for PDF download
    const downloadElement = document.createElement('div');
    downloadElement.className = 'bg-white p-8 max-w-md mx-auto';
    downloadElement.style.fontFamily = 'Arial, sans-serif';
    downloadElement.style.color = '#000';
    
    downloadElement.innerHTML = createProfessionalSummaryHTML();
    
    // Temporarily add to DOM for capture
    document.body.appendChild(downloadElement);
    
    // Wait for element to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(downloadElement, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        width: 600,
        height: 800,
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all styles are properly applied in the cloned document
          const clonedElement = clonedDoc.querySelector('div');
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Arial, sans-serif';
            clonedElement.style.color = '#000';
            clonedElement.style.backgroundColor = '#ffffff';
          }
        }
      });
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height, '', 'FAST');
      pdf.save(`booking-summary-${selectedTour.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    } finally {
      // Clean up
      document.body.removeChild(downloadElement);
    }
  };

  // Ensure renderSeatMap is defined as a function inside Booking and all variables are in scope
  // Move the renderSeatMap function definition and its return value inside the Booking component, and ensure all variables (isDisabled, busIdx, etc.) are defined in the map callbacks.
  // Remove any duplicate or misplaced code fragments outside the Booking component.
  const renderSeatMap = () => {
    const selectedSeats = bookingData.selectedSeatsByBus[0];
    const seats = backendSeatMap.length > 0 ? backendSeatMap : generateSeats();
    const bus1Locked = !canAccessNextBus();
    // Check if only last 8 seats remain
    const bus1Seats = backendSeatMap.length > 0 ? backendSeatMap : generateSeats();
    const availableSeats = bus1Seats.filter((s) => s.isAvailable).map((s) => s.id);
    const onlyLast8Remain = availableSeats.length === 8 && LAST_8_SEATS.every((id) => availableSeats.includes(id));
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 mb-4 sm:mb-6 text-center">
          Select Your Seats ({selectedSeats.length}/{bookingData.persons})
        </h3>
        {/* Inline message for bus lock */}
        {bus1Locked && (
          <div className="mb-3 text-center text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-2 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <span style={{fontSize: '1.2em'}} className="animate-bounce">🔒</span>
            <span>
              You can only select seats on the next bus when all seats of the first bus are booked, or only the last 8 seats (<b>I1–I4, J, K, L, M</b>) remain.
            </span>
          </div>
        )}
        {/* Bus Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6 gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
          {[0, 1, 2, 3, 4].map((busIdx) => {
            const isDisabled = busIdx > 0 && bus1Locked;
            return (
              <button
                key={busIdx}
                onClick={() => !isDisabled && setSelectedBus(Number(busIdx))}
                className={`px-3 sm:px-4 py-2 rounded-t-lg font-medium border-b-2 transition-all duration-200 ease-in-out whitespace-nowrap transform hover:scale-105
                ${selectedBus === busIdx
                  ? 'bg-emerald-100 border-emerald-600 text-emerald-900 shadow-md'
                  : isDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60 hover:scale-100'
                    : 'bg-gray-100 border-transparent text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm'}
              `}
              style={{ minWidth: 80, position: 'relative' }}
              disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
              aria-label={isDisabled ? `Bus ${busIdx + 1} (locked)` : `Bus ${busIdx + 1}`}
              title={isDisabled ? 'You can only select seats on the next bus when all seats of the first bus are booked, or only the last 8 seats (I1–I4, J, K, L, M) remain.' : ''}
            >
              {`Bus ${busIdx + 1}`}
              {isDisabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    fontSize: 18,
                    color: '#e67c00',
                    fontWeight: 'bold',
                  }}
                  className="animate-pulse"
                >
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Driver area */}
      <div className="flex justify-center mb-2 sm:mb-4">
        <div className="w-16 h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-xs font-medium">
          Driver
        </div>
      </div>
      {/* Main seating area (A-I rows) */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 mb-4 sm:mb-6 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          {seats.slice(0, 36).map((seat) => {
            const isBooked = !!seat.bookedBy;
            const isReserved = !!seat.reservedBy && seat.reservedBy !== userId;
            const isReservedByMe = !!seat.reservedBy && seat.reservedBy === userId;
            const isSelected = selectedSeats.includes(seat.id);
            let seatClass = '';
            if (isBooked) {
              seatClass = 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed hover:scale-100';
            } else if (isReservedByMe) {
              seatClass = 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse shadow-lg';
            } else if (isReserved) {
              seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 cursor-not-allowed animate-pulse shadow-lg';
            } else if (isSelected) {
              seatClass = 'bg-emerald-500 border-emerald-600 text-white shadow-md';
            } else if (onlyLast8Remain && LAST_8_SEATS.includes(seat.id)) {
              seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 animate-pulse shadow-lg';
            } else {
              seatClass = 'bg-gray-100 border-gray-300 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm';
            }
            return (
              <button
                key={seat.id}
                onClick={() => !isBooked && !isReserved && handleSeatSelect(seat.id)}
                disabled={isBooked || isReserved}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 text-xs font-medium transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${seatClass}`}
                style={{ minWidth: 44, minHeight: 44 }}
                tabIndex={!isBooked && !isReserved ? 0 : -1}
                aria-label={`Seat ${seat.id} ${isBooked ? 'booked' : isReserved ? 'reserved' : isSelected ? 'selected' : 'available'}`}
              >
                {seat.id}
              </button>
            );
          })}
        </div>
      </div>
      {/* Back row seats */}
      <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
        {seats.slice(36).map((seat) => {
          const isBooked = !!seat.bookedBy;
          const isReserved = !!seat.reservedBy && seat.reservedBy !== userId;
          const isReservedByMe = !!seat.reservedBy && seat.reservedBy === userId;
          const isSelected = selectedSeats.includes(seat.id);
          let seatClass = '';
          if (isBooked) {
            seatClass = 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed hover:scale-100';
          } else if (isReservedByMe) {
            seatClass = 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse shadow-lg';
          } else if (isReserved) {
            seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 cursor-not-allowed animate-pulse shadow-lg';
          } else if (isSelected) {
            seatClass = 'bg-emerald-500 border-emerald-600 text-white shadow-md';
          } else if (onlyLast8Remain && LAST_8_SEATS.includes(seat.id)) {
            seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 animate-pulse shadow-lg';
          } else {
            seatClass = 'bg-gray-100 border-gray-300 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm';
          }
          return (
            <button
              key={seat.id}
              onClick={() => !isBooked && !isReserved && handleSeatSelect(seat.id)}
              disabled={isBooked || isReserved}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 text-xs font-medium transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${seatClass}`}
              style={{ minWidth: 44, minHeight: 44 }}
              tabIndex={!isBooked && !isReserved ? 0 : -1}
              aria-label={`Seat ${seat.id} ${isBooked ? 'booked' : isReserved ? 'reserved' : isSelected ? 'selected' : 'available'}`}
            >
              {seat.id}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-emerald-500 border-2 border-emerald-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded animate-pulse"></div>
          <span>Reserved (by others)</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded animate-pulse"></div>
          <span>Reserved (by you)</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

  // Add a mock handler for /mock-bkash-payment route (for demo)
  // In a real app, this would be a separate page/component
  if (window.location.pathname.startsWith("/mock-bkash-payment")) {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("bookingId");
    const amount = urlParams.get("amount");
    // Simulate payment success/failure
    setTimeout(async () => {
      // For demo, always succeed
      await fetch("/api/payment/bkash/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentStatus: "success" }),
      });
      window.location.href = "/booking?payment=success";
    }, 2000);
  }

  return (
    <>
      <Helmet>
        <title>Book a Tour | Explore Bangladesh</title>
        <meta name="description" content="Book your next adventure in Bangladesh. Choose your destination, select your seats, and confirm your booking easily!" />
        <meta property="og:title" content="Book a Tour | Explore Bangladesh" />
        <meta property="og:description" content="Book your next adventure in Bangladesh. Choose your destination, select your seats, and confirm your booking easily!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/booking" />
        <meta property="og:image" content="https://yourdomain.com/og-booking.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book a Tour | Explore Bangladesh" />
        <meta name="twitter:description" content="Book your next adventure in Bangladesh. Choose your destination, select your seats, and confirm your booking easily!" />
        <meta name="twitter:image" content="https://yourdomain.com/og-booking.jpg" />
      </Helmet>
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tours">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tours
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">
                  Book Your Tour
                </h1>
                <p className="text-emerald-600">{selectedTour.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl mb-2">{selectedTour.image}</div>
              <div className="text-sm text-gray-600">
                {selectedTour.duration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {(() => {
            const steps = selectedTour.hasBusSeatSelection ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
            const maxStep = selectedTour.hasBusSeatSelection ? 5 : 4;
            
            return steps.map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  step >= stepNumber
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}
              >
                {step > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
                {stepNumber < maxStep && (
                <div
                  className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-emerald-600" : "bg-gray-200"}`}
                />
              )}
            </div>
            ));
          })()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from">From</Label>
                      <Select
                        value={bookingData.from}
                        onValueChange={(value) =>
                          setBookingData((prev) => ({ ...prev, from: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure city" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="to">To (Fixed Destination)</Label>
                      <div className="relative">
                        <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-700">
                              {selectedTour.destination}
                            </span>
                            <span className="text-xs text-gray-500">
                              (Tour Destination)
                            </span>
                          </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15l-3-3h6l-3 3z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Destination is automatically set based on your selected
                        tour: {selectedTour.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="persons">Number of Persons</Label>
                      <Input
                        id="persons"
                        type="number"
                        min={1}
                        max={500}
                        value={String(bookingData.persons)}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (isNaN(value) || value < 1) value = 1;
                          if (value > 500) value = 500;
                          setBookingData((prev) => ({
                            ...prev,
                            persons: value,
                            // Reset selected seats when persons change
                            selectedSeatsByBus: prev.selectedSeatsByBus.map(() => []),
                          }));
                        }}
                        placeholder="Enter number of persons (max 500)"
                        className=""
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Travel Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => {
                          const dateStr = e.target.value;
                          setBookingData((prev) => ({ ...prev, date: dateStr }));
                          setSelectedDate(dateStr);
                          if (dateStr) {
                            const day = new Date(dateStr).getDay();
                            // 4 = Thursday
                            if (day !== 4) {
                              setShowNonThursdayPopup(true);
                            }
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">
                      Notes for Tour Host / Admin (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={bookingData.notes}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Share any special requests, dietary preferences, accessibility needs, or suggestions for the tour host..."
                      rows={4}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This information will be shared with your tour guide and
                      our admin team to help customize your experience.
                    </p>
                  </div>

                  <Button
                    onClick={() => setStep(selectedTour.hasBusSeatSelection ? 2 : 3)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!bookingData.from || !bookingData.date}
                  >
                    {selectedTour.hasBusSeatSelection ? "Continue to Seat Selection" : "Continue to Customer Info"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && selectedTour.hasBusSeatSelection && (
              <div>
                {renderSeatMap()}
                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={bookingData.selectedSeatsByBus[0].length !== bookingData.persons}
                  >
                    Continue to Customer Info
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      value={bookingData.customerInfo.name}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            name: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      type="email"
                      value={bookingData.customerInfo.email}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            email: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      value={bookingData.customerInfo.phone}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            phone: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(selectedTour.hasBusSeatSelection ? 2 : 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={
                        !bookingData.customerInfo.name ||
                        !bookingData.customerInfo.email ||
                        !bookingData.customerInfo.phone
                      }
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Payment method selection if both enabled */}
                  {paymentSettings.manualPayment && paymentSettings.bkashPayment && (
                    <div className="mb-6 flex gap-4">
                      <Button
                        variant={selectedPaymentMethod === "manual" ? "default" : "outline"}
                        onClick={() => setSelectedPaymentMethod("manual")}
                      >
                        Manual Payment
                      </Button>
                      <Button
                        variant={selectedPaymentMethod === "bkash" ? "default" : "outline"}
                        onClick={() => setSelectedPaymentMethod("bkash")}
                      >
                        bKash Payment
                      </Button>
                    </div>
                  )}
                  {/* Manual Payment Instructions */}
                  {paymentSettings.manualPayment && selectedPaymentMethod === "manual" && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-4">Manual Payment Instructions:</h3>
                      <div className="space-y-2 text-sm text-blue-800">
                      <div className="mb-3">
                          <strong>Amount to Pay: ৳{totalAmount.toLocaleString()}</strong>
                      </div>
                      <div className="mb-3">
                          <strong>Instructions: </strong>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                            Please pay at the counter or contact admin for payment.
                        </span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed">
                          {settings.paymentInstructions || "Contact the admin for manual payment details."}
                      </div>
                    </div>
                  </div>
                  )}
                  {/* bKash Payment Instructions */}
                  {paymentSettings.bkashPayment && selectedPaymentMethod === "bkash" && (
                    <div className="bg-pink-50 p-6 rounded-lg border border-pink-200 mb-6">
                      <h3 className="font-semibold text-pink-900 mb-4">bKash Payment Instructions:</h3>
                      <div className="space-y-2 text-sm text-pink-800">
                        <div className="mb-3">
                          <strong>Amount to Pay: ৳{totalAmount.toLocaleString()}</strong>
                        </div>
                        <div className="mb-3">
                          <strong>bKash Number: </strong>
                          <span className="font-mono bg-pink-100 px-2 py-1 rounded">{settings.bkashNumber}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed">{settings.paymentInstructions}</div>
                      </div>
                    </div>
                  )}
                  {/* Payment input fields (shown for both methods) */}
                  {((paymentSettings.manualPayment && selectedPaymentMethod === "manual") || (paymentSettings.bkashPayment && selectedPaymentMethod === "bkash")) && (
                    <>
                  <div>
                    <Label htmlFor="transaction">Transaction ID</Label>
                    <Input
                      value={bookingData.transactionId}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          transactionId: e.target.value,
                        }))
                      }
                          placeholder={selectedPaymentMethod === "bkash" ? "Enter bKash transaction ID" : "Enter transaction/reference ID (if any)"}
                    />
                  </div>
                  <div>
                        <Label htmlFor="payment-proof">Payment Screenshot (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="payment-proof"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {bookingData.paymentProof ? (
                        <div className="space-y-2">
                              <p className="text-sm text-green-600 font-medium">✓ {bookingData.paymentProof.name}</p>
                        </div>
                      ) : (
                            <label htmlFor="payment-proof" className="cursor-pointer text-blue-600 underline">Upload Screenshot</label>
                      )}
                    </div>
                  </div>
                  {/* Add Confirm Booking button here */}
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-6"
                    onClick={handleConfirmBooking}
                    disabled={isConfirming}
                  >
                    {isConfirming ? "Confirming..." : "Confirm Booking"}
                  </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {step === (selectedTour.hasBusSeatSelection ? 5 : 4) && bookingConfirmed && (
              <Card>
                <CardContent className="p-8 text-center">
                  {bookingStatus === 'pending' && (
                    <>
                      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-yellow-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-yellow-900 mb-4">
                        Booking Pending Admin Approval
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Your booking is pending admin approval. Please wait.
                      </p>
                      <div className="text-lg font-mono text-yellow-800 mb-6">
                        Time left: {timer}
                      </div>
                    </>
                  )}
                  {bookingStatus === 'approved' && (
                    <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                        🎉 Booking Approved!
                  </h2>
                  <p className="text-gray-600 mb-6">
                        Thank you for booking with Explore BD! Your booking has been approved and you will receive an SMS confirmation shortly.
                  </p>
                    </>
                  )}
                  {(bookingStatus === 'expired' || bookingStatus === 'rejected') && (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-red-900 mb-4">
                        Booking {bookingStatus === 'expired' ? 'Expired' : 'Rejected'}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {bookingStatus === 'expired'
                          ? 'Sorry, your booking was not approved in time and has expired. Please try again.'
                          : 'Sorry, your booking was rejected by the admin. Please contact support or try again.'}
                      </p>
                    </>
                  )}
                  {/* Booking Details ... (show for all states) */}
                  <div className="bg-emerald-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-emerald-900 mb-3">
                      Booking Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Booking ID:</span>
                        <span className="font-mono">{bookingId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tour:</span>
                        <span>{selectedTour.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Route:</span>
                        <span>
                          {bookingData.from} → {bookingData.to}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{bookingData.date}</span>
                      </div>
                      {selectedTour.hasBusSeatSelection && bookingData.selectedSeatsByBus[0].length > 0 && (
                      <div className="flex justify-between">
                        <span>Seats:</span>
                        <span>{bookingData.selectedSeatsByBus[0].join(", ")}</span>
                      </div>
                      )}
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-semibold">
                          ৳{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      asChild
                    >
                      <Link to="/">Return to Home</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/tours">Book Another Tour</Link>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-6">
                    You will receive SMS confirmation at {bookingData.customerInfo.phone}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div ref={summaryRef}>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedTour.image}</div>
                  <div>
                    <h3 className="font-semibold">{selectedTour.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedTour.location}
                    </p>
                  </div>
                </div>

                <Separator />

                {bookingData.from && bookingData.to && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Route:</span>
                      <span>
                        {bookingData.from} → {bookingData.to}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span>{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Persons:</span>
                      <span>{bookingData.persons}</span>
                    </div>
                  </div>
                )}

                  {selectedTour.hasBusSeatSelection && bookingData.selectedSeatsByBus[0].length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Selected Seats:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {bookingData.selectedSeatsByBus[0].map((seat) => (
                        <Badge key={seat} variant="outline">
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {bookingData.notes && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Special Notes:
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                      {bookingData.notes}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per person:</span>
                    <span>৳{selectedTour.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Persons:</span>
                    <span>× {bookingData.persons}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>৳{totalAmount.toLocaleString()}</span>
                  </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleDownloadImage} variant="outline" className="flex-1">
                    Download as Image
                  </Button>
                  <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                    Download as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AdBanner />
      <Footer />
      {showNonThursdayPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '90vw',
            width: '400px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'center',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowNonThursdayPopup(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem', color: '#b91c1c' }}>
              প্রতি মাসের প্রতি সপ্তাহের বৃহস্পতিবার বাদে <br/>
              ট্যুর প্যাকেজ বুকিং করতে হলে আপনাকে <br/>
              কাস্টম বুকিংয়ের জন্য এডমিনের সাথে বিস্তারিত আলোচনা করতে হবে।
            </div>
            <div style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
              📞 <b>এডমিন মোবাইল নম্বর :</b> +৮৮০১৭০০০-০০০৯৯
            </div>
            <div style={{ fontSize: '1rem' }}>
              📧 <b>এডমিন ইমেইল:</b> admin@admin.com
            </div>
          </div>
        </div>
      )}
    </>
  );
}
