import type { Response, Request, NextFunction } from 'express';
import { logger } from '../services/logger.service.js';

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error("--- Global Error Handle ---");
    logger.error(err);

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    if (err.errors && err.message === "Validation failed") {
        return res.status(400).json({
            message: "Invalid data",
            errors: err.errors
        })
    }

    if (err.code?.startsWith('P')) {
        return res.status(400).json({
            message: "Database Error",
            code: err.code
        });
    }

    res.status(status).json({
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}
