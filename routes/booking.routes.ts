import { Router } from "express";;
import * as BookingCtrl from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// POST /bookings
router.post("/", verifyToken, BookingCtrl.createBooking);

// GET /bookings
router.get("/", verifyToken, BookingCtrl.getMyBookings);

// PATCH /bookings/:id/cancel
router.patch("/:id/cancel", verifyToken, BookingCtrl.cancelBooking);

// PATCH /bookings/:id/status
router.patch("/:id/status", verifyToken, BookingCtrl.updateBookingStatus);

export default router;