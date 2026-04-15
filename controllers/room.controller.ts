import { z } from "zod";
import { type Request, type Response } from "express";
import db from '../Database/Utils/db.js'
import { type AuthRequest } from '../middlewares/auth.middleware.js'
import { removeUndefined } from "../Utils/cleanData.js";
import { uploadImage } from "../Utils/cloudinary.js";

const RoomBaseSchema = z.object({
  title: z.string().min(5, "Title too short").max(100),
  description: z.string().optional(),
  
  pricePerNight: z.coerce.number().positive("Price must be positive"),
  maxGuests: z.coerce.number().int().min(1, "At least 1 guest"),
  
  city: z.string(),
  address: z.string(),
  
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

const CreateRoomSchema = RoomBaseSchema;

const UpdateRoomSchema = RoomBaseSchema.partial();

export const applyToBeHost = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = (req.user as any).userId;
    if ((req.user as any).role !== 'USER') return res.status(400).json({ message: 'You are already a Host' });

    const result = CreateRoomSchema.safeParse(req.body);

    if(!result.success) {
        return res.status(400).json({ 
            message: "Validation failed", 
            errors: result.error.format() 
        });
    }

    const { images, ...otherData} = result.data;
    let imageUrls: string[] = [];

    if(images && images.length > 0) {
        imageUrls = await Promise.all(
            images.map((imgBase64: string) => uploadImage(imgBase64))
        )
    }

    const rawData = {
        ...otherData,
        images: imageUrls,
        hostId: userId as string,
        status: 'PENDING' as const
    }

    const cleanData = removeUndefined(rawData);

    const newRoom = await db.room.create({
        data: cleanData as any
    })

    res.status(201).json({ message: 'Application sent. Once approved, you will become a Host.', room: newRoom });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// POST /create
export const createRoom = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = (req.user as any).userId;

    const pendingRoom = await db.room.findFirst({
        where: {hostId: userId, status: 'PENDING'}
    })   

    if(pendingRoom) return res.status(400).json({
        message: 'You already have a pending application.'
    })

    const result = CreateRoomSchema.safeParse(req.body);

    if(!result.success) {
        return res.status(400).json({ 
            message: "Validation failed", 
            errors: result.error.format() 
        });
    }

    const rawData = {
        ...result.data,
        hostId: userId as string,
        status: 'PENDING' as const
    }

    const cleanData = removeUndefined(rawData);

    const newRoom = await db.room.create({
        data: cleanData as any
    })

    res.status(201).json({ message: 'Room created. It will be visible after Admin approval.', room: newRoom });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// GET /room (public)
export const getAllRooms = async(req: Request, res: Response) => {
    const rooms = await db.room.findMany({
        where: {status: 'APPROVED'},
        include: {host: {select: {fullName: true}}}
    })

    res.status(200).json({data:rooms})
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

        if(!room) {
            return res.status(404).json({ message: 'Room not found.' })
        }

        res.status(200).json({ data: room });
    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error.'
        })
    }
}

// PUT /room/[:id] (Owner/Admin only)
export const updateRoom = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params as {id: string};
        const userId = (req.user as any).userId;
        const userRole = (req.user as any).role;
        const result = UpdateRoomSchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: result.error.format() 
            });
        }

        // Check ownership
        const room = await db.room.findUnique({ where: {id} });
        if(!room) return res.status(404).json({ message: 'room not found'})

        const isOwner = room.hostId === userId;
        const isAdmin = userRole === 'ADMIN'

        if( !isOwner && !isAdmin ) {
            return res.status(403).json({
                message: 'Forbidden: You do not own this room'
            })
        }

        const {images, ...otherData} = result.data;
        let finalImages = room.images;

        if(images && images.length > 0) {
            const newImageUrls = await Promise.all(
                images.map((img: string) => uploadImage(img))
            )

            finalImages = newImageUrls;
        }

        const rawData = {
            ...otherData,
            images: finalImages,
            status: userRole === 'ADMIN' ? room.status : 'PENDING',
        }

        const cleanData = removeUndefined(rawData);

        const updatedRoom = await db.room.update({
            where: {id},
            data: cleanData as any
        })

        res.status(200).json({
            message: 'Room updated successfully',
            room: updatedRoom
        })
    }catch(error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

// DELETE /room/[:id] (Admin and Room Owner)
export const deleteRoom = async ( req: AuthRequest, res: Response ): Promise<any> => {
    try {
        const { id } = req.params as {id: string}
        const userId = (req.user as any).userId;
        const userRole = (req.user as any).role;

        const room = await db.room.findUnique({
            where: { id }
        })

        if(!room) return res.status(404).json({ message: 'Room not found.' });
        
        // Check ownership

        const isOwner = room.hostId === userId;
        const isAdmin = userRole === 'ADMIN'

        if( !isOwner && !isAdmin ) {
            return res.status(403).json({
                message: 'Forbidden: You do not own this room'
            })
        }

        await db.room.delete({ where: { id } });
        res.status(200).json({
            message: 'Room deleted successfully.'
        })
    } catch(error) {
        res.status(500).json({
            message: 'Internal server error'
        })
    }
}