import type { Response } from "express";
import db from "../Database/Utils/db.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../Utils/AppError.js";
import { PaymentService } from "../services/payment.service.js";
import { CashPaymentStrategy } from "../services/concrete/cash.concrete.js";

const PLANNED_METHODS = new Set(['BANK_TRANSFER', 'ONLINE']);

// POST /payments
export const createPayment = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { bookingId, method, amount } = req.body ?? {};

    if (!bookingId || typeof bookingId !== 'string') {
        throw new BadRequestError('bookingId is required.');
    }
    if (!method || typeof method !== 'string') {
        throw new BadRequestError('Payment method is required.');
    }
    if (PLANNED_METHODS.has(method)) {
        return res.status(501).json({
            message: `${method} payments are not available yet — future planned.`,
        });
    }
    if (method !== 'CASH') {
        throw new BadRequestError('Unsupported payment method.');
    }
    if (typeof amount !== 'number' || amount <= 0) {
        throw new BadRequestError('amount must be a positive number.');
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.userId !== userId) throw new ForbiddenError('You can only pay for your own bookings.');

    const service = new PaymentService(new CashPaymentStrategy());
    await service.pay(amount);

    const payment = await db.payment.create({
        data: {
            bookingId,
            method: 'CASH',
            amount,
            status: 'PENDING',
        },
    });

    return res.status(201).json({
        message: 'Cash payment recorded. The host will collect the amount on check-in.',
        data: payment,
    });
});
