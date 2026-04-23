import { type Request, type Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import db from '../Database/Utils/db.js';
import { authConfig } from "../config/auth.config.js";
import { catchAsync } from "../Utils/catchAsync.utils.js";

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
        { userId: newUser.id, role: newUser.role },
        authConfig.JWTSecret,
        { expiresIn: authConfig.expiresIn }
    );

    return res.status(201).cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
        sameSite: 'strict'
    }).json({
        message: "Register sucessfully!",
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
