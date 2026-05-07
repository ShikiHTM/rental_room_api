import { Router } from "express";
import authRoutes from './auth.routes.js';
import roomRoutes from './room.routes.js';
import bookingRoutes from './booking.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import reviewRouter from './review.routes.js';

const v1Router: Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/rooms', roomRoutes);
v1Router.use('/bookings', bookingRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/reviews', reviewRouter);

export default v1Router;
