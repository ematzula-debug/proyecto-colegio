import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ModulePage } from "@/pages/ModulePage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { getStoredUser, logoutService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";
import { StudentsPage } from "@/pages/StudentsPage";
import { TeachersPage } from "@/pages/TeachersPage";
import { GuardiansPage } from "@/pages/GuardiansPage";
import { GradesPage } from "@/pages/GradesPage";
import { SectionsPage } from "@/pages/SectionsPage";
import { SubjectsPage } from "@/pages/SubjectsPage";
import { TeacherAssignmentsPage } from "@/pages/TeacherAssignmentsPage";

function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());

  function handleLoginSuccess(userData: AuthUser) {
    setUser(userData);
  }

  function handleLogout() {
    logoutService();
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          element={
            <ProtectedRoute user={user}>
              <MainLayout user={user as AuthUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/alumnos" element={<StudentsPage />} />

          <Route path="/profesores" element={<TeachersPage />} />

          <Route path="/encargados" element={<GuardiansPage />} />

          <Route path="/grados" element={<GradesPage />} />

          <Route path="/secciones" element={<SectionsPage />} />

          <Route path="/asignaturas" element={<SubjectsPage />} />

          <Route path="/asignaciones" element={<TeacherAssignmentsPage />} />

          <Route
            path="/inscripciones"
            element={
              <ModulePage
                title="Inscripciones"
                description="Control de inscripción de alumnos por ciclo escolar."
              />
            }
          />

          <Route
            path="/notas"
            element={
              <ModulePage
                title="Notas"
                description="Registro y consulta de calificaciones de los alumnos."
              />
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
