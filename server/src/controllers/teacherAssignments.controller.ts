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

export async function getTeacherAssignments(
  _req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const result = await pool.query(`
      SELECT
        ap.id,
        ap.profesor_id AS "profesorId",
        p.nombres || ' ' || p.apellidos AS "profesorNombre",
        ap.asignatura_id AS "asignaturaId",
        a.nombre AS "asignaturaNombre",
        a.codigo AS "asignaturaCodigo",
        ap.grado_id AS "gradoId",
        g.nombre AS "gradoNombre",
        g.nivel AS "gradoNivel",
        ap.seccion_id AS "seccionId",
        s.nombre AS "seccionNombre",
        ap.ciclo_escolar_id AS "cicloEscolarId",
        ce.anio AS "cicloEscolarAnio",
        ap.estado
      FROM asignaciones_profesor ap
      INNER JOIN profesores p ON p.id = ap.profesor_id
      INNER JOIN asignaturas a ON a.id = ap.asignatura_id
      INNER JOIN grados g ON g.id = ap.grado_id
      INNER JOIN secciones s ON s.id = ap.seccion_id
      INNER JOIN ciclos_escolares ce ON ce.id = ap.ciclo_escolar_id
      ORDER BY ap.id DESC
    `);

    return res.json({
      success: true,
      message: "Asignaciones obtenidas correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener asignaciones:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener asignaciones.",
    });
  }
}

export async function createTeacherAssignment(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { profesorId, asignaturaId, gradoId, seccionId } = req.body;

    if (!profesorId || !asignaturaId || !gradoId || !seccionId) {
      return res.status(400).json({
        success: false,
        message: "Profesor, asignatura, grado y sección son obligatorios.",
      });
    }

    const cicloEscolarId = await getActiveSchoolYearId();

    const validation = await pool.query(
      `
      SELECT
        a.grado_id AS "gradoAsignatura",
        s.grado_id AS "gradoSeccion"
      FROM asignaturas a
      CROSS JOIN secciones s
      WHERE a.id = $1
      AND s.id = $2
      `,
      [Number(asignaturaId), Number(seccionId)],
    );

    if (validation.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "La asignatura o sección seleccionada no existe.",
      });
    }

    const { gradoAsignatura, gradoSeccion } = validation.rows[0];

    if (
      Number(gradoAsignatura) !== Number(gradoId) ||
      Number(gradoSeccion) !== Number(gradoId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La asignatura y la sección deben pertenecer al grado seleccionado.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO asignaciones_profesor
      (profesor_id, asignatura_id, grado_id, seccion_id, ciclo_escolar_id, estado)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVO')
      RETURNING
        id,
        profesor_id AS "profesorId",
        asignatura_id AS "asignaturaId",
        grado_id AS "gradoId",
        seccion_id AS "seccionId",
        ciclo_escolar_id AS "cicloEscolarId",
        estado
      `,
      [
        Number(profesorId),
        Number(asignaturaId),
        Number(gradoId),
        Number(seccionId),
        cicloEscolarId,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Asignación registrada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear asignación:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una asignación para ese profesor, asignatura, grado, sección y ciclo escolar.",
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
      message: "Error al registrar asignación.",
    });
  }
}

export async function updateTeacherAssignment(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de asignación inválido.",
      });
    }

    const { profesorId, asignaturaId, gradoId, seccionId } = req.body;

    if (!profesorId || !asignaturaId || !gradoId || !seccionId) {
      return res.status(400).json({
        success: false,
        message: "Profesor, asignatura, grado y sección son obligatorios.",
      });
    }

    const validation = await pool.query(
      `
      SELECT
        a.grado_id AS "gradoAsignatura",
        s.grado_id AS "gradoSeccion"
      FROM asignaturas a
      CROSS JOIN secciones s
      WHERE a.id = $1
      AND s.id = $2
      `,
      [Number(asignaturaId), Number(seccionId)],
    );

    if (validation.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "La asignatura o sección seleccionada no existe.",
      });
    }

    const { gradoAsignatura, gradoSeccion } = validation.rows[0];

    if (
      Number(gradoAsignatura) !== Number(gradoId) ||
      Number(gradoSeccion) !== Number(gradoId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La asignatura y la sección deben pertenecer al grado seleccionado.",
      });
    }

    const result = await pool.query(
      `
      UPDATE asignaciones_profesor
      SET
        profesor_id = $1,
        asignatura_id = $2,
        grado_id = $3,
        seccion_id = $4
      WHERE id = $5
      RETURNING
        id,
        profesor_id AS "profesorId",
        asignatura_id AS "asignaturaId",
        grado_id AS "gradoId",
        seccion_id AS "seccionId",
        ciclo_escolar_id AS "cicloEscolarId",
        estado
      `,
      [
        Number(profesorId),
        Number(asignaturaId),
        Number(gradoId),
        Number(seccionId),
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Asignación actualizada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar asignación:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una asignación para ese profesor, asignatura, grado, sección y ciclo escolar.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar asignación.",
    });
  }
}

export async function deactivateTeacherAssignment(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de asignación inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE asignaciones_profesor
      SET estado = 'INACTIVO'
      WHERE id = $1
      RETURNING
        id,
        profesor_id AS "profesorId",
        asignatura_id AS "asignaturaId",
        grado_id AS "gradoId",
        seccion_id AS "seccionId",
        ciclo_escolar_id AS "cicloEscolarId",
        estado
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Asignación desactivada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al desactivar asignación:", error);

    return res.status(500).json({
      success: false,
      message: "Error al desactivar asignación.",
    });
  }
}
