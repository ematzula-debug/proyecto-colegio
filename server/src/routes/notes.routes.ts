import { Router } from "express";
import {
  annulNote,
  createNote,
  getNotes,
  updateNote,
} from "../controllers/notes.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/notas",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR", "PADRE_ENCARGADO", "ALUMNO"),
  getNotes,
);

router.post(
  "/notas",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  createNote,
);

router.put(
  "/notas/:id",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  updateNote,
);

router.patch(
  "/notas/:id/anular",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  annulNote,
);

export default router;
