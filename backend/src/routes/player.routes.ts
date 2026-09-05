import { Router } from "express";
import { getPlayers, getPlayerById } from "../controllers/player.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getPlayers);
router.get("/:id", getPlayerById);

export default router;

