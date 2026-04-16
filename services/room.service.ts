import db from "../Database/Utils/db.js";
import { cloudinaryService } from "./cloudinary.service.js";
import { CreateRoomSchema, UpdateRoomSchema, type RoomInput, type UpdateRoomInput } from "../Utils/schemas/room.schema.js";
import { type UploadResponse } from "./cloudinary.service.js";
import type { UserPayload } from "../middlewares/auth.middleware.js";
import { removeUndefined } from "../Utils/cleanData.js";

export class RoomService {
    public async handleRoomCreation(userId: string, body: any) {
        const result = CreateRoomSchema.safeParse(body);
        if (!result.success) {
            throw { status: 400, message: "Validation failed", errors: result.error.format() };
        }

        const { images, ...roomData }: RoomInput = result.data;
        let cloudinaryResults: UploadResponse[] = [];

        if (images && images.length > 0) {
            cloudinaryResults = await Promise.all(
                images.map((img: string) => cloudinaryService.upload(img))
            );
        }

        return await db.room.create({
            data: {
                ...roomData,
                description: roomData.description ?? null,
                hostId: userId,
                status: 'PENDING',
                images: {
                    create: cloudinaryResults.map(img => ({
                        imageUrl: img.image_url,
                        publicId: img.public_id
                    }))
                }
            },
            include: { images: true }
        });
    }

    public async handleRoomUpdate(roomId: string, user: UserPayload, body: any) {
        const result = UpdateRoomSchema.safeParse(body)

        if (!result.success) {
            throw ({
                message: "Validation failed",
                errors: result.error
            });
        }

        const room = await db.room.findUnique({
            where: { id: roomId },
            include: {
                images: true
            }
        });
        if (!room) throw ({ message: 'room not found' })

        const isOwner = room.hostId === user.id;
        const isAdmin = user.role === 'ADMIN'

        if (!isOwner && !isAdmin) {
            throw ({
                message: 'Forbidden: You do not own this room'
            })
        }

        const { images, ...otherData }: UpdateRoomInput = result.data;

        const updateData: any = {
            ...otherData,
        }

        if (images && images.length > 0) {
            if (room.images.length > 0) {
                await Promise.all(
                    room.images.map((img) => cloudinaryService.destroy(img.publicId))
                )
            }

            const cloudinaryResults = await Promise.all(
                images.map((img: string) => cloudinaryService.upload(img))
            )

            updateData.images = {
                deleteMany: {},
                create: cloudinaryResults.map(img => ({
                    imageUrl: img.image_url,
                    publicId: img.public_id
                }))
            };
        }

        const cleanData = removeUndefined(updateData)

        return await db.room.update({
            where: { id: roomId },
            data: cleanData,
            include: { images: true }
        })
    }

    public async handleDeleteRoom(roomId: string, user: UserPayload) {
        const room = await db.room.findUnique({
            where: { id: roomId }
        })

        if (!room) throw ({ message: 'Room not found.' });

        // Check ownership

        const isOwner = room.hostId === user.id;
        const isAdmin = user.role === 'ADMIN'

        if (!isOwner && !isAdmin) {
            throw ({
                message: 'Forbidden: You do not own this room'
            })
        }

        return await db.room.delete({ where: { id: roomId } });
    }
}

export const roomService = new RoomService();
