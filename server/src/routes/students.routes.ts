import { Router } from "express";
import {
  createStudent,
  deactivateStudent,
  getStudents,
  updateStudent,
} from "../controllers/students.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/alumnos",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getStudents,
);

router.post("/alumnos", authMiddleware, requireRoles("ADMIN"), createStudent);

router.put(
  "/alumnos/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateStudent,
);

router.patch(
  "/alumnos/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateStudent,
);

export default router;
