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

export async function getStudents(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        codigo,
        nombres,
        apellidos,
        fecha_nacimiento AS "fechaNacimiento",
        direccion,
        telefono,
        estado,
        usuario_id AS "usuarioId"
      FROM alumnos
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      message: "Alumnos obtenidos correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener alumnos:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener alumnos.",
    });
  }
}

export async function createStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const { codigo, nombres, apellidos, fechaNacimiento, direccion, telefono } =
      req.body;

    if (!codigo || !nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        message: "Código, nombres y apellidos son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO alumnos
      (codigo, nombres, apellidos, fecha_nacimiento, direccion, telefono, estado)
      VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVO')
      RETURNING
        id,
        codigo,
        nombres,
        apellidos,
        fecha_nacimiento AS "fechaNacimiento",
        direccion,
        telefono,
        estado,
        usuario_id AS "usuarioId"
      `,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        cleanOptional(fechaNacimiento),
        cleanOptional(direccion),
        cleanOptional(telefono),
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Alumno registrado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear alumno:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un alumno con ese código.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar alumno.",
    });
  }
}

export async function updateStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de alumno inválido.",
      });
    }

    const { codigo, nombres, apellidos, fechaNacimiento, direccion, telefono } =
      req.body;

    if (!codigo || !nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        message: "Código, nombres y apellidos son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      UPDATE alumnos
      SET
        codigo = $1,
        nombres = $2,
        apellidos = $3,
        fecha_nacimiento = $4,
        direccion = $5,
        telefono = $6
      WHERE id = $7
      RETURNING
        id,
        codigo,
        nombres,
        apellidos,
        fecha_nacimiento AS "fechaNacimiento",
        direccion,
        telefono,
        estado,
        usuario_id AS "usuarioId"
      `,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        cleanOptional(fechaNacimiento),
        cleanOptional(direccion),
        cleanOptional(telefono),
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Alumno actualizado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar alumno:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un alumno con ese código.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar alumno.",
    });
  }
}

export async function deactivateStudent(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de alumno inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE alumnos
      SET estado = 'INACTIVO'
      WHERE id = $1
      RETURNING
        id,
        codigo,
        nombres,
        apellidos,
        fecha_nacimiento AS "fechaNacimiento",
        direccion,
        telefono,
        estado,
        usuario_id AS "usuarioId"
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Alumno desactivado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al desactivar alumno:", error);

    return res.status(500).json({
      success: false,
      message: "Error al desactivar alumno.",
    });
  }
}
