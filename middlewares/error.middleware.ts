import type { Response, Request, NextFunction } from 'express';
import { logger } from '../services/logger.service.js';
import { AppError } from '../Utils/AppError.js';

export const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error("--- Global Error Handle ---");
    logger.error(err);

    if (err instanceof AppError) {
        return res.status(err.status).json({
            message: err.message,
            ...(err.errors ? { errors: err.errors } : {}),
            ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
        });
    }

    if (err instanceof Error && (err as any).code?.startsWith('P')) {
        return res.status(400).json({ message: 'Database Error' });
    }

    const stack = err instanceof Error ? err.stack : undefined;
    res.status(500).json({
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' ? { stack } : {})
    });
}
