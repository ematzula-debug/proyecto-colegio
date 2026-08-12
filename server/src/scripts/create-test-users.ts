import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../db/pool";

async function main() {
  const passwordHash = await bcrypt.hash("Test123*", 10);

  const users = [
    {
      usuario: "profesor",
      correo: "profesor@colegio.com",
      rol: "PROFESOR_DIRECTOR",
    },
    {
      usuario: "encargado",
      correo: "encargado@colegio.com",
      rol: "PADRE_ENCARGADO",
    },
    {
      usuario: "alumno",
      correo: "alumno@colegio.com",
      rol: "ALUMNO",
    },
  ];

  for (const user of users) {
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE nombre = $1",
      [user.rol],
    );

    if (roleResult.rowCount === 0) {
      console.log(`No existe el rol ${user.rol}`);
      continue;
    }

    const roleId = roleResult.rows[0].id;

    await pool.query(
      `
      INSERT INTO usuarios
      (nombre_usuario, correo, contrasena, rol_id, estado)
      VALUES ($1, $2, $3, $4, 'ACTIVO')
      ON CONFLICT (nombre_usuario)
      DO UPDATE SET
        correo = EXCLUDED.correo,
        contrasena = EXCLUDED.contrasena,
        rol_id = EXCLUDED.rol_id,
        estado = 'ACTIVO'
      `,
      [user.usuario, user.correo, passwordHash, roleId],
    );

    console.log(`Usuario creado o actualizado: ${user.usuario}`);
  }

  await pool.end();
}

main().catch((error) => {
  console.error("Error al crear usuarios de prueba:", error);
  process.exit(1);
});
