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

export async function getGrades(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        nivel,
        estado
      FROM grados
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      message: "Grados obtenidos correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener grados:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener grados.",
    });
  }
}

export async function createGrade(req: AuthenticatedRequest, res: Response) {
  try {
    const { nombre, nivel } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del grado es obligatorio.",
      });
    }

    const duplicate = await pool.query(
      `
      SELECT id
      FROM grados
      WHERE LOWER(nombre) = LOWER($1)
      AND COALESCE(LOWER(nivel), '') = COALESCE(LOWER($2), '')
      `,
      [nombre.trim(), cleanOptional(nivel)],
    );

    if ((duplicate.rowCount ?? 0) > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un grado con ese nombre y nivel.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO grados
      (nombre, nivel, estado)
      VALUES ($1, $2, 'ACTIVO')
      RETURNING id, nombre, nivel, estado
      `,
      [nombre.trim(), cleanOptional(nivel)],
    );

    return res.status(201).json({
      success: true,
      message: "Grado registrado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear grado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al registrar grado.",
    });
  }
}

export async function updateGrade(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de grado inválido.",
      });
    }

    const { nombre, nivel } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del grado es obligatorio.",
      });
    }

    const duplicate = await pool.query(
      `
      SELECT id
      FROM grados
      WHERE LOWER(nombre) = LOWER($1)
      AND COALESCE(LOWER(nivel), '') = COALESCE(LOWER($2), '')
      AND id <> $3
      `,
      [nombre.trim(), cleanOptional(nivel), id],
    );

    if ((duplicate.rowCount ?? 0) > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya existe otro grado con ese nombre y nivel.",
      });
    }

    const result = await pool.query(
      `
      UPDATE grados
      SET
        nombre = $1,
        nivel = $2
      WHERE id = $3
      RETURNING id, nombre, nivel, estado
      `,
      [nombre.trim(), cleanOptional(nivel), id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Grado no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Grado actualizado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar grado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al actualizar grado.",
    });
  }
}

export async function deactivateGrade(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de grado inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE grados
      SET estado = 'INACTIVO'
      WHERE id = $1
      RETURNING id, nombre, nivel, estado
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Grado no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Grado desactivado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al desactivar grado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al desactivar grado.",
    });
  }
}
