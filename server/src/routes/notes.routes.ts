import { Router } from "express";
import {
  annulNote,
  createNote,
  getNotes,
  updateNote,
} from "../controllers/notes.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/notas", authMiddleware, getNotes);
router.post("/notas", authMiddleware, createNote);
router.put("/notas/:id", authMiddleware, updateNote);
router.patch("/notas/:id/anular", authMiddleware, annulNote);

export default router;
