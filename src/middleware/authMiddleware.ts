import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Logger from '../utils/logger';

interface JwtPayload {
    id: string;
    email: string;
}

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'Not authorized, no token provided',
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret'
        ) as JwtPayload;

        req.user = decoded;
        next();
    } catch (error) {
        Logger.error('Auth Middleware Error:', error);
        return res.status(401).json({
            status: 'fail',
            message: 'Not authorized, token failed',
        });
    }
};
