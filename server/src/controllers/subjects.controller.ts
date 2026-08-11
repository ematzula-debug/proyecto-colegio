import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getSubjects(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.codigo,
        a.nombre,
        a.grado_id AS "gradoId",
        g.nombre AS "gradoNombre",
        g.nivel AS "gradoNivel",
        a.estado
      FROM asignaturas a
      INNER JOIN grados g ON g.id = a.grado_id
      ORDER BY a.id DESC
    `);

    return res.json({
      success: true,
      message: "Asignaturas obtenidas correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener asignaturas:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener asignaturas.",
    });
  }
}

export async function createSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const { codigo, nombre, gradoId } = req.body;

    if (!codigo || !nombre || !gradoId) {
      return res.status(400).json({
        success: false,
        message: "Código, nombre y grado son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO asignaturas
      (codigo, nombre, grado_id, estado)
      VALUES ($1, $2, $3, 'ACTIVO')
      RETURNING
        id,
        codigo,
        nombre,
        grado_id AS "gradoId",
        estado
      `,
      [codigo.trim().toUpperCase(), nombre.trim(), Number(gradoId)],
    );

    return res.status(201).json({
      success: true,
      message: "Asignatura registrada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear asignatura:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una asignatura con ese código.",
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
      message: "Error al registrar asignatura.",
    });
  }
}

export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de asignatura inválido.",
      });
    }

    const { codigo, nombre, gradoId } = req.body;

    if (!codigo || !nombre || !gradoId) {
      return res.status(400).json({
        success: false,
        message: "Código, nombre y grado son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      UPDATE asignaturas
      SET
        codigo = $1,
        nombre = $2,
        grado_id = $3
      WHERE id = $4
      RETURNING
        id,
        codigo,
        nombre,
        grado_id AS "gradoId",
        estado
      `,
      [codigo.trim().toUpperCase(), nombre.trim(), Number(gradoId), id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Asignatura no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Asignatura actualizada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar asignatura:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una asignatura con ese código.",
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
      message: "Error al actualizar asignatura.",
    });
  }
}

export async function deactivateSubject(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de asignatura inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE asignaturas
      SET estado = 'INACTIVO'
      WHERE id = $1
      RETURNING
        id,
        codigo,
        nombre,
        grado_id AS "gradoId",
        estado
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Asignatura no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Asignatura desactivada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al desactivar asignatura:", error);

    return res.status(500).json({
      success: false,
      message: "Error al desactivar asignatura.",
    });
  }
}
