import type { Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const passwordResetTokenSelect = {
    id: true,
    userId: true,
    createdAt: true,
    expiredAt: true,
};

const ensureAdmin = (req: AuthRequest) => {
    if (req.user.role !== "ADMIN") {
        throw { status: 403, message: "Forbidden: Admin access required" };
    }
};

// GET /password-reset-tokens
export const getAllPasswordResetTokens = catchAsync(async (req: AuthRequest, res: Response) => {
    ensureAdmin(req);

    const tokens = await db.passwordResetTokens.findMany({
        select: passwordResetTokenSelect,
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ data: tokens });
});

// GET /password-reset-tokens/:id
export const getPasswordResetTokenById = catchAsync(async (req: AuthRequest, res: Response) => {
    ensureAdmin(req);

    const { id } = req.params as { id: string };

    const token = await db.passwordResetTokens.findUnique({
        where: { id },
        select: passwordResetTokenSelect
    });

    if (!token) {
        throw { status: 404, message: "Password reset token not found" };
    }

    return res.status(200).json({ data: token });
});

// DELETE /password-reset-tokens/expired
export const deleteExpiredPasswordResetTokens = catchAsync(async (req: AuthRequest, res: Response) => {
    ensureAdmin(req);

    const result = await db.passwordResetTokens.deleteMany({
        where: {
            expiredAt: {
                lt: new Date()
            }
        }
    });

    return res.status(200).json({
        message: "Expired password reset tokens deleted successfully",
        data: result
    });
});

// DELETE /password-reset-tokens/:id
export const deletePasswordResetToken = catchAsync(async (req: AuthRequest, res: Response) => {
    ensureAdmin(req);

    const { id } = req.params as { id: string };

    await db.passwordResetTokens.delete({ where: { id } });

    return res.status(200).json({ message: "Password reset token deleted successfully" });
});
