import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/dashboard/summary",
  authMiddleware,
  requireRoles("ADMIN", "PROFESOR_DIRECTOR"),
  getDashboardSummary,
);

export default router;
