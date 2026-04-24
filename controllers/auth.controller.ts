import { type Request, type Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import db from '../Database/Utils/db.js';
import { authConfig } from "../config/auth.config.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";
import type { IMailConfig } from "../types/types.js";
import QueueService from "../services/rabbitmq.service.js";
import { mailConfig } from "../config/mail.config.js";
import crypto from 'node:crypto'
import dayjs from "dayjs";

export const register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, fullName, phoneNumber } = req.body;

    if (!email || !password || !fullName || email.trim() === '' || password.trim() == '') {
        throw { status: 400, message: "Missing or empty required fields." }
    }

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
        throw { status: 400, message: "Email has been used." }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.user.create({
        data: {
            email: email,
            password: hashedPassword,
            fullName: fullName,
            phoneNumber: phoneNumber,
        }
    });

    const token = jwt.sign(
        { userId: newUser.id, role: newUser.role, email: newUser.email },
        authConfig.JWTSecret,
        { expiresIn: authConfig.expiresIn }
    );

    const mailData: IMailConfig = {
        from: mailConfig.address!,
        to: newUser.email,
        subject: 'Verify your email',
        text: `Hi ${newUser.fullName}, please verify your email by clicking this link: https://localhost:3000/verify?token=${token}`,
        html: `<b>Hi ${newUser.fullName}</b>,<br>Click <a href="https://localhost:3000/verify?token=${token}">here</a> to verify your email.`
    }
    
    await QueueService.sendToEmailQueue(mailData);

    return res.status(200).cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
        sameSite: 'strict'
    }).json({
        message: "Register successfully!",
        userId: newUser.id,
    })
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password || email.trim() === '' || password.trim() == '') {
        throw { status: 400, message: 'Missing or empty required fields.' };
    };

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        throw { status: 400, message: "Invalid username or password." };
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { status: 400, message: "Invalid username or password." };
    };

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        authConfig.JWTSecret,
        { expiresIn: authConfig.expiresIn }
    );

    return res.status(200).cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
        sameSite: 'strict'
    }).json({
        message: 'Login Successfully.',
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    });
})

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await db.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
        }
    });

    if (!user) throw { status: 400, message: "User not found" };

    return res.status(200).json({ data: user });
})

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.query;

    if(!token || typeof token !== 'string') {
        throw {status: 400, message: 'Invalid or missing token'};
    }

    const decoded = jwt.verify(token, authConfig.JWTSecret) as {userId: string, role: string, email: string};

    await db.user.update({
        where: {id: decoded.userId},
        data: {verifiedAt: new Date()}
    })

    return res.status(200).json({
        message: "Your account is verified successfully"
    })
})

// POST /auth/forgot-password
export const sendResetLinkEmail = catchAsync(async (req: Request, res: Response) => { 
    const { email } = req.body;

    if (!email) {
        throw { status: 400, message: 'Missing required fields' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    const user = await db.user.findUnique({ where: {email} });

    if(user) {
        await db.passwordResetTokens.deleteMany({
            where: {userId: user.id}
        })

        await db.passwordResetTokens.create({
            data: {
                userId: user.id,
                token: crypto.createHash('sha256').update(token).digest('hex'),
                expiredAt: new Date(Date.now() + 1000 * 60 * 60), // Expire after 60 minutes
            }
        });

        const mailData: IMailConfig = {
            from: mailConfig.address!,
            to: user.email,
            subject: 'Reset your password',
            text: `Hi ${user.fullName}, we have received your recovery password request. if this is not your doing, please ignore this email`,
            html: `<b>Hi ${user.fullName}</b>,<br>Click <a href="https://localhost:3000/reset-password?token=${token}">here</a> to reset your password.`
        };

        QueueService.sendToEmailQueue(mailData);
    }

    return res.status(200).json({
        'message': 'If your email is in our system, you will receive a reset link shortly!'
    })
})

// POST /auth/reset-password
export const reset = catchAsync(async (req: Request, res: Response) => {
    const {token, password} = req.body;

    if (!token || !password) {
        throw { status: 400, message: 'Missing required fields' };
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex') 

    const record = await db.passwordResetTokens.findUnique({
        where: { token: hashedToken }
    })

    if(!record) {
        throw {status: 400, message: 'token is invalid'}
    }

    if(dayjs().isAfter(record.expiredAt)) {
        await db.passwordResetTokens.delete({
            where: { token: hashedToken }
        })
        throw {status: 410, message: 'token is expired'}
    }

    const user = await db.user.findUnique({ where: {id: record.userId}} );

    if(!user) {
        throw {status: 404, message: 'User not found'}
    }

    await db.user.update({
        where: {id: record.userId},
        data: {
            password: await bcrypt.hash(password, 10)
        }
    })
    await db.passwordResetTokens.deleteMany({
        where: {userId: record.userId}
    })

    return res.status(200).json({
        'message': 'Your password has been changed successfully'
    })
})