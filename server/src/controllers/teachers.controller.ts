import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

function cleanOptional(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  return cleaned === "" ? null : cleaned;
}

export async function getTeachers(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        codigo,
        nombres,
        apellidos,
        telefono,
        correo,
        estado,
        usuario_id AS "usuarioId"
      FROM profesores
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      message: "Profesores obtenidos correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener profesores:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener profesores.",
    });
  }
}

export async function createTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    const { codigo, nombres, apellidos, telefono, correo } = req.body;

    if (!codigo || !nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        message: "Código, nombres y apellidos son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO profesores
      (codigo, nombres, apellidos, telefono, correo, estado)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVO')
      RETURNING
        id,
        codigo,
        nombres,
        apellidos,
        telefono,
        correo,
        estado,
        usuario_id AS "usuarioId"
      `,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        cleanOptional(telefono),
        cleanOptional(correo),
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Profesor registrado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear profesor:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un profesor con ese código.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar profesor.",
    });
  }
}

export async function updateTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de profesor inválido.",
      });
    }

    const { codigo, nombres, apellidos, telefono, correo } = req.body;

    if (!codigo || !nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        message: "Código, nombres y apellidos son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      UPDATE profesores
      SET
        codigo = $1,
        nombres = $2,
        apellidos = $3,
        telefono = $4,
        correo = $5
      WHERE id = $6
      RETURNING
        id,
        codigo,
        nombres,
        apellidos,
        telefono,
        correo,
        estado,
        usuario_id AS "usuarioId"
      `,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        cleanOptional(telefono),
        cleanOptional(correo),
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Profesor no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Profesor actualizado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar profesor:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un profesor con ese código.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar profesor.",
    });
  }
}

export async function deactivateTeacher(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de profesor inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE profesores
      SET estado = 'INACTIVO'
      WHERE id = $1
      RETURNING
        id,
        codigo,
        nombres,
        apellidos,
        telefono,
        correo,
        estado,
        usuario_id AS "usuarioId"
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Profesor no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Profesor desactivado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al desactivar profesor:", error);

    return res.status(500).json({
      success: false,
      message: "Error al desactivar profesor.",
    });
  }
}
