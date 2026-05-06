import type { Request, Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";
import { removeUndefined } from "../Utils/cleanData.js";

// GET /reviews
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const reviews = await db.review.findMany({
        include: {
            user: { select: { id: true, fullName: true } },
            room: { select: { id: true, title: true } },
            images: true
        }
    });

    return res.status(200).json({ data: reviews });
});

// GET /rooms/:roomId/reviews
export const getReviewsByRoom = catchAsync(async (req: Request, res: Response) => {
    const { roomId } = req.params as { roomId: string };

    const reviews = await db.review.findMany({
        where: { roomId },
        include: {
            user: { select: { id: true, fullName: true } },
            images: true
        }
    });

    return res.status(200).json({ data: reviews });
});

// GET /reviews/:id
export const getReviewById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const review = await db.review.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, fullName: true } },
            room: { select: { id: true, title: true } },
            images: true
        }
    });

    if (!review) {
        throw { status: 404, message: "Review not found" };
    }

    return res.status(200).json({ data: review });
});

// POST /reviews
export const createReview = catchAsync(async (req: AuthRequest, res: Response) => {
    const { roomId, rating, comment, images } = req.body as {
        roomId?: string;
        rating?: number | string;
        comment?: string;
        images?: string[];
    };

    if (!roomId || !rating) {
        throw { status: 400, message: "Missing required fields" };
    }

    const ratingValue = Number(rating);

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        throw { status: 400, message: "Rating must be from 1 to 5" };
    }

    if (images !== undefined && !Array.isArray(images)) {
        throw { status: 400, message: "Images must be an array" };
    }

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) {
        throw { status: 404, message: "Room not found" };
    }

    const uploadedImages = images && images.length > 0
        ? await Promise.all(images.map((image) => cloudinaryService.upload(image)))
        : [];

    const review = await db.review.create({
        data: {
            roomId,
            rating: ratingValue,
            comment,
            userId: req.user.id,
            images: {
                create: uploadedImages.map((image) => ({
                    imageUrl: image.image_url,
                    publicId: image.public_id
                }))
            }
        },
        include: { images: true }
    });

    return res.status(201).json({
        message: "Review created successfully",
        data: review
    });
});

// PUT /reviews/:id
export const updateReview = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { rating, comment } = req.body;
    const ratingValue = rating !== undefined ? Number(rating) : undefined;

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
        throw { status: 404, message: "Review not found" };
    }

    if (req.user.role !== "ADMIN" && review.userId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You can only update your own review" };
    }

    if (ratingValue !== undefined && (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)) {
        throw { status: 400, message: "Rating must be from 1 to 5" };
    }

    const updatedReview = await db.review.update({
        where: { id },
        data: removeUndefined({
            rating: ratingValue,
            comment
        }),
        include: { images: true }
    });

    return res.status(200).json({
        message: "Review updated successfully",
        data: updatedReview
    });
});

// DELETE /reviews/:id
export const deleteReview = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    const review = await db.review.findUnique({
        where: { id },
        include: { images: true }
    });

    if (!review) {
        throw { status: 404, message: "Review not found" };
    }

    if (req.user.role !== "ADMIN" && review.userId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You can only delete your own review" };
    }

    await Promise.all(
        review.images.map((image) => cloudinaryService.destroy(image.publicId))
    );

    await db.reviewImage.deleteMany({ where: { reviewId: id } });
    await db.review.delete({ where: { id } });

    return res.status(200).json({ message: "Review deleted successfully" });
});
