import { Router } from "express";
import pool from "../db/pool";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Backend del Sistema Colegio funcionando correctamente",
  });
});

router.get("/db-test", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS fecha_servidor, current_database() AS base_datos",
    );

    res.json({
      success: true,
      message: "Conexión a PostgreSQL exitosa",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error);

    res.status(500).json({
      success: false,
      message: "Error al conectar con PostgreSQL",
    });
  }
});

export default router;
