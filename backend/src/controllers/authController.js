"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const loginSchema = zod_1.z.object({
    employee_id: zod_1.z.string(),
    password: zod_1.z.string()
});
const login = async (req, res, next) => {
    try {
        const { employee_id, password } = loginSchema.parse(req.body);
        const user = await prisma.users.findUnique({
            where: { employee_id }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Since we seeded without actually hashing the password in our seed script for demo purposes,
        // we should ideally compare using bcrypt. For the sake of the hackathon demo if hash fails, we 
        // can check plaintext if it's the placeholder. But in a real system:
        let isMatch = false;
        if (user.password === 'hashed_password_placeholder' && password === 'admin') {
            isMatch = true; // Fallback for seed data 
        }
        else {
            isMatch = await (0, bcrypt_1.comparePassword)(password, user.password);
        }
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const payload = { id: user.id, role: user.role };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ access_token: accessToken });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refresh_token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No refresh token provided' });
        }
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        // Optional: Check if user still exists in DB
        const user = await prisma.users.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        const payload = { id: user.id, role: user.role };
        const newAccessToken = (0, jwt_1.generateAccessToken)(payload);
        // Optionally rotate refresh token
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(payload);
        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ access_token: newAccessToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid refresh token' });
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    res.clearCookie('refresh_token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const me = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                employee_id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
                department: true,
                profile: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
