import { useBookings } from "@/contexts/BookingContext";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "confirmed" },
  { label: "Rejected", value: "cancelled" },
];

// Helper to get time left in mm:ss
function getTimeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// Add a local type for admin bookings
interface AdminBooking {
  id: string;
  user: { name: string; email: string };
  tourName: string;
  date: string;
  persons: number;
  amount: number;
  status: string;
  expiresAt?: string;
}

// Define a normalization function for bookings
function normalizeBooking(raw: any): AdminBooking {
  return {
    id: String(raw.id),
    user: {
      name: raw.user && raw.user.name ? String(raw.user.name) : '',
      email: raw.user && raw.user.email ? String(raw.user.email) : '',
    },
    tourName: raw.tourName ? String(raw.tourName) : '',
    date: raw.date ? String(raw.date) : '',
    persons: typeof raw.persons === 'number' ? raw.persons : parseInt(raw.persons) || 0,
    amount: typeof raw.amount === 'number' ? raw.amount : parseFloat(raw.amount) || 0,
    status: String(raw.status),
    expiresAt: raw.expiresAt ? String(raw.expiresAt) : undefined,
  };
}

export default function BookingManagement() {
  const { bookings, updateBooking, deleteBooking } = useBookings();
  const { userProfile, setUserProfile } = useUser();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Helper to update user profile bookings (now handled by real-time events)
  const updateUserBookingStatus = (bookingId: number, action: "confirm" | "reject") => {
    // This function is now deprecated - real-time updates are handled by BookingContext events
    console.log("updateUserBookingStatus called but real-time updates are now handled automatically");
  };

  // Poll for updates every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      // No longer need to reload the page - real-time updates handle this
      console.log("Admin panel: Checking for updates...");
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Approve booking via backend
  const handleConfirm = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await fetch(`/api/bookings/${bookingId}/approve`, { method: "POST" });
      // Update the booking status locally to trigger real-time events
      updateBooking(bookingId, { status: "confirmed" });
    } catch (error) {
      console.error("Error approving booking:", error);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Reject booking via backend
  const handleReject = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await fetch(`/api/bookings/${bookingId}/reject`, { method: "POST" });
      // Update the booking status locally to trigger real-time events
      updateBooking(bookingId, { status: "cancelled" });
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Enhanced filtering and sorting
  const filteredBookings: AdminBooking[] = (bookings as any[])
    .map(normalizeBooking)
    .filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          booking.user.name.toLowerCase().includes(term) ||
          booking.user.email.toLowerCase().includes(term) ||
          booking.tourName.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      } else {
        // status
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>All Tour Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search by user, email, or tour..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-64"
            />
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                onClick={() => setStatusFilter(filter.value)}
                className={statusFilter === filter.value ? "font-bold" : ""}
              >
                {filter.label}
              </Button>
            ))}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm ml-2"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(o => (o === "asc" ? "desc" : "asc"))}
              className="ml-1"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Tour</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Persons</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="p-2">{booking.user.name}</td>
                    <td className="p-2">{booking.tourName}</td>
                    <td className="p-2">{booking.date}</td>
                    <td className="p-2">{booking.persons}</td>
                    <td className="p-2">৳{booking.amount.toLocaleString()}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {booking.status === "confirmed"
                          ? "Approved"
                          : booking.status === "pending"
                          ? "Pending"
                          : "Rejected"}
                      </span>
                      {booking.status === "pending" && (
                        <div className="text-xs text-gray-500 mt-1">
                          Time left: {booking.expiresAt ? getTimeLeft(booking.expiresAt) : "—"}
                        </div>
                      )}
                    </td>
                    <td className="p-2 space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionLoading === booking.id}
                            onClick={() => handleConfirm(booking.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === booking.id}
                            onClick={() => handleReject(booking.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 