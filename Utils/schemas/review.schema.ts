import { z } from "zod";

export const CreateReviewSchema = z.object({
    rating: z.int().check(z.gte(1)).check(z.lte(5)),
    comment: z.string().nullable(),
    userId: z.uuid(),
    roomId: z.uuid(),
    bookingId: z.uuid(),
    images: z.array(z.string()).optional()
})

export const UpdateReviewSchema = CreateReviewSchema.partial();

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;