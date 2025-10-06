import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTours } from "@/contexts/TourContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  Star,
  DollarSign,
  Calendar,
  Image,
  Upload,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useBookings } from "@/contexts/BookingContext";
import { Helmet } from 'react-helmet-async';
import { BusSeatMap } from "../../shared/api";
import BulkTourManagement from "@/components/admin/BulkTourManagement";

function AdminSeatManager({ tourId, adminId }: { tourId: number, adminId: string }) {
  const [seatMap, setSeatMap] = useState<BusSeatMap>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Fetch seat map for this tour
  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tours/${tourId}/seats`);
      const data = await res.json();
      setSeatMap(data.seats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeats(); }, [tourId]);

  // Book or release seat as admin
  const handleSeatClick = (seatId: string) => {
    const isSelected = selectedSeats.includes(seatId);
    const newSelected = isSelected
      ? selectedSeats.filter(id => id !== seatId)
      : [...selectedSeats, seatId];
    setSelectedSeats(newSelected);
  };

  const handleBookSeats = async () => {
    await fetch(`/api/tours/${tourId}/seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        busId: tourId,
        selectedSeats,
        userId: adminId,
      }),
    });
    setSelectedSeats([]);
    fetchSeats();
  };

  return (
    <div className="my-4">
      <h4 className="font-semibold mb-2">Seat Map (Admin)</h4>
      <div className="grid grid-cols-8 gap-1 mb-2">
        {seatMap.map(seat => {
          const isBooked = !!seat.bookedBy;
          const isReserved = !!seat.reservedBy && seat.reservedBy !== adminId;
          const isReservedByMe = !!seat.reservedBy && seat.reservedBy === adminId;
          let seatClass = '';
          if (isBooked) seatClass = 'bg-red-100 border-red-300 text-red-400';
          else if (isReservedByMe) seatClass = 'bg-blue-100 border-blue-400 text-blue-700';
          else if (isReserved) seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700';
          else seatClass = 'bg-green-100 border-green-400 text-green-700';
          return (
            <button
              key={seat.id}
              className={`w-8 h-8 rounded border text-xs font-medium ${seatClass}`}
              disabled={isBooked || isReserved}
              onClick={() => handleSeatClick(seat.id)}
            >
              {seat.id}
            </button>
          );
        })}
      </div>
      <Button size="sm" className="bg-emerald-600 text-white" onClick={handleBookSeats} disabled={selectedSeats.length === 0}>
        Book Selected Seats
      </Button>
    </div>
  );
}

export default function TourManagement() {
  const { tours, deleteTour, updateTour } = useTours();
  const { bookings, updateBooking, deleteBooking } = useBookings();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTour, setEditingTour] = useState<any>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const { isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tour.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleUpdateTour = () => {
    if (editingTour) {
      console.log("TourManagement: Updating tour", editingTour.id, editingTour);
      updateTour(editingTour.id, editingTour);
      setUpdateSuccess(true);
      setShowEditModal(false);
      setEditingTour(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  const handleUpdatePricing = () => {
    if (editingTour) {
      console.log("TourManagement: Updating pricing", editingTour.id, editingTour.price);
      updateTour(editingTour.id, { price: editingTour.price });
      setUpdateSuccess(true);
      setShowPricingModal(false);
      setEditingTour(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  // Test function to verify tour updates
  const testTourUpdate = () => {
    if (tours.length > 0) {
      const testTour = tours[0];
      const updatedTour = { ...testTour, price: testTour.price + 1000 };
      console.log("TourManagement: Testing tour update", testTour.id, updatedTour);
      updateTour(testTour.id, updatedTour);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  // Helper to get tour by ID
  const getTourById = (id: number) => tours.find((t) => t.id === id);

  // Get recent bookings (last 10)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    .slice(0, 10);

  // Approve booking
  const handleApprove = (bookingId: string) => {
    updateBooking(bookingId, { status: "confirmed" });
  };
  // Edit booking (for demo, just alert)
  const handleEdit = (booking: any) => {
    alert(`Edit booking for ${booking.user.name} (ID: ${booking.id})`);
  };
  // Delete booking
  const handleDelete = (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      deleteBooking(bookingId);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tour Management | Admin | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin panel for managing tours on Explore Bangladesh." />
        <meta property="og:title" content="Tour Management | Admin | Explore Bangladesh" />
        <meta property="og:description" content="Admin panel for managing tours on Explore Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin/tours" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
      {/* Success Message */}
      {updateSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center space-x-2 shadow-lg">
          <CheckCircle className="w-5 h-5" />
            <div>
            <div className="font-medium">Tour Updated Successfully!</div>
            <div className="text-sm">Changes will appear on the user site immediately.</div>
            <div className="text-xs mt-1">You can also use the "Force Reload" button on the user site to refresh.</div>
            </div>
            </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tour Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage tour packages, pricing, and availability
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              asChild
            >
              <Link to="/admin/new-tour">
              <Plus className="w-4 h-4 mr-2" />
              Add New Tour
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={testTourUpdate}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Test Update
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tours.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Tours
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tours.filter((t) => t.status === "active").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tours.reduce((sum, tour) => sum + tour.bookings, 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    tours.reduce((sum, tour) => sum + tour.rating, 0) /
                    tours.length
                  ).toFixed(1)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Tour Management */}
      <BulkTourManagement className="mb-8" />

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tours by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tours ({filteredTours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-2xl">
                          {tour.image}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tour.name}
                          </p>
                          <p className="text-sm text-gray-500">ID: {tour.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {tour.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ৳{tour.price.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">{tour.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(tour.status)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{tour.bookings}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTour(tour);
                              setShowEditModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingTour(tour);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Tour
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingTour(tour);
                              setShowPricingModal(true);
                            }}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Manage Pricing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete "${tour.name}"?`,
                                )
                              ) {
                                deleteTour(tour.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Tour
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tour Bookings Management */}
      <div className="mb-10 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Tour Bookings Management
              <span className="text-xs text-gray-500">(Last 10 bookings)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Persons</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => {
                    const tour = getTourById(booking.tourId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{booking.tourName}</div>
                            <div className="text-xs text-gray-500">ID: {booking.tourId}</div>
                            {tour && (
                              <div className="text-xs text-gray-500">{tour.location}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.user.name}</div>
                            <div className="text-xs text-gray-500">{booking.user.email}</div>
                            <div className="text-xs text-gray-500">{booking.user.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                        <TableCell>{booking.persons}</TableCell>
                        <TableCell>৳{booking.amount.toLocaleString()}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {booking.status === "pending" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(booking.id)}>
                              Approve
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEdit(booking)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(booking.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tour Details Modal */}
      {selectedTour && (
        <Dialog
          open={!!selectedTour}
          onOpenChange={() => setSelectedTour(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTour.name}</DialogTitle>
              <DialogDescription>
                Detailed information about this tour package
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-6xl">
                  {selectedTour.image}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {selectedTour.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTour.highlights.map(
                      (highlight: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {highlight}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Location
                    </label>
                    <p className="text-sm mt-1">{selectedTour.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Duration
                    </label>
                    <p className="text-sm mt-1">{selectedTour.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Price
                    </label>
                    <p className="text-sm mt-1 font-semibold">
                      ৳{selectedTour.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Rating
                    </label>
                    <p className="text-sm mt-1">{selectedTour.rating} ⭐</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Max Participants
                    </label>
                    <p className="text-sm mt-1">
                      {selectedTour.maxParticipants}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Bookings
                    </label>
                    <p className="text-sm mt-1 font-semibold">
                      {selectedTour.bookings}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What's Included
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedTour.includes.map(
                      (item: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(selectedTour.status)}
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">Created:</span>
                    <span>{selectedTour.createdDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTour(null)}>
                Close
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Edit Tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Tour Modal */}
      {editingTour && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tour Package</DialogTitle>
              <DialogDescription>
                Update the details of {editingTour.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Tour Name
                  </label>
                  <Input
                    defaultValue={editingTour.name}
                    onChange={(e) =>
                      setEditingTour({ ...editingTour, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Duration
                  </label>
                  <Input
                    defaultValue={editingTour.duration}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    defaultValue={editingTour.maxParticipants}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        maxParticipants: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Price (৳)
                  </label>
                  <Input
                    type="number"
                    defaultValue={editingTour.price}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Status
                  </label>
                  <Select
                    defaultValue={editingTour.status}
                    onValueChange={(value) =>
                      setEditingTour({ ...editingTour, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    defaultValue={editingTour.description}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        description: e.target.value,
                      })
                    }
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Current Highlights
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editingTour.highlights?.map(
                      (highlight: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {highlight}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    What's Included
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editingTour.includes?.map(
                      (include: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {include}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleUpdateTour}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Pricing Modal */}
      {editingTour && (
        <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Pricing - {editingTour.name}</DialogTitle>
              <DialogDescription>
                Update pricing and booking settings for this tour package
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Pricing */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-3">
                  Current Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Base Price:</span>
                    <p className="font-semibold text-xl">
                      ৳{editingTour.price?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Bookings:</span>
                    <p className="font-semibold">{editingTour.bookings}</p>
                  </div>
                </div>
              </div>

              {/* Price Updates */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    New Base Price (৳)
                  </label>
                  <Input
                    type="number"
                    defaultValue={editingTour.price}
                    onChange={(e) =>
                      setEditingTour({
                        ...editingTour,
                        price: parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter new price"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Discount Percentage (Optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 10 for 10% discount"
                    max="50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Early Bird Price (৳)
                  </label>
                  <Input
                    type="number"
                    placeholder="Special early booking price"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Group Discount (5+ people)
                  </label>
                  <Input
                    type="number"
                    placeholder="Discount amount per person"
                  />
                </div>
              </div>

              {/* Pricing Notes */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">
                  Pricing Guidelines:
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Consider seasonal demand when setting prices</li>
                  <li>• Early bird pricing can boost advance bookings</li>
                  <li>• Group discounts encourage larger bookings</li>
                  <li>• Price changes affect all future bookings</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPricingModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleUpdatePricing}
              >
                Update Pricing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
