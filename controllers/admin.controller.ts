import type { Request, Response } from "express";
import db from "../Database/Utils/db.js"
import { catchAsync } from "../Utils/catchAsync.utils.js";

export const approveRoom = catchAsync(async (req: Request, res: Response): Promise<any> => {
    const { roomId } = req.params as { roomId: string };

    const room = await db.room.findUnique({
        where: { id: roomId },
        include: { host: true }
    });

    if (!room) return res.status(404).json({
        message: 'Room not found'
    });

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
    res.status(200).json({ message: 'Room approved and Host status verified.' });
})
