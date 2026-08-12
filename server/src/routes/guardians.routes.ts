import { Router } from "express";
import {
  createGuardian,
  deactivateGuardian,
  getGuardians,
  updateGuardian,
} from "../controllers/guardians.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/encargados", authMiddleware, requireRoles("ADMIN"), getGuardians);

router.post(
  "/encargados",
  authMiddleware,
  requireRoles("ADMIN"),
  createGuardian,
);

router.put(
  "/encargados/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateGuardian,
);

router.patch(
  "/encargados/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateGuardian,
);

export default router;
