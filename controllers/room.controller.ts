import { type Request, type Response } from "express";
import db from '../Database/Utils/db.js'
import { type AuthRequest } from '../middlewares/auth.middleware.js'
import { roomService } from "../services/room.service.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../Utils/AppError.js";
import { meiliService } from "../services/meilisearch.service.js";

export const applyToBeHost = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user.role !== 'USER') throw new BadRequestError('You are already a Host');

    const newRoom = await roomService.handleRoomCreation(req.user.id, req.body);

    res.status(201).json({ message: 'Application sent. Once approved, you will become a Host.', data: newRoom });
})

// POST /create
export const createRoom = catchAsync(async (req: AuthRequest, res: Response) => {
    const pendingRoom = await db.room.findFirst({
        where: { hostId: req.user.id, status: 'PENDING' }
    })

    if(req.user?.role === 'USER') throw new ForbiddenError('You are not allowed to do this.');

    if (pendingRoom) throw new BadRequestError('You already have a pending application.');

    const newRoom = await roomService.handleRoomCreation(req.user.id, req.body);

    res.status(201).json({ message: 'Room created. It will be visible after Admin approval.', data: newRoom });
});

// GET /room (public)
export const getRooms = catchAsync(async (_req: Request, res: Response) => {

    const isAdmin = _req.user?.role === 'ADMIN';   

    const rooms = await db.room.findMany({
        ...(isAdmin ? {} : { where: {status: 'APPROVED'} }),
        include: {
            host: {
                select: { fullName: true }
            },
            reviews: true
        }
    })

    return res.status(200).json({ data: rooms })
});

// GET /room/:id (public)
export const getRoom = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const room = await db.room.findUnique({
        where: { id },
        include: {
            host: {
                select: {
                    fullName: true,
                    email: true
                }
            },
            reviews: true
        }
    })

    if (!room) throw new NotFoundError('Room not found.');

    if(room.status !== 'APPROVED') {
        const isAdmin = req.user?.role === 'ADMIN';
        const isOwner = req.user?.id === room.hostId;

        if(!isAdmin && !isOwner) throw new NotFoundError('Room not found.');
    }

    res.status(200).json({ data: room });
});

// PUT /room/[:id] (Owner/Admin only)
export const updateRoom = catchAsync(async (req: AuthRequest, res: Response) => {
    const roomId = req.params.id as string;

    const updatedRoom = await roomService.handleRoomUpdate(roomId, req.user, req.body)

    return res.status(200).json({
        message: 'Room updated successfully',
        data: updatedRoom
    })
})

// DELETE /room/[:id] (Admin and Room Owner)
export const deleteRoom = catchAsync(async (req: AuthRequest, res: Response) => {
    const roomId = req.params.id as string;

    await roomService.handleDeleteRoom(roomId, req.user);

    return res.status(200).json({
        message: 'Room deleted successfully.'
    })
});

// GET /rooms/search?q=&city=&minPrice=&maxPrice=&maxGuests=
export const searchRooms = catchAsync(async (req: Request, res: Response) => {
    const { q = '', city, minPrice, maxPrice, maxGuests } = req.query;

    const isAdmin = req.user?.role === 'ADMIN';

    const result = await meiliService.searchRooms(q as string, {
        ...(city && { city: city as string }),
        ...(minPrice && { minPrice: Number(minPrice) }),
        ...(maxPrice && { maxPrice: Number(maxPrice) }),
        ...(maxGuests && { maxGuests: Number(maxGuests) }),
        ...(!isAdmin && { status: 'APPROVED' }),
    });

    return res.status(200).json({ data: result.hits });
});
