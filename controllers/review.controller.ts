import db from "../Database/Utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { Request, Response } from "express";
import { reviewService } from "../services/review.service.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../Utils/AppError.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import { CreateReviewSchema } from "../Utils/schemas/review.schema.js";

export const store = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = CreateReviewSchema.safeParse(req.body);
    if(!result.success) throw new ValidationError(result.error.issues);

    const booking = await db.booking.findUnique({ where: {id: result.data.bookingId }});
    if(booking?.status !== 'COMPLETED') throw new ForbiddenError("You can only review after finish your booking")

    const review = await reviewService.handleCreateReview(req.user.id, req.body);

    return res.status(200).json({
        message: 'Review created successfully',
        data: review
    });
})

export const index = catchAsync(async (req: Request, res: Response) => {
    const { roomId } = req.params as { roomId: string };   

    const reviews = await db.review.findMany({
        where: {roomId},
        include: {
            images: true,
            user: {
                select: {
                    fullName: true,
                    email: true
                }
            }
        }
    })

    return res.status(200).json({
        data: reviews
    });
})

export const update = catchAsync(async ( req: AuthRequest, res: Response) => {
    const { reviewId } = req.params as { reviewId: string };

    const review = await reviewService.handleUpdateReview(reviewId, req.user, req.body);

    return res.status(200).json({
        message: 'Review updated successfully',
        data: review
    })
})

export const destroy = catchAsync(async ( req: AuthRequest, res: Response) => {
    const { reviewId } = req.params as { reviewId: string };

    await reviewService.handleDeleteReview(reviewId, req.user);

    return res.status(200).json({
        message: 'Review deleted successfully'
    })
})