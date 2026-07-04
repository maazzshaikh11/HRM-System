"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../../../src/middlewares/authMiddleware");
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
router.get('/stats', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('Admin'), dashboard_controller_1.DashboardController.getStats);
router.get('/pending-approvals', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('Admin'), dashboard_controller_1.DashboardController.getPendingApprovals);
exports.default = router;
