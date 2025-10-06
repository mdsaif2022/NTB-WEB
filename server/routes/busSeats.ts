import { RequestHandler } from "express";
import { GetBusSeatsResponse, UpdateBusSeatsRequest, UpdateBusSeatsResponse, BusSeatMap } from "../../shared/api";

// In-memory seat maps for each tour/package
const SEAT_IDS = [
  ...[].concat(...["A","B","C","D","E","F","G","H","I"].map(row => [1,2,3,4].map(num => `${row}${num}`))),
  "J","K","L","M"
];
const RESERVATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
// tourId (string/number) -> seat map
const tourSeatMaps: Record<string, BusSeatMap> = {};

// Helper: Initialize seat map for a tour if not present
function ensureTourSeatMap(tourId: string) {
  if (!tourSeatMaps[tourId]) {
    tourSeatMaps[tourId] = SEAT_IDS.map(id => ({ id, isAvailable: true }));
  }
}

// Helper: Clean up expired reservations
function cleanupExpiredReservations(tourId: string) {
  const now = Date.now();
  tourSeatMaps[tourId] = tourSeatMaps[tourId].map(seat => {
    if (seat.reservedUntil && new Date(seat.reservedUntil).getTime() < now) {
      // Expired reservation
      return { ...seat, reservedBy: undefined, reservedUntil: undefined, isAvailable: !seat.bookedBy };
    }
    return seat;
  });
}

// GET /api/tours/:tourId/seats
export const handleGetTourSeats: RequestHandler = (req, res) => {
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json({ error: "Missing tourId" });
  }
  ensureTourSeatMap(tourId);
  cleanupExpiredReservations(tourId);
  const seats = tourSeatMaps[tourId];
  const response: GetBusSeatsResponse = { busId: String(tourId), seats };
  res.json(response);
};

// POST /api/tours/:tourId/seats
export const handleUpdateTourSeats: RequestHandler = (req, res) => {
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json({ error: "Missing tourId" });
  }
  ensureTourSeatMap(tourId);
  const { selectedSeats, userId } = req.body as UpdateBusSeatsRequest;
  if (!Array.isArray(selectedSeats) || typeof userId !== 'string' || !userId) {
    return res.status(400).json({ error: "selectedSeats must be an array and userId is required" });
  }
  cleanupExpiredReservations(tourId);
  // Mark all seats as available, then mark selected as reserved by userId
  tourSeatMaps[tourId] = tourSeatMaps[tourId].map(seat => {
    // If seat is booked, it cannot be reserved
    if (seat.bookedBy) {
      return { ...seat, isAvailable: false };
    }
    // If seat is reserved by another user and not expired, keep it reserved
    if (seat.reservedBy && seat.reservedBy !== userId && seat.reservedUntil && new Date(seat.reservedUntil).getTime() > Date.now()) {
      return { ...seat, isAvailable: false };
    }
    // If seat is in selectedSeats, reserve for this user
    if (selectedSeats.includes(seat.id)) {
      return {
        ...seat,
        reservedBy: userId,
        reservedUntil: new Date(Date.now() + RESERVATION_TIMEOUT_MS).toISOString(),
        isAvailable: false,
      };
    }
    // Otherwise, clear reservation if it was by this user
    if (seat.reservedBy === userId) {
      return { ...seat, reservedBy: undefined, reservedUntil: undefined, isAvailable: true };
    }
    // Otherwise, seat is available
    return { ...seat, isAvailable: true };
  });
  const response: UpdateBusSeatsResponse = {
    success: true,
    seats: tourSeatMaps[tourId],
  };
  res.json(response);
}; 