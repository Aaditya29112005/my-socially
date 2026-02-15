import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import Logger from '../utils/logger';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Please provide email and password',
                });
            }

            const { user, token } = await AuthService.register({
                email,
                password,
                name,
            });

            // Remove password from output
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json({
                status: 'success',
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Please provide email and password',
                });
            }

            const { user, token } = await AuthService.login({ email, password });

            // Remove password from output
            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json({
                status: 'success',
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error: any) {
            // Catch specific "Invalid credentials" error and return 401
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    status: 'fail',
                    message: error.message,
                });
            }
            next(error);
        }
    }
}
