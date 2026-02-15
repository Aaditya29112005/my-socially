import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Logger.error(`${err.name}: ${err.message}`);

    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message,
    });
};
