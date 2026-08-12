import { Router } from "express";
import {
  createTeacher,
  deactivateTeacher,
  getTeachers,
  updateTeacher,
} from "../controllers/teachers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/profesores",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getTeachers,
);

router.post(
  "/profesores",
  authMiddleware,
  requireRoles("ADMIN"),
  createTeacher,
);

router.put(
  "/profesores/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateTeacher,
);

router.patch(
  "/profesores/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateTeacher,
);

export default router;
