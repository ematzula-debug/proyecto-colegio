import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

async function getActiveSchoolYearId() {
  const result = await pool.query(
    "SELECT id FROM ciclos_escolares WHERE estado = 'ACTIVO' ORDER BY anio DESC LIMIT 1",
  );

  if (result.rowCount === 0) {
    throw new Error("No existe un ciclo escolar activo.");
  }

  return result.rows[0].id as number;
}

export async function getEnrollments(
  _req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.alumno_id AS "alumnoId",
        al.codigo AS "alumnoCodigo",
        al.nombres || ' ' || al.apellidos AS "alumnoNombre",
        i.ciclo_escolar_id AS "cicloEscolarId",
        ce.anio AS "cicloEscolarAnio",
        i.grado_id AS "gradoId",
        g.nombre AS "gradoNombre",
        g.nivel AS "gradoNivel",
        i.seccion_id AS "seccionId",
        s.nombre AS "seccionNombre",
        i.fecha_inscripcion AS "fechaInscripcion",
        i.estado
      FROM inscripciones i
      INNER JOIN alumnos al ON al.id = i.alumno_id
      INNER JOIN ciclos_escolares ce ON ce.id = i.ciclo_escolar_id
      INNER JOIN grados g ON g.id = i.grado_id
      INNER JOIN secciones s ON s.id = i.seccion_id
      ORDER BY i.id DESC
    `);

    return res.json({
      success: true,
      message: "Inscripciones obtenidas correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener inscripciones.",
    });
  }
}

export async function createEnrollment(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { alumnoId, gradoId, seccionId } = req.body;

    if (!alumnoId || !gradoId || !seccionId) {
      return res.status(400).json({
        success: false,
        message: "Alumno, grado y sección son obligatorios.",
      });
    }

    const cicloEscolarId = await getActiveSchoolYearId();

    const validation = await pool.query(
      `
      SELECT id
      FROM secciones
      WHERE id = $1
      AND grado_id = $2
      `,
      [Number(seccionId), Number(gradoId)],
    );

    if (validation.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "La sección seleccionada no pertenece al grado indicado.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO inscripciones
      (alumno_id, ciclo_escolar_id, grado_id, seccion_id, estado)
      VALUES ($1, $2, $3, $4, 'INSCRITO')
      RETURNING
        id,
        alumno_id AS "alumnoId",
        ciclo_escolar_id AS "cicloEscolarId",
        grado_id AS "gradoId",
        seccion_id AS "seccionId",
        fecha_inscripcion AS "fechaInscripcion",
        estado
      `,
      [Number(alumnoId), cicloEscolarId, Number(gradoId), Number(seccionId)],
    );

    return res.status(201).json({
      success: true,
      message: "Inscripción registrada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear inscripción:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "El alumno ya está inscrito en el ciclo escolar activo.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "No existe un ciclo escolar activo."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar inscripción.",
    });
  }
}

export async function updateEnrollment(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de inscripción inválido.",
      });
    }

    const { alumnoId, gradoId, seccionId } = req.body;

    if (!alumnoId || !gradoId || !seccionId) {
      return res.status(400).json({
        success: false,
        message: "Alumno, grado y sección son obligatorios.",
      });
    }

    const validation = await pool.query(
      `
      SELECT id
      FROM secciones
      WHERE id = $1
      AND grado_id = $2
      `,
      [Number(seccionId), Number(gradoId)],
    );

    if (validation.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "La sección seleccionada no pertenece al grado indicado.",
      });
    }

    const result = await pool.query(
      `
      UPDATE inscripciones
      SET
        alumno_id = $1,
        grado_id = $2,
        seccion_id = $3
      WHERE id = $4
      RETURNING
        id,
        alumno_id AS "alumnoId",
        ciclo_escolar_id AS "cicloEscolarId",
        grado_id AS "gradoId",
        seccion_id AS "seccionId",
        fecha_inscripcion AS "fechaInscripcion",
        estado
      `,
      [Number(alumnoId), Number(gradoId), Number(seccionId), id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Inscripción no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Inscripción actualizada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar inscripción:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message: "El alumno ya está inscrito en ese ciclo escolar.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar inscripción.",
    });
  }
}

export async function withdrawEnrollment(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de inscripción inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE inscripciones
      SET estado = 'RETIRADO'
      WHERE id = $1
      RETURNING
        id,
        alumno_id AS "alumnoId",
        ciclo_escolar_id AS "cicloEscolarId",
        grado_id AS "gradoId",
        seccion_id AS "seccionId",
        fecha_inscripcion AS "fechaInscripcion",
        estado
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Inscripción no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Inscripción retirada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al retirar inscripción:", error);

    return res.status(500).json({
      success: false,
      message: "Error al retirar inscripción.",
    });
  }
}
