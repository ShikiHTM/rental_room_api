import db from "../Database/Utils/db.js";
import type { UserPayload } from "../types/types.js";
import { removeUndefined } from "../Utils/cleanData.js";
import { CreateReviewSchema, UpdateReviewSchema, type UpdateReviewInput } from "../Utils/schemas/review.schema.js";
import { cloudinaryService, type UploadResponse } from "./cloudinary.service.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../Utils/AppError.js";

export class ReviewService {
    public async handleCreateReview(userId: string, body: unknown) {
        const result = CreateReviewSchema.safeParse(body);
        if(!result.success) throw new ValidationError(result.error.issues)

        const { images, ...otherDatas } = result.data;
        let cloudinaryResult: UploadResponse[] = [];

        if(images && images.length > 0) {
            cloudinaryResult = await Promise.all(
                images.map((img: string) => cloudinaryService.upload(img))
            )
        }

        try {
            return await db.review.create({
                data: {
                    ...otherDatas,
                    comment: otherDatas.comment ?? null,
                    userId,
                    images: {
                        create: cloudinaryResult.map((img) => ({
                            publicId: img.public_id,
                            imageUrl: img.image_url
                        }))
                    }
                },
                include: {
                    images: true
                }
            })
        } catch(error) {
            await Promise.allSettled(cloudinaryResult.map((img) => cloudinaryService.destroy(img.public_id)));
            throw error;
        }
    }

    public async handleUpdateReview(reviewId: string, user: UserPayload, body: unknown) {
        const result = UpdateReviewSchema.safeParse(body);
        if(!result.success) throw new ValidationError(result.error.issues)

        const review = await db.review.findUnique({
            where: { id: reviewId },
            include: {
                images: true,
            }
        })

        if(!review) throw new NotFoundError('Review not found.');

        if(review.userId !== user.id) throw new ForbiddenError('You are not allowed to do this action.');

        const { images, ...otherData }: UpdateReviewInput = result.data;

        const data: any = {
            ...otherData
        }

        let cloudinaryResult: UploadResponse[] = [];

        if(images && images.length > 0) {
            cloudinaryResult = await Promise.all(
                images.map((img) => cloudinaryService.upload(img))
            )
            
            data.images = {
                deleteMany: {},
                create: cloudinaryResult.map((img) => ({
                    publicId: img.public_id,
                    imageUrl: img.image_url
                }))
            }
        }

        const updateData = removeUndefined(data);

        try {
            return await db.review.update({
                where: { id: reviewId },
                data: updateData,
                include: {
                    images: true
                }
            })
        }catch(error) {
            await Promise.allSettled(cloudinaryResult.map((img) => cloudinaryService.destroy(img.public_id)));
            throw error;
        };
    }

    public async handleDeleteReview(reviewId: string, user: UserPayload) {
        const review = await db.review.findUnique({ where: {id: reviewId }});

        if(!review) throw new NotFoundError('Review not found.');
        if(review.userId !== user.id) throw new ForbiddenError('You are not allowed to do this action.');

        const images = await db.review.findUnique({where: {id: reviewId}}).images();

        await Promise.allSettled(
            (images ?? []).map(img => cloudinaryService.destroy(img.publicId))
        )

        await db.review.delete({ where: {id: reviewId }});
    }
}