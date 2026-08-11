import { Router } from "express";
import {
  createSubject,
  deactivateSubject,
  getSubjects,
  updateSubject,
} from "../controllers/subjects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/asignaturas", authMiddleware, getSubjects);
router.post("/asignaturas", authMiddleware, createSubject);
router.put("/asignaturas/:id", authMiddleware, updateSubject);
router.patch("/asignaturas/:id/desactivar", authMiddleware, deactivateSubject);

export default router;
