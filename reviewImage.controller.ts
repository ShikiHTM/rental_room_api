import type { Request, Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

// GET /reviews/:reviewId/images
export const getReviewImages = catchAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params as { reviewId: string };

    const images = await db.reviewImage.findMany({
        where: { reviewId },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ data: images });
});

// POST /reviews/:reviewId/images
export const addReviewImages = catchAsync(async (req: AuthRequest, res: Response) => {
    const { reviewId } = req.params as { reviewId: string };
    const { images } = req.body as { images?: string[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
        throw { status: 400, message: "Images are required" };
    }

    const review = await db.review.findUnique({ where: { id: reviewId } });
    if (!review) {
        throw { status: 404, message: "Review not found" };
    }

    if (req.user.role !== "ADMIN" && review.userId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You can only add images to your own review" };
    }

    const uploadedImages = await Promise.all(
        images.map((image) => cloudinaryService.upload(image))
    );

    const createdImages = await db.$transaction(
        uploadedImages.map((image) => db.reviewImage.create({
            data: {
                reviewId,
                imageUrl: image.image_url,
                publicId: image.public_id
            }
        }))
    );

    return res.status(201).json({
        message: "Review images uploaded successfully",
        data: createdImages
    });
});

// DELETE /review-images/:id
export const deleteReviewImage = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    const image = await db.reviewImage.findUnique({
        where: { id },
        include: { review: true }
    });

    if (!image) {
        throw { status: 404, message: "Review image not found" };
    }

    if (req.user.role !== "ADMIN" && image.review.userId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You can only delete images from your own review" };
    }

    await cloudinaryService.destroy(image.publicId);
    await db.reviewImage.delete({ where: { id } });

    return res.status(200).json({ message: "Review image deleted successfully" });
});
