import db from "../Database/Utils/db.js";
import type { IUserPayload } from "../types/types.js";
import { removeUndefined } from "../Utils/cleanData.js";
import { CreateReviewSchema, UpdateReviewSchema, type UpdateReviewInput } from "../Utils/schemas/review.schema.js";
import { cloudinaryService, type UploadResponse } from "./cloudinary.service.js";
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "../Utils/AppError.js";

export class ReviewService {
    public async handleCreateReview(userId: string, body: unknown) {
        const result = CreateReviewSchema.safeParse(body);
        if(!result.success) throw new ValidationError(result.error.issues)

        const { bookingId, roomId, images, ...otherDatas } = result.data;

        const booking = await db.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new NotFoundError('Booking not found.');
        if (booking.userId !== userId) throw new ForbiddenError('This booking does not belong to you.');
        if (booking.status !== 'COMPLETED') throw new BadRequestError('You can only review completed bookings.');
        if (booking.roomId !== roomId) throw new BadRequestError('Room does not match booking.');

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
                    roomId,
                    bookingId,
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

    public async handleUpdateReview(reviewId: string, user: IUserPayload, body: unknown) {
        const result = UpdateReviewSchema.safeParse(body);
        if(!result.success) throw new ValidationError(result.error.issues)

        const review = await db.review.findUnique({
            where: { id: reviewId },
            include: {
                images: true,
            }
        })

        if(!review) throw new NotFoundError('Review not found.');
        const isAdmin = user.role === 'ADMIN';

        if(review.userId !== user.id && !isAdmin) throw new ForbiddenError('You are not allowed to do this action.');

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

    public async handleDeleteReview(reviewId: string, user: IUserPayload) {
        const review = await db.review.findUnique({ where: {id: reviewId }});

        if(!review) throw new NotFoundError('Review not found.');
        const isAdmin = user.role === 'ADMIN';

        if(review.userId !== user.id && !isAdmin) throw new ForbiddenError('You are not allowed to do this action.');


        const images = await db.review.findUnique({where: {id: reviewId}}).images();

        await Promise.allSettled(
            (images ?? []).map(img => cloudinaryService.destroy(img.publicId))
        )

        await db.review.delete({ where: {id: reviewId }});
    }
}

export const reviewService = new ReviewService();