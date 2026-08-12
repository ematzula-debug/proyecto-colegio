import { Router } from "express";
import {
  createTeacherAssignment,
  deactivateTeacherAssignment,
  getTeacherAssignments,
  updateTeacherAssignment,
} from "../controllers/teacherAssignments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/asignaciones-profesor",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getTeacherAssignments,
);

router.post(
  "/asignaciones-profesor",
  authMiddleware,
  requireRoles("ADMIN"),
  createTeacherAssignment,
);

router.put(
  "/asignaciones-profesor/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateTeacherAssignment,
);

router.patch(
  "/asignaciones-profesor/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateTeacherAssignment,
);

export default router;
