import { z } from "zod";

export const CreateBookingSchema = z.object({
    roomId: z.uuid(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
}).refine(data => data.checkOut > data.checkIn, {
    message: 'checkOut must be after checkIn',
    path: ['checkOut'],
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
