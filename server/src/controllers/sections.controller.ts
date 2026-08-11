import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getSections(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.nombre,
        s.grado_id AS "gradoId",
        g.nombre AS "gradoNombre",
        g.nivel AS "gradoNivel",
        s.estado
      FROM secciones s
      INNER JOIN grados g ON g.id = s.grado_id
      ORDER BY s.id DESC
    `);

    return res.json({
      success: true,
      message: "Secciones obtenidas correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener secciones:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener secciones.",
    });
  }
}

export async function createSection(req: AuthenticatedRequest, res: Response) {
  try {
    const { nombre, gradoId } = req.body;

    if (!nombre || !gradoId) {
      return res.status(400).json({
        success: false,
        message: "Nombre de sección y grado son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO secciones
      (nombre, grado_id, estado)
      VALUES ($1, $2, 'ACTIVO')
      RETURNING
        id,
        nombre,
        grado_id AS "gradoId",
        estado
      `,
      [nombre.trim().toUpperCase(), Number(gradoId)],
    );

    return res.status(201).json({
      success: true,
      message: "Sección registrada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear sección:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una sección con ese nombre para el grado seleccionado.",
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return res.status(400).json({
        success: false,
        message: "El grado seleccionado no existe.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar sección.",
    });
  }
}

export async function updateSection(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sección inválido.",
      });
    }

    const { nombre, gradoId } = req.body;

    if (!nombre || !gradoId) {
      return res.status(400).json({
        success: false,
        message: "Nombre de sección y grado son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      UPDATE secciones
      SET
        nombre = $1,
        grado_id = $2
      WHERE id = $3
      RETURNING
        id,
        nombre,
        grado_id AS "gradoId",
        estado
      `,
      [nombre.trim().toUpperCase(), Number(gradoId), id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Sección no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Sección actualizada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar sección:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una sección con ese nombre para el grado seleccionado.",
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return res.status(400).json({
        success: false,
        message: "El grado seleccionado no existe.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar sección.",
    });
  }
}

export async function deactivateSection(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sección inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE secciones
      SET estado = 'INACTIVO'
      WHERE id = $1
      RETURNING
        id,
        nombre,
        grado_id AS "gradoId",
        estado
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Sección no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Sección desactivada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al desactivar sección:", error);

    return res.status(500).json({
      success: false,
      message: "Error al desactivar sección.",
    });
  }
}
