import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
  id: number;
  usuario: string;
  correo: string;
  rol: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token de autorización no proporcionado.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as TokenPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
}
