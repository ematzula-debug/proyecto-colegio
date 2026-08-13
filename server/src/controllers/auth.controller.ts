import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import pool from "../db/pool";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const usuarioInput = String(req.body.usuario ?? "").trim();
    const contrasenaInput = String(req.body.contrasena ?? "").trim();

    if (!usuarioInput || !contrasenaInput) {
      res.status(400).json({
        success: false,
        message: "El usuario y la contraseña son obligatorios.",
      });
      return;
    }

    const userResult = await pool.query(
      `
      SELECT
        u.id,
        u.nombre_usuario,
        u.correo,
        u.contrasena,
        u.estado,
        r.nombre AS rol
      FROM usuarios u
      INNER JOIN roles r ON r.id = u.rol_id
      WHERE LOWER(TRIM(u.nombre_usuario)) = LOWER($1)
         OR LOWER(TRIM(u.correo)) = LOWER($1)
      LIMIT 1
      `,
      [usuarioInput],
    );

    if (userResult.rowCount === 0) {
      res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos.",
      });
      return;
    }

    const user = userResult.rows[0];

    if (user.estado !== "ACTIVO") {
      res.status(403).json({
        success: false,
        message: "El usuario está inactivo.",
      });
      return;
    }

    const passwordValido = await bcrypt.compare(
      contrasenaInput,
      user.contrasena,
    );

    if (!passwordValido) {
      res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos.",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("La variable JWT_SECRET no está configurada.");
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN ??
      "8h") as SignOptions["expiresIn"];

    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.nombre_usuario,
        correo: user.correo,
        rol: user.rol,
      },
      jwtSecret,
      {
        expiresIn,
        algorithm: "HS256",
      },
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: {
        token,
        user: {
          id: user.id,
          nombreUsuario: user.nombre_usuario,
          correo: user.correo,
          rol: user.rol,
        },
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
}
