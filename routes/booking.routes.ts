import { Router } from "express";;
import * as BookingCtrl from "../controllers/booking.controller.js";
import { checkBanned, verifyToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// POST /bookings
router.post("/", verifyToken, checkBanned, BookingCtrl.createBooking);

// GET /bookings
router.get("/", verifyToken, checkBanned, BookingCtrl.getMyBookings);

// GET /bookings/host
router.get("/host", verifyToken, checkBanned, BookingCtrl.getHostReservations);

// PATCH /bookings/:id/cancel
router.patch("/:id/cancel", verifyToken, checkBanned, BookingCtrl.cancelBooking);

// PATCH /bookings/:id/status
router.patch("/:id/status", verifyToken, checkBanned, BookingCtrl.updateBookingStatus);

export default router;