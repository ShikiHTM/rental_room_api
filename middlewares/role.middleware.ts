import type { NextFunction, Request, Response } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction): any => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
}

export const isHost = (req: Request, res: Response, next: NextFunction): any => {
    const role = req.user?.role;
    if (role !== 'HOST' && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Host or Admin access required' });
    }
    next();
}