import db from "../Database/Utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { Response } from "express";
import { UpdateUserSchema } from "../Utils/schemas/user.schema.js";
import { removeUndefined } from "../Utils/cleanData.js";
import { ValidationError } from "../Utils/AppError.js";

// GET /user
export const me = catchAsync(async (req: AuthRequest, res: Response) => {
    return res.status(200).json({ data: req.user });
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