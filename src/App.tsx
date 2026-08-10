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

          <Route
            path="/profesores"
            element={
              <ModulePage
                title="Profesores"
                description="Administración de profesores y directores del colegio."
              />
            }
          />

          <Route
            path="/encargados"
            element={
              <ModulePage
                title="Padres/Encargados"
                description="Registro y consulta de padres de familia o encargados."
              />
            }
          />

          <Route
            path="/grados"
            element={
              <ModulePage
                title="Grados"
                description="Administración de grados académicos del colegio."
              />
            }
          />

          <Route
            path="/secciones"
            element={
              <ModulePage
                title="Secciones"
                description="Administración de secciones asociadas a cada grado."
              />
            }
          />

          <Route
            path="/asignaturas"
            element={
              <ModulePage
                title="Asignaturas"
                description="Administración de cursos o materias por grado."
              />
            }
          />

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
