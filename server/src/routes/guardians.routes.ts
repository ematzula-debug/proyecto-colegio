import { Router } from "express";
import {
  createGuardian,
  deactivateGuardian,
  getGuardians,
  updateGuardian,
} from "../controllers/guardians.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/encargados", authMiddleware, getGuardians);
router.post("/encargados", authMiddleware, createGuardian);
router.put("/encargados/:id", authMiddleware, updateGuardian);
router.patch("/encargados/:id/desactivar", authMiddleware, deactivateGuardian);

export default router;
