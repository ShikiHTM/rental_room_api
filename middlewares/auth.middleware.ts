import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config.js';
import type { IUserPayload } from '../types/types.js';
import { catchAsync } from '../Utils/catchAsync.utils.js';
import db from '../Database/Utils/db.js';

export type AuthRequest = Omit<Request, 'user'> & { user: IUserPayload };

export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
    const token = req.signedCookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." })
    }

    try {
        const decoded = jwt.verify(token, authConfig.JWTSecret) as unknown as IUserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' })
    }
}

export const checkBanned = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await db.user.findUnique({
        where: { id: req.user.id },
        select: { bannedAt: true, banExpiresAt: true, banReason: true }
    });

    if(user?.bannedAt && (!user.banExpiresAt || user.banExpiresAt > new Date())) {
        return res.status(403).json({
            message: 'Your account is banned.',
            banDetails: {
                bannedAt: user.bannedAt,
                bannedExpiresAt: user.banExpiresAt,
                banReason: user.banReason
            }
        })
    }

    next();
})