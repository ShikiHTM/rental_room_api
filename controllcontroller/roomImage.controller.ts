import type { Request, Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

// GET /rooms/:roomId/images
export const getRoomImages = catchAsync(async (req: Request, res: Response) => {
    const { roomId } = req.params as { roomId: string };

    const images = await db.roomImage.findMany({
        where: { roomId },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ data: images });
});

// POST /rooms/:roomId/images
export const addRoomImages = catchAsync(async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params as { roomId: string };
    const { images } = req.body as { images?: string[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
        throw { status: 400, message: "Images are required" };
    }

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) {
        throw { status: 404, message: "Room not found" };
    }

    if (req.user.role !== "ADMIN" && room.hostId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You do not own this room" };
    }

    const uploadedImages = await Promise.all(
        images.map((image) => cloudinaryService.upload(image))
    );

    const createdImages = await db.$transaction(
        uploadedImages.map((image) => db.roomImage.create({
            data: {
                roomId,
                imageUrl: image.image_url,
                publicId: image.public_id
            }
        }))
    );

    return res.status(201).json({
        message: "Room images uploaded successfully",
        data: createdImages
    });
});

// DELETE /room-images/:id
export const deleteRoomImage = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    const image = await db.roomImage.findUnique({
        where: { id },
        include: { room: true }
    });

    if (!image) {
        throw { status: 404, message: "Room image not found" };
    }

    if (req.user.role !== "ADMIN" && image.room.hostId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You do not own this room" };
    }

    await cloudinaryService.destroy(image.publicId);
    await db.roomImage.delete({ where: { id } });

    return res.status(200).json({ message: "Room image deleted successfully" });
});
