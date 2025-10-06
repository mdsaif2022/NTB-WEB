import { RequestHandler } from "express";
import { Booking, CreateBookingRequest, CreateBookingResponse, BookingStatusResponse } from "../../shared/api";
import { v4 as uuidv4 } from "uuid";

// In-memory bookings
export const bookings: Record<string, Booking> = {};

// In-memory admin notifications
const adminNotifications: any[] = [];

// POST /api/bookings
export const handleCreateBooking: RequestHandler = (req, res) => {
  const { user, busId, seats } = req.body as CreateBookingRequest;
  if (!user || !busId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
  const booking: Booking = {
    id: uuidv4(),
    user,
    busId,
    seats,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  bookings[booking.id] = booking;
  // Add admin notification
  adminNotifications.unshift({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: "tour_update",
    title: "New Booking Pending Approval",
    message: `${user.name} booked seats on bus ${busId}.`,
    sender: { id: 1, name: "System", role: "system" },
    priority: "high",
    isRead: false,
    createdAt: now.toISOString(),
    actionUrl: "/admin/bookings",
    metadata: { bookingId: booking.id },
  });
  const response: CreateBookingResponse = { booking };
  res.status(201).json(response);
};

// GET /api/bookings/:id/status
export const handleBookingStatus: RequestHandler = (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const response: BookingStatusResponse = {
    status: booking.status,
    expiresAt: booking.expiresAt,
  };
  res.json(response);
};

// POST /api/bookings/:id/approve
export const handleApproveBooking: RequestHandler = (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status !== "pending") {
    return res.status(400).json({ error: "Booking is not pending" });
  }
  booking.status = "approved";
  res.json({ success: true, booking });
};

// POST /api/bookings/:id/reject
export const handleRejectBooking: RequestHandler = (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status !== "pending") {
    return res.status(400).json({ error: "Booking is not pending" });
  }
  booking.status = "rejected";
  // Optionally: release seats in busSeatMaps here
  res.json({ success: true, booking });
};

// GET /api/notifications?role=admin
export const handleGetAdminNotifications: RequestHandler = (req, res) => {
  if (req.query.role === "admin") {
    res.json({ notifications: adminNotifications });
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
};

// Background job to expire bookings
setInterval(() => {
  const now = Date.now();
  Object.values(bookings).forEach((booking) => {
    if (
      booking.status === "pending" &&
      new Date(booking.expiresAt).getTime() < now
    ) {
      booking.status = "expired";
      // Optionally: release seats in busSeatMaps here
    }
  });
}, 60 * 1000); // check every minute 