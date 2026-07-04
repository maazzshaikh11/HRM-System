"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../../../src/middlewares/authMiddleware");
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.verifyToken, notifications_controller_1.NotificationsController.getMyNotifications);
router.patch('/:id/read', authMiddleware_1.verifyToken, notifications_controller_1.NotificationsController.markRead);
exports.default = router;
