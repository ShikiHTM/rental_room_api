import type { Request, Response, NextFunction } from 'express'

type AsyncController = (req: any, res: Response, next: NextFunction) => Promise<any>;

const catchAsync = (fn: AsyncController) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    }
}

export { catchAsync };

