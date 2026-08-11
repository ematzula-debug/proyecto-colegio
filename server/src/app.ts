import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import studentsRoutes from "./routes/students.routes";
import teachersRoutes from "./routes/teachers.routes";
import guardiansRoutes from "./routes/guardians.routes";
import gradesRoutes from "./routes/grades.routes";
import sectionsRoutes from "./routes/sections.routes";
import subjectsRoutes from "./routes/subjects.routes";
import teacherAssignmentsRoutes from "./routes/teacherAssignments.routes";
import enrollmentsRoutes from "./routes/enrollments.routes";
import notesRoutes from "./routes/notes.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", studentsRoutes);
app.use("/api", teachersRoutes);
app.use("/api", guardiansRoutes);
app.use("/api", gradesRoutes);
app.use("/api", sectionsRoutes);
app.use("/api", subjectsRoutes);
app.use("/api", teacherAssignmentsRoutes);
app.use("/api", enrollmentsRoutes);
app.use("/api", notesRoutes);
app.use("/api", dashboardRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

export default app;
