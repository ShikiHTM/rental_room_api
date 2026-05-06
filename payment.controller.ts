import type { Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const paymentMethods = ["CASH", "BANK_TRANSFER", "ONLINE"];
const paymentStatuses = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"];

// GET /payments
export const getAllPayments = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user.role !== "ADMIN") {
        throw { status: 403, message: "Forbidden: Admin access required" };
    }

    const payments = await db.payment.findMany({
        include: {
            user: { select: { id: true, email: true, fullName: true } },
            booking: true
        },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ data: payments });
});

// GET /payments/my_payments
export const getMyPayments = catchAsync(async (req: AuthRequest, res: Response) => {
    const payments = await db.payment.findMany({
        where: { userId: req.user.id },
        include: { booking: true },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ data: payments });
});

// GET /payments/:id
export const getPaymentById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    const payment = await db.payment.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, email: true, fullName: true } },
            booking: true
        }
    });

    if (!payment) {
        throw { status: 404, message: "Payment not found" };
    }

    if (req.user.role !== "ADMIN" && payment.userId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You can only view your own payment" };
    }

    return res.status(200).json({ data: payment });
});

// POST /payments
export const createPayment = catchAsync(async (req: AuthRequest, res: Response) => {
    const { bookingId, method, amount, transactionId } = req.body;

    if (!bookingId || !method || !amount) {
        throw { status: 400, message: "Missing required fields" };
    }

    const amountValue = Number(amount);

    if (Number.isNaN(amountValue) || amountValue <= 0) {
        throw { status: 400, message: "Amount must be positive" };
    }

    if (!paymentMethods.includes(method)) {
        throw { status: 400, message: "Invalid payment method" };
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
        throw { status: 404, message: "Booking not found" };
    }

    if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
        throw { status: 403, message: "Forbidden: You can only pay for your own booking" };
    }

    const payment = await db.payment.create({
        data: {
            bookingId,
            userId: booking.userId,
            method,
            amount: amountValue,
            transactionId
        }
    });

    return res.status(201).json({
        message: "Payment created successfully",
        data: payment
    });
});

// PATCH /payments/:id/status
export const updatePaymentStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (req.user.role !== "ADMIN") {
        throw { status: 403, message: "Forbidden: Admin access required" };
    }

    if (!paymentStatuses.includes(status)) {
        throw { status: 400, message: "Invalid payment status" };
    }

    const payment = await db.payment.update({
        where: { id },
        data: { status }
    });

    return res.status(200).json({
        message: "Payment status updated successfully",
        data: payment
    });
});

// DELETE /payments/:id
export const deletePayment = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };

    if (req.user.role !== "ADMIN") {
        throw { status: 403, message: "Forbidden: Admin access required" };
    }

    await db.payment.delete({ where: { id } });

    return res.status(200).json({ message: "Payment deleted successfully" });
});
