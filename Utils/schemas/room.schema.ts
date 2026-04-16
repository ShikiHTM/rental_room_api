import { z } from "zod";

// 1. Định nghĩa Schema gốc (Base)
export const RoomSchema = z.object({
    title: z.string().min(5, "Title too short").max(100),
    description: z.string().optional().nullable(),
    pricePerNight: z.coerce.number().positive("Price must be positive"),
    maxGuests: z.coerce.number().int().min(1, "At least 1 guest"),
    city: z.string(),
    address: z.string(),
    images: z.array(z.string()).optional(),
});

export const CreateRoomSchema = RoomSchema;

export const UpdateRoomSchema = RoomSchema.partial();

export type RoomInput = z.infer<typeof RoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
