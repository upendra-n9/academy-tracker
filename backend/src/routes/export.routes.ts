import { Router } from "express";
import { exportAttendanceCSV } from "../controllers/export.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/csv", exportAttendanceCSV);

export default router;

