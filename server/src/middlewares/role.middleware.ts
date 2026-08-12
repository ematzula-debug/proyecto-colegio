import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export type RoleName =
  | "ADMIN"
  | "PROFESOR_DIRECTOR"
  | "PADRE_ENCARGADO"
  | "ALUMNO";

export function requireRoles(...allowedRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.rol as RoleName | undefined;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado.",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
}
