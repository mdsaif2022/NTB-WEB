import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetTourSeats, handleUpdateTourSeats } from "./routes/busSeats";
import { handleCreateBooking, handleBookingStatus, handleApproveBooking, handleRejectBooking, handleGetAdminNotifications } from "./routes/booking";
import { handleBkashInitiate, handleBkashCallback } from "./routes/payment";
import paymentSettingsRouter from "./routes/paymentSettings";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/tours/:tourId/seats", handleGetTourSeats);
  app.post("/api/tours/:tourId/seats", handleUpdateTourSeats);
  app.post("/api/bookings", handleCreateBooking);
  app.get("/api/bookings/:id/status", handleBookingStatus);
  app.post("/api/bookings/:id/approve", handleApproveBooking);
  app.post("/api/bookings/:id/reject", handleRejectBooking);
  app.get("/api/notifications", handleGetAdminNotifications);
  app.post("/api/payment/bkash/initiate", handleBkashInitiate);
  app.post("/api/payment/bkash/callback", handleBkashCallback);
  app.use("/api/payment-settings", paymentSettingsRouter);

  return app;
}
