import type { Response } from "express";
import db from '../Database/Utils/db.js'
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { CreateBookingSchema } from "../Utils/schemas/booking.schema.js";
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "../Utils/AppError.js";

// POST /bookings
export const createBooking = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    const result = CreateBookingSchema.safeParse(req.body);
    if (!result.success) throw new ValidationError(result.error.issues);

    const { roomId, checkIn: start, checkOut: end } = result.data;

    if (start < new Date()) throw new BadRequestError('Invalid dates');

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundError('Room not found.');

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

    const booking = await db.booking.create({
        data: {
            checkInDate: start,
            checkOutDate: end,
            totalPrice,
            userId,
            roomId,
            status: 'PENDING'
        }
    })
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

// PATCH /bookings/:id/status
export const updateBookingStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const userRole = req.user.role;

    if (userRole !== 'ADMIN' && userRole !== 'HOST') {
        throw new ForbiddenError("You're not allowed to do this action");
    }

    const updatedBooking = await db.booking.update({
        where: { id },
        data: { status }
    });

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

    await db.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
    });

    return res.status(200).json({ message: 'Booking cancelled' });
});
