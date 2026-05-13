import type { Response } from "express";
import db from '../Database/Utils/db.js'
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { CreateBookingSchema } from "../Utils/schemas/booking.schema.js";
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "../Utils/AppError.js";
import { meiliService } from "../services/meilisearch.service.js";
import type { IBookingDocument } from "../types/types.js";

const toBookingDoc = (booking: any): IBookingDocument => ({
    id: booking.id,
    status: booking.status,
    checkInDate: booking.checkInDate.toISOString(),
    checkOutDate: booking.checkOutDate.toISOString(),
    totalPrice: Number(booking.totalPrice),
    userId: booking.userId,
    userName: booking.user?.fullName ?? '',
    userEmail: booking.user?.email ?? '',
    roomId: booking.roomId,
    roomTitle: booking.room?.title ?? '',
    roomCity: booking.room?.city ?? '',
    createdAt: booking.createdAt.toISOString(),
});

// POST /bookings
export const createBooking = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    const result = CreateBookingSchema.safeParse(req.body);
    if (!result.success) throw new ValidationError(result.error.issues);

    const { roomId, checkIn: start, checkOut: end } = result.data;

    if (start < new Date()) throw new BadRequestError('Invalid dates');

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundError('Room not found.');
    if (room.status !== 'APPROVED') throw new BadRequestError('This room is not available for booking.');

    const overlappingBooking = await db.booking.findFirst({
        where: {
            roomId,
            status: { in: ['CONFIRMED', 'PENDING'] },
            OR: [
                {
                    AND: [
                        { checkInDate: { lt: end } },
                        { checkOutDate: { gt: start } },
                    ]
                }
            ]
        }
    });

    if (overlappingBooking) throw new BadRequestError('Room is already booked for these dates');

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * Number(room.pricePerNight);

    const user = await db.user.findUnique({ where: { id: userId }, select: { fullName: true, email: true } });

    const booking = await db.booking.create({
        data: { checkInDate: start, checkOutDate: end, totalPrice, userId, roomId, status: 'PENDING' }
    });

    await meiliService.upsertBooking(toBookingDoc({
        ...booking, user, room,
    }));

    return res.status(201).json({ message: 'Booking requested', booking });
})

// GET /bookings
export const getMyBookings = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const bookings = await db.booking.findMany({
        where: { userId },
        include: {
            room: {
                select: { title: true, address: true, city: true, images: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ data: bookings });
})

// GET /bookings/host
export const getHostReservations = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id: userId, role } = req.user;

    if (role !== 'HOST' && role !== 'ADMIN') {
        throw new ForbiddenError("You're not allowed to do this action");
    }

    const bookings = await db.booking.findMany({
        where: role === 'ADMIN' ? {} : { room: { hostId: userId } },
        include: {
            room: { select: { id: true, title: true, city: true, address: true, hostId: true } },
            user: { select: { id: true, fullName: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ data: bookings });
})

// PATCH /bookings/:id/status
export const updateBookingStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const userRole = req.user.role;

    const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!VALID_STATUSES.includes(status)) throw new BadRequestError("Invalid status.");

    if (userRole !== 'ADMIN' && userRole !== 'HOST') {
        throw new ForbiddenError("You're not allowed to do this action");
    }

    const booking = await db.booking.findUnique({ where: { id }, include: { room: true } });
    if (!booking) throw new NotFoundError('Booking not found.');
    if (userRole === 'HOST' && booking.room.hostId !== req.user.id) {
        throw new ForbiddenError("You're not allowed to do this action");
    }

    const updatedBooking = await db.booking.update({
        where: { id },
        data: { status },
        include: { user: { select: { fullName: true, email: true } }, room: { select: { title: true, city: true } } }
    });

    await meiliService.upsertBooking(toBookingDoc(updatedBooking));

    return res.status(200).json({ message: `Booking ${status.toLowerCase()} successfully`, data: updatedBooking });
});

// PATCH /bookings/:id/cancel
export const cancelBooking = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== userId) {
        throw new ForbiddenError('You can only cancel your own bookings');
    }

    if (booking.status !== 'PENDING') {
        throw new BadRequestError('Cannot cancel a booking that is already confirmed or completed');
    }

    const cancelled = await db.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { user: { select: { fullName: true, email: true } }, room: { select: { title: true, city: true } } }
    });

    await meiliService.upsertBooking(toBookingDoc(cancelled));

    return res.status(200).json({ message: 'Booking cancelled' });
});
