"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        users: {
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});
const prisma = new client_1.PrismaClient();
describe('Auth Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/login', () => {
        it('should return 401 for invalid credentials', async () => {
            prisma.users.findUnique.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ employee_id: 'INVALID', password: 'wrong' });
            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toEqual('Invalid credentials');
        });
        it('should return token for valid seeded credentials (fallback)', async () => {
            prisma.users.findUnique.mockResolvedValue({
                id: 1,
                employee_id: 'EMP-001',
                password: 'hashed_password_placeholder',
                role: 'Admin'
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ employee_id: 'EMP-001', password: 'admin' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.access_token).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=/);
        });
    });
    describe('GET /api/auth/me', () => {
        it('should return 401 if no token provided', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
            expect(res.statusCode).toEqual(401);
        });
    });
    describe('GET /api/auth/admin-only', () => {
        it('should return 403 for non-admin token', async () => {
            // Create a valid employee token
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: 2, role: 'Employee' }, process.env.JWT_SECRET || 'fallback_secret_for_dev');
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/admin-only')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(403);
        });
        it('should return 200 for admin token', async () => {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: 1, role: 'Admin' }, process.env.JWT_SECRET || 'fallback_secret_for_dev');
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/admin-only')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Welcome Admin');
        });
    });
});
