import { Router } from "express";
import {
  createGrade,
  deactivateGrade,
  getGrades,
  updateGrade,
} from "../controllers/grades.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/grados", authMiddleware, getGrades);
router.post("/grados", authMiddleware, createGrade);
router.put("/grados/:id", authMiddleware, updateGrade);
router.patch("/grados/:id/desactivar", authMiddleware, deactivateGrade);

export default router;
