import express, { Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import Logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import imageRoutes from './routes/imageRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { protect } from './middleware/authMiddleware';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Sentry Initialization (Optional Placeholder)
// Sentry.init({ dsn: process.env.SENTRY_DSN });

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Request logging middleware
app.use((req, res, next) => {
    Logger.http(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

// Protected Example Route
app.get('/api/protected', protect, (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'You have accessed a protected route',
        user: req.user,
    });
});

// Error Handling
app.use(errorHandler);

// Server Init
app.listen(PORT, () => {
    Logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
