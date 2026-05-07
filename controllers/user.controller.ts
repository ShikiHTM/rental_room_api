import db from "../Database/Utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { Response } from "express";
import { UpdateUserSchema } from "../Utils/schemas/user.schema.js";
import { removeUndefined } from "../Utils/cleanData.js";
import { ValidationError } from "../Utils/AppError.js";

// GET /user
export const me = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await db.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true, email: true, fullName: true, phoneNumber: true, role: true,
            verifiedAt: true, bannedAt: true, banReason: true, banExpiresAt: true, createdAt: true
        }
    });
    if (!user) return res.status(401).json({ message: 'User not found.' });
    return res.status(200).json({ data: user });
})

export const update = catchAsync(async (req: AuthRequest, res: Response) => {   
    const result = UpdateUserSchema.safeParse(req.body);
    if(!result.success) throw new ValidationError(result.error.issues);

    const updatedUser = await db.user.update({
        where: { id: req.user.id },
        data: removeUndefined(result.data),
        select: { id: true, email: true, fullName: true, phoneNumber: true, role: true }
    })

    return res.status(200).json({ data: updatedUser });
})

export const getReviews = catchAsync(async (req: AuthRequest, res: Response) => {
    const reviews = await db.review.findMany({
        where: { userId: req.user.id },
        include: {
            images: true,
            room: true
        }
    })
    return res.status(200).json({ data: reviews });
})