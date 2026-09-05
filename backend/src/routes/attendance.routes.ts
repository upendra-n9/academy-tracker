import { Router } from "express";
import { markAttendance, uploadPhoto, bulkMarkAttendance } from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/mark", markAttendance);
router.post("/bulk", bulkMarkAttendance);
router.post("/:attendanceId/photo", uploadPhoto);

export default router;

