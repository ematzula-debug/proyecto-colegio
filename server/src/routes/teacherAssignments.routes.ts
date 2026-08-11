import { Router } from "express";
import {
  createTeacherAssignment,
  deactivateTeacherAssignment,
  getTeacherAssignments,
  updateTeacherAssignment,
} from "../controllers/teacherAssignments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/asignaciones-profesor", authMiddleware, getTeacherAssignments);
router.post("/asignaciones-profesor", authMiddleware, createTeacherAssignment);
router.put(
  "/asignaciones-profesor/:id",
  authMiddleware,
  updateTeacherAssignment,
);
router.patch(
  "/asignaciones-profesor/:id/desactivar",
  authMiddleware,
  deactivateTeacherAssignment,
);

export default router;
