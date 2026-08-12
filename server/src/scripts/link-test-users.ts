import "dotenv/config";
import pool from "../db/pool";

async function main() {
  const alumnoUserResult = await pool.query(
    "SELECT id FROM usuarios WHERE nombre_usuario = 'alumno'",
  );

  const encargadoUserResult = await pool.query(
    "SELECT id FROM usuarios WHERE nombre_usuario = 'encargado'",
  );

  if (alumnoUserResult.rowCount === 0) {
    throw new Error("No existe el usuario de prueba: alumno");
  }

  if (encargadoUserResult.rowCount === 0) {
    throw new Error("No existe el usuario de prueba: encargado");
  }

  const alumnoUserId = alumnoUserResult.rows[0].id;
  const encargadoUserId = encargadoUserResult.rows[0].id;

  const alumnoResult = await pool.query(`
    SELECT id, codigo, nombres, apellidos
    FROM alumnos
    ORDER BY id ASC
    LIMIT 1
  `);

  const encargadoResult = await pool.query(`
    SELECT id, nombres, apellidos
    FROM encargados
    ORDER BY id ASC
    LIMIT 1
  `);

  if (alumnoResult.rowCount === 0) {
    throw new Error("No hay alumnos registrados para vincular.");
  }

  if (encargadoResult.rowCount === 0) {
    throw new Error("No hay encargados registrados para vincular.");
  }

  const alumno = alumnoResult.rows[0];
  const encargado = encargadoResult.rows[0];

  await pool.query(
    `
    UPDATE alumnos
    SET usuario_id = $1
    WHERE id = $2
    `,
    [alumnoUserId, alumno.id],
  );

  await pool.query(
    `
    UPDATE encargados
    SET usuario_id = $1
    WHERE id = $2
    `,
    [encargadoUserId, encargado.id],
  );

  await pool.query(
    `
    INSERT INTO alumno_encargado
    (alumno_id, encargado_id, parentesco)
    VALUES ($1, $2, 'Encargado')
    ON CONFLICT DO NOTHING
    `,
    [alumno.id, encargado.id],
  );

  console.log("Usuario alumno vinculado con:");
  console.log(`${alumno.codigo} - ${alumno.nombres} ${alumno.apellidos}`);

  console.log("Usuario encargado vinculado con:");
  console.log(`${encargado.nombres} ${encargado.apellidos}`);

  await pool.end();
}

main().catch((error) => {
  console.error("Error al vincular usuarios de prueba:", error);
  process.exit(1);
});
