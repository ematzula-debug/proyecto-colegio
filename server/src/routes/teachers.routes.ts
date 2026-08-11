import { Router } from "express";
import {
  createTeacher,
  deactivateTeacher,
  getTeachers,
  updateTeacher,
} from "../controllers/teachers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profesores", authMiddleware, getTeachers);
router.post("/profesores", authMiddleware, createTeacher);
router.put("/profesores/:id", authMiddleware, updateTeacher);
router.patch("/profesores/:id/desactivar", authMiddleware, deactivateTeacher);

export default router;
