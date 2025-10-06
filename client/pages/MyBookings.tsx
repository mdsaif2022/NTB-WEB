import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from 'react-helmet-async';
import { Link } from "react-router-dom";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Expired", value: "expired" },
  { label: "Rejected", value: "rejected" },
];

// Helper to map booking status to badge variant
function getBadgeVariant(status: string) {
  switch (status) {
    case "approved": return "default";
    case "pending": return "secondary";
    case "expired": return "destructive";
    case "rejected": return "destructive";
    default: return "outline";
  }
}

export default function MyBookings() {
  const { userProfile } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    setLoading(true);
    // Fetch all bookings for this user from backend
    fetch(`/api/bookings?email=${encodeURIComponent(userProfile.user.email)}`)
      .then(res => res.json())
      .then(data => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, [userProfile]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    await fetch(`/api/bookings/${bookingId}/reject`, { method: "POST" });
    setBookings(bookings => bookings.map(b => b.id === bookingId ? { ...b, status: "rejected" } : b));
  };

  const filteredBookings = bookings.filter((b) =>
    statusFilter === "all" ? true : b.status === statusFilter
  );

  return (
    <div className="max-w-5xl mx-auto pt-24 pb-10 px-4">
      <Helmet>
        <title>My Bookings | Explore Bangladesh</title>
        <meta name="description" content="View and manage your tour bookings, seat details, and status." />
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
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
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Tour</th>
                    <th className="text-left p-2">Route</th>
                    <th className="text-left p-2">Seats</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="p-2">{booking.date}</td>
                      <td className="p-2">{booking.tourName}</td>
                      <td className="p-2">{booking.from} → {booking.to}</td>
                      <td className="p-2">{(booking.seats || []).join(", ")}</td>
                      <td className="p-2">
                        <Badge variant={getBadgeVariant(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {booking.status === "pending" && (
                          <Button size="sm" variant="destructive" onClick={() => handleCancel(booking.id)}>
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <Link to="/tours" className="text-emerald-600 hover:underline">
          ← Back to Tours
        </Link>
      </div>
    </div>
  );
} 