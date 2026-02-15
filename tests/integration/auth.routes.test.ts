import request from 'supertest';
import app from '../../src/server';
import prisma from '../../src/utils/prisma';
import bcrypt from 'bcryptjs';

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

describe('Auth Routes Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user and return status 201', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: '123',
                email: 'newuser@example.com',
                name: 'New User',
                password: 'hashedpassword',
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123',
                    name: 'New User',
                });

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.user.email).toBe('newuser@example.com');
            expect(res.body.data.token).toBeDefined();
        });

        it('should return 400 if email or password missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'onlyemail@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe('fail');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: '123',
                email: 'test@example.com',
                password: 'hashedpassword',
                name: 'Test User',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.token).toBeDefined();
        });

        it('should return 401 for incorrect password', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: '123',
                email: 'test@example.com',
                password: 'hashedpassword',
                name: 'Test User',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.status).toBe('fail');
        });
    });
});
