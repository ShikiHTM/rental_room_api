import { Router } from "express";
import * as adminCtrl from '../controllers/admin.controller.js';
import * as roomCtrl from '../controllers/room.controller.js';
import * as bookingCtrl from '../controllers/booking.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router: Router = Router();

router.use(verifyToken, isAdmin);

// Rooms
router.get('/rooms', roomCtrl.getRooms);
router.get('/rooms/:id', roomCtrl.getRoom);
router.patch('/rooms/:roomId/approve', adminCtrl.approveRoom);
router.patch('/rooms/:roomId/reject', adminCtrl.rejectRoom);
router.delete('/rooms/:id', roomCtrl.deleteRoom);

// Users
router.get('/users', adminCtrl.getUsers);
router.patch('/users/:id/ban', adminCtrl.banUser);
router.patch('/users/:id/unban', adminCtrl.unbanUser);

// Bookings
router.get('/bookings', adminCtrl.getAllBookings);
router.get('/bookings/search', adminCtrl.searchBookings);
router.patch('/bookings/:id/status', bookingCtrl.updateBookingStatus);

export default router;
