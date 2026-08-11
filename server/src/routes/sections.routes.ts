import { Router } from "express";
import {
  createSection,
  deactivateSection,
  getSections,
  updateSection,
} from "../controllers/sections.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/secciones", authMiddleware, getSections);
router.post("/secciones", authMiddleware, createSection);
router.put("/secciones/:id", authMiddleware, updateSection);
router.patch("/secciones/:id/desactivar", authMiddleware, deactivateSection);

export default router;
