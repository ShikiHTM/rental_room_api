import { type Request, type Response } from "express";
import db from '../Database/Utils/db.js'
import { type AuthRequest } from '../middlewares/auth.middleware.js'
import { roomService } from "../services/room.service.js";

export const applyToBeHost = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        if (req.user.role !== 'USER') return res.status(400).json({ message: 'You are already a Host' });

        const newRoom = await roomService.handleRoomCreation(req.user.id, req.body);

        res.status(201).json({ message: 'Application sent. Once approved, you will become a Host.', data: newRoom });
    } catch (error) { res.status(500).json({ message: 'ApplyToBeHost Error', error: error }); }
};

// POST /create
export const createRoom = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const pendingRoom = await db.room.findFirst({
            where: { hostId: req.user.id, status: 'PENDING' }
        })

        if (pendingRoom) return res.status(400).json({
            message: 'You already have a pending application.'
        })

        const newRoom = await roomService.handleRoomCreation(req.user.id, req.body);

        res.status(201).json({ message: 'Room created. It will be visible after Admin approval.', data: newRoom });
    } catch (error) { res.status(500).json({ message: 'createRoom Error', error: error }); }
};

// GET /room (public)
export const getAllRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await db.room.findMany({
            where: { status: 'APPROVED' },
            include: { host: { select: { fullName: true } } }
        })

        return res.status(200).json({ data: rooms })
    } catch (error) {
        return res.status(500).json({ message: 'getAllRooms Error', error: error })
    }
}

// GET /room/:id (public)
export const getRoomById = async (req: Request, res: Response): Promise<any> => {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'getRoomById Error',
            error: error
        })
    }
}

// PUT /room/[:id] (Owner/Admin only)
export const updateRoom = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const roomId = req.params.id as string;

        if (!roomId) {
            return res.status(404).json({
                message: 'Room id is either invalid or not found'
            })
        }

        const updatedRoom = await roomService.handleRoomUpdate(roomId, req.user, req.body)

        return res.status(200).json({
            message: 'Room updated successfully',
            data: updatedRoom
        })
    } catch (error) {
        return res.status(500).json({ message: 'updateRoom Error', error: error });
    }
}

// DELETE /room/[:id] (Admin and Room Owner)
export const deleteRoom = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const roomId = req.params.id as string;

        if (!roomId) {
            return res.status(404).json({
                message: 'Room id is either invalid or not found'
            })
        };

        await roomService.handleDeleteRoom(roomId, req.user);

        return res.status(200).json({
            message: 'Room deleted successfully.'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'deleteRoom',
            error: error
        })
    }
}
