import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export const isAdmin = ( req: AuthRequest, res: Response, next: NextFunction ): any => {
    if((req.user as any).role !== 'ADMIN') {
        return res.status(403).json({
            message: 'Forbidden: Admin access required'
        })
        next();
    }
}

export const isHost = ( req: AuthRequest, res: Response, next: NextFunction): any => {
    const role = (req.user as any).role;
    if (role !== 'HOST' && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Host or Admin access required' });
    }
    next();
}