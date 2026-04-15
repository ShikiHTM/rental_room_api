import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import db from '../Database/Utils/db.js'

export const createBooking = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = (req.user as any).userId;
        const { roomId, checkIn, checkOut } = req.body;

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if(start >= end || start < new Date()) {
            return res.status(400).json({ message: 'Invalid dates' });
        }

        const room = await db.room.findUnique({ where: { id: roomId } });
        if(!room) return res.status(404).json({ message: 'Room not found.' });

        const overlappingBooking = await db.booking.findFirst({
            where: {
                roomId: roomId,
                status: { in: ['CONFIRMED', 'PENDING'] },
                OR: [
                    {
                        AND: [
                            {checkInDate: {lt: end }},
                            {checkOutDate: {lt: start }},
                        ]
                    }
                ]
            }
        });

        if(overlappingBooking) {
            return res.status(400).json({ message: 'Room is alraedy booked for these dates' });
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000*60*60*24));
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
        res.status(201).json({ message: 'Booking requested', booking });
    }catch(error) {
        return res.status(500).json({ message: 'Internal server error.' })
    }
}

// GET /bookings/my_bookings
export const getMyBooking = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = (req.user as any).userId;
        const bookings = await db.booking.findMany({
        where: { userId },
            include: {
                room: {
                select: { title: true, address: true, city: true, images: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ data: bookings });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

// PATCH /bookings/:id/status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params as {id: string};
    const { status } = req.body; // CONFIRMED or REJECTED
    const userRole = (req.user as any).role;

    if (userRole !== 'ADMIN' && userRole !== 'HOST') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ message: `Booking ${status.toLowerCase()} successfully`, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /bookings/:id/cancel
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params as {id: string};
    const userId = (req.user as any).userId;

    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cannot cancel a booking that is already confirmed or completed' });
    }

    await db.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.status(200).json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};