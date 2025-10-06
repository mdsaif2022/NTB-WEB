import { RequestHandler } from "express";
import { bookings } from "./booking";

// POST /api/payment/bkash/initiate
export const handleBkashInitiate: RequestHandler = (req, res) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || !amount) {
    return res.status(400).json({ error: "Missing bookingId or amount" });
  }
  // In real integration, call bKash API here and get payment URL/token
  // For demo, return a mock payment URL
  const paymentUrl = `/mock-bkash-payment?bookingId=${bookingId}&amount=${amount}`;
  res.json({ paymentUrl });
};

// POST /api/payment/bkash/callback
export const handleBkashCallback: RequestHandler = (req, res) => {
  const { bookingId, paymentStatus } = req.body;
  if (!bookingId || !paymentStatus) {
    return res.status(400).json({ error: "Missing bookingId or paymentStatus" });
  }
  // In real integration, verify payment with bKash API
  // For demo, approve booking if paymentStatus === 'success'
  if (paymentStatus === "success" && bookings[bookingId]) {
    bookings[bookingId].status = "approved";
    return res.json({ success: true, message: "Booking approved." });
  }
  res.json({ success: false, message: "Payment failed or booking not found." });
}; 