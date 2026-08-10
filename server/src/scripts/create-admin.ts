import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../db/pool";

async function createAdmin() {
  try {
    const nombreUsuario = "admin";
    const correo = "admin@colegio.com";
    const passwordPlano = "Admin123*";

    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const rolResult = await pool.query(
      "SELECT id FROM roles WHERE nombre = $1",
      ["ADMIN"],
    );

    if (rolResult.rowCount === 0) {
      throw new Error("No existe el rol ADMIN en la base de datos.");
    }

    const rolId = rolResult.rows[0].id;

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE correo = $1 OR nombre_usuario = $2",
      [correo, nombreUsuario],
    );

    if ((usuarioExistente.rowCount ?? 0) > 0) {
      console.log("El usuario administrador ya existe.");
      return;
    }

    await pool.query(
      `
      INSERT INTO usuarios 
      (nombre_usuario, correo, contrasena, estado, rol_id)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [nombreUsuario, correo, passwordHash, "ACTIVO", rolId],
    );

    console.log("Usuario administrador creado correctamente.");
    console.log("Usuario:", nombreUsuario);
    console.log("Correo:", correo);
    console.log("Contraseña:", passwordPlano);
  } catch (error) {
    console.error("Error al crear usuario administrador:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();
