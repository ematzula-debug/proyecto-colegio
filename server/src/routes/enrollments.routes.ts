import { Router } from "express";
import {
  createEnrollment,
  getEnrollments,
  updateEnrollment,
  withdrawEnrollment,
} from "../controllers/enrollments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/inscripciones", authMiddleware, getEnrollments);
router.post("/inscripciones", authMiddleware, createEnrollment);
router.put("/inscripciones/:id", authMiddleware, updateEnrollment);
router.patch("/inscripciones/:id/retirar", authMiddleware, withdrawEnrollment);

export default router;
