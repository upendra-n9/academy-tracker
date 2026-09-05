import { Router } from "express";
import { getTodaySessions, getSessionById } from "../controllers/session.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/today", getTodaySessions);
router.get("/:id", getSessionById);

export default router;

