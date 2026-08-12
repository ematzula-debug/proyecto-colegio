import { Router } from "express";
import {
  createSubject,
  deactivateSubject,
  getSubjects,
  updateSubject,
} from "../controllers/subjects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/asignaturas",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getSubjects,
);

router.post(
  "/asignaturas",
  authMiddleware,
  requireRoles("ADMIN"),
  createSubject,
);

router.put(
  "/asignaturas/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateSubject,
);

router.patch(
  "/asignaturas/:id/desactivar",
  authMiddleware,
  requireRoles("ADMIN"),
  deactivateSubject,
);

export default router;
