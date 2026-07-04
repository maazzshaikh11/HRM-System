"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../../../src/middlewares/authMiddleware");
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
router.get('/attendance-trends', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('Admin'), analytics_controller_1.AnalyticsController.getAttendanceTrends);
router.get('/department-distribution', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('Admin'), analytics_controller_1.AnalyticsController.getDepartmentDistro);
exports.default = router;
