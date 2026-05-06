import { z } from "zod";

export const UpdateUserSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    phoneNumber: z.string().max(20).optional(),
    email: z.string().email().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
