import { Router } from "express";
import {
  createGrade,
  deactivateGrade,
  getGrades,
  updateGrade,
} from "../controllers/grades.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/grados",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getGrades,
);

router.post("/grados", authMiddleware, requireRoles("ADMIN"), createGrade);

router.put("/grados/:id", authMiddleware, requireRoles("ADMIN"), updateGrade);

router.patch(
  "/grados/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateGrade,
);

export default router;
