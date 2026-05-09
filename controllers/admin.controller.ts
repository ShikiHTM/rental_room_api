import type { Response } from "express";
import db from "../Database/Utils/db.js"
import { catchAsync } from "../Utils/catchAsync.utils.js";
import { BadRequestError, NotFoundError } from "../Utils/AppError.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { meiliService } from "../services/meilisearch.service.js";

export const approveRoom = catchAsync(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params as { roomId: string };

    const room = await db.room.findUnique({
        where: { id: roomId },
        include: { host: true }
    });

    if (!room) throw new NotFoundError('Room not found.');

    const updateTasks: any[] = [
        db.room.update({
            where: {
                id: roomId
            },
            data: {
                status: 'APPROVED'
            }
        })
    ]

    if (room.host.role === 'USER') {
        updateTasks.push(
            db.user.update({
                where: {
                    id: room.hostId
                },
                data: {
                    role: 'HOST'
                }
            })
        )
    }

    await db.$transaction(updateTasks)
    await meiliService.upsertRoom({
        id: room.id, title: room.title, description: room.description,
        address: room.address, city: room.city,
        pricePerNight: Number(room.pricePerNight), maxGuests: room.maxGuests,
        status: 'APPROVED', hostId: room.hostId,
        hostName: room.host.fullName, createdAt: room.createdAt.toISOString(),
    });
    return res.status(200).json({ message: 'Room approved' });
})

export const rejectRoom = catchAsync(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params as { roomId: string };

    const room = await db.room.findUnique({ where: { id: roomId }, include: { host: true } });
    if (!room) throw new NotFoundError('Room not found.');

    await db.room.update({ where: { id: roomId }, data: { status: 'REJECTED' } });
    await meiliService.upsertRoom({
        id: room.id, title: room.title, description: room.description,
        address: room.address, city: room.city,
        pricePerNight: Number(room.pricePerNight), maxGuests: room.maxGuests,
        status: 'REJECTED', hostId: room.hostId,
        hostName: room.host.fullName, createdAt: room.createdAt.toISOString(),
    });
    return res.status(200).json({ message: 'Room rejected.' });
})

export const getUsers = catchAsync( async(_req: AuthRequest, res: Response) => {
    const users = await db.user.findMany();
    return res.status(200).json({ data: users });
})

export const getAllBookings = catchAsync( async(_req: AuthRequest, res: Response) => {
    const bookings = await db.booking.findMany({
        include: {
            user: { select: { fullName: true, email: true } },
            room: { select: { title: true, city: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ data: bookings });
})

export const searchBookings = catchAsync(async (req: AuthRequest, res: Response) => {
    const { q = '', status, userId, roomId } = req.query;

    const result = await meiliService.searchBookings(q as string, {
        ...(status && { status: status as string }),
        ...(userId && { userId: userId as string }),
        ...(roomId && { roomId: roomId as string }),
    });

    return res.status(200).json({ data: result.hits });
})

// PATCH /users/:id/ban
export const banUser = catchAsync( async(req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string }
    const { banReason = "No reason", banExpiresAt } = req.body;

    const user = await db.user.findUnique({ where: {id} });
    if(!user) throw new NotFoundError("User not found.");

    await db.user.update({ where: {id: user.id}, data: {
        ...(!user.bannedAt && { bannedAt: new Date() }),
        banReason,
        banExpiresAt
    }})

    return res.status(200).json({
        message: `Banned ${user.fullName}`,
        data: {
            banReason,
            banExpiresAt
        }
    });
})

// PATCH /users/:id/unban
export const unbanUser = catchAsync( async(req: AuthRequest, res: Response) => {
    const { id } = req.params as {id: string};

    const user = await db.user.findUnique({ where: {id} });
    if(!user || !user.bannedAt) throw new BadRequestError("User is either not banned or not found");

    await db.user.update({
        where: {id},
        data: {
            bannedAt: null,
            banReason: null,
            banExpiresAt: null
        }
    })

    return res.status(200).json({ message: `Unbanned ${user.fullName}` });
})