import type { Request, Response } from "express";
import db from '../Database/Utils/db.js'
import { catchAsync } from "../Utils/catchAsync.utils.js";

const bookingStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

export const createBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
        throw { status: 400, message: 'Missing required fields' };
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw { status: 400, message: 'Invalid dates' };
    }

    if (start >= end || start < new Date()) {
        throw { status: 400, message: 'Invalid dates' }
    }

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) throw { status: 404, message: 'Room not found.' };

    if (room.status !== 'APPROVED') {
        throw { status: 400, message: 'Room is not available for booking' };
    }

    const overlappingBooking = await db.booking.findFirst({
        where: {
            roomId: roomId,
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

    if (overlappingBooking) {
        throw { status: 400, message: 'Room is alraedy booked for these dates' };
    }

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

// GET /bookings/my_bookings
export const getMyBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

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
export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const userRole = req.user.role;

    if (userRole !== 'ADMIN' && userRole !== 'HOST') {
        throw { status: 403, message: "Forbidden: You're not allow to to do this action" };
    }

    if (!bookingStatuses.includes(status)) {
        throw { status: 400, message: 'Invalid booking status' };
    }

    const booking = await db.booking.findUnique({
        where: { id },
        include: { room: true }
    });

    if (!booking) {
        throw { status: 404, message: 'Booking not found' };
    }

    if (userRole === 'HOST' && booking.room.hostId !== req.user.id) {
        throw { status: 403, message: 'Forbidden: You can only update bookings from your own room' };
    }

    const updatedBooking = await db.booking.update({
        where: { id },
        data: { status }
    });

    return res.status(200).json({ message: `Booking ${status.toLowerCase()} successfully`, data: updatedBooking });
});

// PATCH /bookings/:id/cancel
export const cancelBooking = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params as { id: string };
    const userId = req.user.id;

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== userId) {
        throw { status: 403, message: 'Forbidden: You can only cancel your own bookings' };
    }

    if (booking.status !== 'PENDING') {
        throw { status: 403, message: 'Forbidden: Cannot cancel a booking that is already confirmed or completed' };
    }

    await db.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
    });

    return res.status(200).json({ message: 'Booking cancelled' });
});
