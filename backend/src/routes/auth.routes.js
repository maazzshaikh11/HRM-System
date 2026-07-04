"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', authController_1.login);
router.post('/refresh', authController_1.refresh);
router.post('/logout', authController_1.logout);
// Protected routes
router.get('/me', authMiddleware_1.verifyToken, authController_1.me);
// Example of admin only route for testing RBAC
router.get('/admin-only', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('Admin'), (req, res) => {
    res.json({ message: 'Welcome Admin' });
});
exports.default = router;
