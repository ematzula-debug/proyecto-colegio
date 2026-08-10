import { Router } from "express";
import {
  createStudent,
  deactivateStudent,
  getStudents,
  updateStudent,
} from "../controllers/students.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/alumnos", authMiddleware, getStudents);
router.post("/alumnos", authMiddleware, createStudent);
router.put("/alumnos/:id", authMiddleware, updateStudent);
router.patch("/alumnos/:id/desactivar", authMiddleware, deactivateStudent);

export default router;
