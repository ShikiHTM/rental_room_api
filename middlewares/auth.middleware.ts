import {type Request, type Response, type NextFunction} from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): any => {
    // Get token form "Authorization: Bearer <token>"
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({message: "Access denied. No token provided."})
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch(error) {
        return res.status(403).json({ message: 'Invalid or expired token.' })
    }
}