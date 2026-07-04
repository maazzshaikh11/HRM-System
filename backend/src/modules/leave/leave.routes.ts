/**
 * leave.routes.ts
 *
 * Configures express routing mappings for the Leave module endpoints.
 */

import { Router } from "express";
import { LeaveController } from "./leave.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";

const router = Router();
const controller = new LeaveController();

// All leave endpoints require authentication
router.use(authMiddleware);

// Employee actions
router.post("/", controller.applyLeave);
router.get("/", controller.getLeaveList);
router.get("/:id", controller.getLeaveById);
router.post("/:id/cancel", controller.cancelLeave);

// Admin / HR action
router.patch("/:id", controller.updateStatus);

export default router;
