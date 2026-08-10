import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import pool from "../db/pool";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      res.status(400).json({
        success: false,
        message: "El usuario y la contraseña son obligatorios.",
      });
      return;
    }

    const result = await pool.query(
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
      WHERE u.nombre_usuario = $1 OR u.correo = $1
      LIMIT 1
      `,
      [usuario],
    );

    if (!result.rowCount) {
      res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
      });
      return;
    }

    const user = result.rows[0];

    if (user.estado !== "ACTIVO") {
      res.status(403).json({
        success: false,
        message: "El usuario no se encuentra activo.",
      });
      return;
    }

    const passwordValido = await bcrypt.compare(contrasena, user.contrasena);

    if (!passwordValido) {
      res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
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
