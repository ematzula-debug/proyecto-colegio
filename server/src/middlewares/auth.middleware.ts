import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUserPayload {
  id: number;
  usuario: string;
  correo: string;
  rol: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado.",
      });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET no está configurado en el servidor.",
      });
    }

    const decoded = jwt.verify(token, secret) as AuthUserPayload;

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Error al validar token:", error);

    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
}
