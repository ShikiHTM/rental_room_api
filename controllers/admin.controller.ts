import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import db from "../Database/Utils/db.js"

export const approveRoom = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { roomId } = req.params as { roomId: string };

        const room = await db.room.findUnique({
            where: {id: roomId},
            include: {host: true}
        });

        if(!room) return res.status(404).json({
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

        // If host is User, update role from USER -> HOST

        if(room.host.role === 'USER') {
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
    } catch (error) { res.status(500).json({ message: 'Error' }); }
}