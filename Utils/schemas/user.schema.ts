import { z } from "zod";

export const CreateUserSchema = z.object({
    fullName: z.string().min(2).max(100),
    phoneNumber: z.string().max(20).optional(),
    email: z.email(),
    password: z.string()
})

export const UpdateUserSchema = CreateUserSchema.omit({ password: true }).partial();
export const LoginUserSchema = CreateUserSchema.pick({ email: true, password: true })

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
