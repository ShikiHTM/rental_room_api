import db from "../Database/Utils/db.js";
import { cloudinaryService } from "./cloudinary.service.js";
import { CreateRoomSchema, UpdateRoomSchema, type RoomInput, type UpdateRoomInput } from "../Utils/schemas/room.schema.js";
import { type UploadResponse } from "./cloudinary.service.js";
import type { IUserPayload } from "../types/types.js";
import { removeUndefined } from "../Utils/cleanData.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../Utils/AppError.js";

export class RoomService {
    public async handleRoomCreation(userId: string, body: unknown) {
        const result = CreateRoomSchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError(result.error.issues);
        }

        const { images, ...roomData }: RoomInput = result.data;
        let cloudinaryResults: UploadResponse[] = [];

        if (images && images.length > 0) {
            cloudinaryResults = await Promise.all(
                images.map((img: string) => cloudinaryService.upload(img))
            );
        }

        try {
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
        } catch (error) {
            await Promise.allSettled(cloudinaryResults.map(img => cloudinaryService.destroy(img.public_id)));
            throw error;
        }
    }

    public async handleRoomUpdate(roomId: string, user: IUserPayload, body: unknown) {
        const result = UpdateRoomSchema.safeParse(body)

        if (!result.success) {
            throw new ValidationError(result.error.issues);
        }

        const room = await db.room.findUnique({
            where: { id: roomId },
            include: {
                images: true
            }
        });
        if (!room) throw new NotFoundError('Room not found');

        const isOwner = room.hostId === user.id;
        const isAdmin = user.role === 'ADMIN'

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not own this room');
        }

        const { images, ...otherData }: UpdateRoomInput = result.data;

        const updateData: any = {
            ...otherData,
        }

        let newCloudinaryResults: UploadResponse[] = [];

        if (images && images.length > 0) {
            newCloudinaryResults = await Promise.all(
                images.map((img: string) => cloudinaryService.upload(img))
            );

            updateData.images = {
                deleteMany: {},
                create: newCloudinaryResults.map(img => ({
                    imageUrl: img.image_url,
                    publicId: img.public_id
                }))
            };
        }

        const cleanData = removeUndefined(updateData);

        try {
            const updated = await db.room.update({
                where: { id: roomId },
                data: cleanData,
                include: { images: true }
            });

            if (newCloudinaryResults.length > 0 && room.images.length > 0) {
                await Promise.allSettled(room.images.map(img => cloudinaryService.destroy(img.publicId)));
            }

            return updated;
        } catch (error) {
            await Promise.allSettled(newCloudinaryResults.map(img => cloudinaryService.destroy(img.public_id)));
            throw error;
        }
    }

    public async handleDeleteRoom(roomId: string, user: IUserPayload) {
        const room = await db.room.findUnique({
            where: { id: roomId },
            include: { images: true }
        })

        if (!room) throw new NotFoundError('Room not found');

        const isOwner = room.hostId === user.id;
        const isAdmin = user.role === 'ADMIN'

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not own this room');
        }

        const images = room.images;

        await Promise.allSettled(
            (images || []).map((img) => cloudinaryService.destroy(img.publicId))
        )

        return await db.room.delete({ where: { id: roomId } });
    }
}

export const roomService = new RoomService();
