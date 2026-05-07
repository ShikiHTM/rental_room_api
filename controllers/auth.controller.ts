import { type Request, type Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import db from '../Database/Utils/db.js';
import { authConfig } from "../config/auth.config.js";
import { serverConfig } from "../config/server.config.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { IMailConfig } from "../types/types.js";
import QueueService from "../services/rabbitmq.service.js";
import { mailConfig } from "../config/mail.config.js";
import crypto from 'node:crypto'
import dayjs from "dayjs";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { BadRequestError, NotFoundError, ValidationError } from "../Utils/AppError.js";
import { CreateUserSchema, LoginUserSchema } from "../Utils/schemas/user.schema.js";

export const register = catchAsync(async (req: Request, res: Response) => {
    const result = CreateUserSchema.safeParse(req.body);
    if(!result.success) throw new ValidationError(result.error.issues);

    const { email, password, fullName, phoneNumber } = result.data;

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new BadRequestError("Email has been used.")
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mailRandomToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = crypto.createHash('sha256').update(mailRandomToken).digest('hex');

    const newUser = await db.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
            verifyToken: hashedVerifyToken,
        }
    });

    const token = jwt.sign(
        { id: newUser.id, role: newUser.role, email: newUser.email },
        authConfig.JWTSecret,
        { expiresIn: authConfig.expiresIn }
    );

    const mailData: IMailConfig = {
        from: mailConfig.address!,
        to: newUser.email,
        subject: 'Verify your email',
        text: `Hi ${newUser.fullName}, please verify your email by clicking this link: ${serverConfig.frontendUrl}/verify?token=${mailRandomToken}`,
        html: `<b>Hi ${newUser.fullName}</b>,<br>Click <a href="${serverConfig.frontendUrl}/verify?token=${mailRandomToken}">here</a> to verify your email.`
    }

    await QueueService.sendToEmailQueue(mailData);

    return res.status(201).cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        signed: true
    }).json({
        message: "Register successfully!",
        userId: newUser.id,
    })
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const result = LoginUserSchema.safeParse(req.body);
    if(!result.success) throw new BadRequestError("Missing or empty required fields");

    const { email, password } = result.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        throw new BadRequestError("Invalid username or password.");
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new BadRequestError("Invalid username or password.");
    };

    const token = jwt.sign(
        { id: user.id, role: user.role },
        authConfig.JWTSecret,
        { expiresIn: authConfig.expiresIn }
    );

    return res.status(200).cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        signed: true
    }).json({
        message: 'Login Successfully.',
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    });
});

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        signed: true
    });
    return res.status(200).json({ message: 'Logout successfully' })
})

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        throw new BadRequestError("Invalid or missing token.")
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await db.user.findFirst({ where: { verifyToken: hashedToken } });

    if (!user) {
        throw new BadRequestError("Invalid or expired token.");
    }

    await db.user.update({
        where: { id: user.id },
        data: { verifiedAt: new Date(), verifyToken: null }
    });

    return res.status(200).json({
        message: "Your account is verified successfully"
    });
})

// POST /auth/forgot-password
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new BadRequestError("Mising required fields.");
    }

    const token = crypto.randomBytes(32).toString('hex');

    const user = await db.user.findUnique({ where: { email } });

    if (user) {
        await db.passwordResetToken.deleteMany({
            where: { userId: user.id }
        })

        await db.passwordResetToken.create({
            data: {
                userId: user.id,
                token: crypto.createHash('sha256').update(token).digest('hex'),
                expiredAt: new Date(Date.now() + 1000 * 60 * 60),
            }
        });

        const mailData: IMailConfig = {
            from: mailConfig.address!,
            to: user.email,
            subject: 'Reset your password',
            text: `Hi ${user.fullName}, we have received your recovery password request. If this is not your doing, please ignore this email.`,
            html: `<b>Hi ${user.fullName}</b>,<br>Click <a href="${serverConfig.frontendUrl}/reset-password?token=${token}">here</a> to reset your password.`
        };

        await QueueService.sendToEmailQueue(mailData);
    }

    return res.status(200).json({
        message: 'If your email is in our system, you will receive a reset link shortly!'
    })
})

// POST /auth/reset-password
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new BadRequestError("Mising required fields.");
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const record = await db.passwordResetToken.findUnique({
        where: { token: hashedToken }
    })

    if (!record) {
        throw new BadRequestError("Token is invalid.");
    }

    if (dayjs().isAfter(record.expiredAt)) {
        await db.passwordResetToken.delete({
            where: { token: hashedToken }
        })
        throw new BadRequestError("Token is expired.")
    }

    const user = await db.user.findUnique({ where: { id: record.userId } });

    if (!user) {
        throw new NotFoundError("User not found.");
    }

    await db.user.update({
        where: { id: record.userId },
        data: { password: await bcrypt.hash(password, 10) }
    })

    await db.passwordResetToken.deleteMany({
        where: { userId: record.userId }
    })

    return res.status(200).json({
        message: 'Your password has been changed successfully'
    })
})
