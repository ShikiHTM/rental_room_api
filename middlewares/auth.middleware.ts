import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config.js';

export interface UserPayload {
    id: string;
    role: 'USER' | 'HOST' | 'ADMIN';
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user: UserPayload
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
    // Get token form "Authorization: Bearer <token>"
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." })
    }

    try {
        const decoded = jwt.verify(token, authConfig.JWTSecret) as unknown as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' })
    }
}
