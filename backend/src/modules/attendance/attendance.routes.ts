import { Router } from "express";
import { AttendanceController } from "./attendance.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";

const router = Router();
const controller = new AttendanceController();

// Protect all attendance routes with JWT auth middleware
router.use(authMiddleware);

router.post("/check-in", controller.checkIn);
router.post("/check-out", controller.checkOut);
router.get("/", controller.getAttendance);
router.get("/:id", controller.getAttendanceById);

export default router;
