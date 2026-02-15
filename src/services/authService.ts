import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { User } from '@prisma/client';

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'secret';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    static async generateToken(user: User): Promise<string> {
        return jwt.sign({ id: user.id, email: user.email }, this.JWT_SECRET as string, {
            expiresIn: this.JWT_EXPIRES_IN as any,
        });
    }

    static async register(userData: Pick<User, 'email' | 'password' | 'name'>) {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
        });

        const token = await this.generateToken(user);

        return { user, token };
    }

    static async login(credentials: Pick<User, 'email' | 'password'>) {
        const user = await prisma.user.findUnique({
            where: { email: credentials.email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
        );

        if (!isPasswordCorrect) {
            throw new Error('Invalid credentials');
        }

        const token = await this.generateToken(user);

        return { user, token };
    }
}
