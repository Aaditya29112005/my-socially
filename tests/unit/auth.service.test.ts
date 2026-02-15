import { AuthService } from '../../src/services/authService';
import prisma from '../../src/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../src/utils/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('AuthService', () => {
    const mockUser: any = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should generate a JWT token', async () => {
            (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

            const token = await AuthService.generateToken(mockUser);

            expect(token).toBe('mocktoken');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser.id, email: mockUser.email },
                expect.any(String),
                expect.any(Object)
            );
        });
    });

    describe('register', () => {
        it('should throw error if user already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await expect(
                AuthService.register({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                })
            ).rejects.toThrow('User already exists with this email');
        });

        it('should hash password and create user', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

            const result = await AuthService.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    password: 'hashedpassword'
                })
            }));
            expect(result.token).toBe('mocktoken');
            expect(result.user).toEqual(mockUser);
        });
    });
});
