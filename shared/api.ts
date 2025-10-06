/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Bus seat types
export interface BusSeat {
  id: string; // e.g., 'A1', 'J', etc.
  isAvailable: boolean;
  bookedBy?: string; // user/session id (optional)
  reservedBy?: string; // user/session id (optional, for temporary reservation)
  reservedUntil?: string; // ISO string, reservation expiry time
}

export type BusSeatMap = BusSeat[];

// GET /api/buses/:busId/seats
export interface GetBusSeatsResponse {
  busId: string;
  seats: BusSeatMap;
}

// POST /api/buses/:busId/seats
export interface UpdateBusSeatsRequest {
  busId: string;
  selectedSeats: string[]; // seat ids to book/unbook
  userId: string; // required, for multi-user seat reservation
}
export interface UpdateBusSeatsResponse {
  success: boolean;
  seats: BusSeatMap;
}

// Booking status types
export type BookingStatus = 'pending' | 'approved' | 'expired' | 'rejected';

export interface Booking {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  busId: string;
  seats: string[];
  status: BookingStatus;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
}

// POST /api/bookings (create booking)
export interface CreateBookingRequest {
  user: Booking['user'];
  busId: string;
  seats: string[];
}
export interface CreateBookingResponse {
  booking: Booking;
}

// GET /api/bookings/:id/status
export interface BookingStatusResponse {
  status: BookingStatus;
  expiresAt: string;
}
