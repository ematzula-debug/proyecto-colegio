import { Router } from "express";
import {
  createEnrollment,
  getEnrollments,
  updateEnrollment,
  withdrawEnrollment,
} from "../controllers/enrollments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/inscripciones",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getEnrollments,
);

router.post(
  "/inscripciones",
  authMiddleware,
  requireRoles("ADMIN"),
  createEnrollment,
);

router.put(
  "/inscripciones/:id",
  authMiddleware,
  requireRoles("ADMIN"),
  updateEnrollment,
);

router.patch(
  "/inscripciones/:id/retirar",
  authMiddleware,
  requireRoles("ADMIN"),
  withdrawEnrollment,
);

export default router;
