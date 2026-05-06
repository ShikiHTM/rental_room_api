import type { Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { removeUndefined } from "../Utils/cleanData.js";

const userSelect = {
    id: true,
    email: true,
    verifiedAt: true,
    fullName: true,
    phoneNumber: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};
const userRoles = ["USER", "HOST", "ADMIN"];

// GET /users
export const getAllUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user.role !== "ADMIN") {
        throw { status: 403, message: "Forbidden: Admin access required" };
    }

    const users = await db.user.findMany({
        select: userSelect,
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ data: users });
});

// GET /users/:id
export const getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    if (req.user.role !== "ADMIN" && req.user.id !== id) {
        throw { status: 403, message: "Forbidden: You can only view your own account" };
    }

    const user = await db.user.findUnique({
        where: { id },
        select: {
            ...userSelect,
            rooms: true,
            bookings: true,
            reviews: true,
            payments: true,
        }
    });

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    return res.status(200).json({ data: user });
});

// PUT /users/:id
export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { fullName, phoneNumber, role, verifiedAt } = req.body;

    if (req.user.role !== "ADMIN" && req.user.id !== id) {
        throw { status: 403, message: "Forbidden: You can only update your own account" };
    }

    const data: any = {
        fullName,
        phoneNumber,
    };

    if (req.user.role === "ADMIN") {
        if (role !== undefined && !userRoles.includes(role)) {
            throw { status: 400, message: "Invalid user role" };
        }

        data.role = role;
        data.verifiedAt = verifiedAt;
    }

    const updatedUser = await db.user.update({
        where: { id },
        data: removeUndefined(data),
        select: userSelect
    });

    return res.status(200).json({
        message: "User updated successfully",
        data: updatedUser
    });
});

// DELETE /users/:id
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    if (req.user.role !== "ADMIN" && req.user.id !== id) {
        throw { status: 403, message: "Forbidden: You can only delete your own account" };
    }

    await db.user.delete({ where: { id } });

    return res.status(200).json({ message: "User deleted successfully" });
});
