import { z } from "zod";

export const CreateReviewSchema = z.object({
    rating: z.int().check(z.gte(1)).check(z.lte(5)),
    comment: z.string().nullable(),
    roomId: z.uuid(),
    bookingId: z.uuid(),
    images: z.array(z.string()).optional()
})

export const UpdateReviewSchema = CreateReviewSchema.partial();

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;