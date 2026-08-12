import { Router } from "express";
import {
  createSection,
  deactivateSection,
  getSections,
  updateSection,
} from "../controllers/sections.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/secciones",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getSections,
);

router.post("/secciones", authMiddleware, requireRoles("ADMIN"), createSection);

router.put(
  "/secciones/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateSection,
);

router.patch(
  "/secciones/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateSection,
);

export default router;
