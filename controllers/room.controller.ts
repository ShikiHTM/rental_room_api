import { type Request, type Response } from "express";
import db from '../Database/Utils/db.js'
import { type AuthRequest } from '../middlewares/auth.middleware.js'
import { roomService } from "../services/room.service.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";

export const applyToBeHost = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user.role !== 'USER') return res.status(400).json({ message: 'You are already a Host' });

    const newRoom = await roomService.handleRoomCreation(req.user.id, req.body);

    res.status(201).json({ message: 'Application sent. Once approved, you will become a Host.', data: newRoom });
})

// POST /create
export const createRoom = catchAsync(async (req: AuthRequest, res: Response) => {
    const pendingRoom = await db.room.findFirst({
        where: { hostId: req.user.id, status: 'PENDING' }
    })

    if (pendingRoom) return res.status(400).json({
        message: 'You already have a pending application.'
    })

    const newRoom = await roomService.handleRoomCreation(req.user.id, req.body);

    res.status(201).json({ message: 'Room created. It will be visible after Admin approval.', data: newRoom });
});

// GET /room (public)
export const getAllRooms = catchAsync(async (req: Request, res: Response) => {
    const rooms = await db.room.findMany({
        where: { status: 'APPROVED' },
        include: { host: { select: { fullName: true } } }
    })

    return res.status(200).json({ data: rooms })
});

// GET /room/:id (public)
export const getRoomById = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params as { id: string };
    const room = await db.room.findUnique({
        where: { id },
        include: {
            host: {
                select: {
                    fullName: true,
                    email: true
                }
            }
        }
    })

    if (!room) {
        return res.status(404).json({ message: 'Room not found.' })
    }

    res.status(200).json({ data: room });
});

// PUT /room/[:id] (Owner/Admin only)
export const updateRoom = catchAsync(async (req: AuthRequest, res: Response): Promise<any> => {
    const roomId = req.params.id as string;

    const updatedRoom = await roomService.handleRoomUpdate(roomId, req.user, req.body)

    return res.status(200).json({
        message: 'Room updated successfully',
        data: updatedRoom
    })
})

// DELETE /room/[:id] (Admin and Room Owner)
export const deleteRoom = catchAsync(async (req: AuthRequest, res: Response): Promise<any> => {
    const roomId = req.params.id as string;

    await roomService.handleDeleteRoom(roomId, req.user);

    return res.status(200).json({
        message: 'Room deleted successfully.'
    })
});
