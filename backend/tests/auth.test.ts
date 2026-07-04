import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    users: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ employee_id: 'INVALID', password: 'wrong' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Invalid credentials');
    });

    it('should return token for valid seeded credentials (fallback)', async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        employee_id: 'EMP-001',
        password: 'hashed_password_placeholder',
        role: 'Admin'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ employee_id: 'EMP-001', password: 'admin' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.access_token).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=/);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/auth/admin-only', () => {
    it('should return 403 for non-admin token', async () => {
      // Create a valid employee token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 2, role: 'Employee' }, process.env.JWT_SECRET || 'fallback_secret_for_dev');

      const res = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should return 200 for admin token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 1, role: 'Admin' }, process.env.JWT_SECRET || 'fallback_secret_for_dev');

      const res = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Welcome Admin');
    });
  });
});
