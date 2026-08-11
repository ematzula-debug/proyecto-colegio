import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  NotebookPen,
  School,
  Users,
  UserRoundCheck,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardSummaryService } from "@/services/dashboard.service";
import type { DashboardSummary } from "@/types/dashboard";

const initialSummary: DashboardSummary = {
  alumnos: "0",
  profesores: "0",
  encargados: "0",
  grados: "0",
  secciones: "0",
  asignaturas: "0",
  inscripciones: "0",
  notas: "0",
};

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const data = await getDashboardSummaryService();

        if (active) {
          setSummary(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar resumen del dashboard.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  const summaryCards = [
    {
      title: "Alumnos",
      value: summary.alumnos,
      description: "Alumnos activos registrados",
      icon: GraduationCap,
    },
    {
      title: "Profesores",
      value: summary.profesores,
      description: "Docentes activos registrados",
      icon: UserRoundCheck,
    },
    {
      title: "Encargados",
      value: summary.encargados,
      description: "Padres o encargados activos",
      icon: Users,
    },
    {
      title: "Grados",
      value: summary.grados,
      description: "Grados académicos activos",
      icon: School,
    },
    {
      title: "Secciones",
      value: summary.secciones,
      description: "Secciones activas registradas",
      icon: ClipboardList,
    },
    {
      title: "Asignaturas",
      value: summary.asignaturas,
      description: "Cursos activos registrados",
      icon: BookOpen,
    },
    {
      title: "Inscripciones",
      value: summary.inscripciones,
      description: "Alumnos inscritos actualmente",
      icon: NotebookPen,
    },
    {
      title: "Notas",
      value: summary.notas,
      description: "Notas activas registradas",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general del Sistema Web de Gestión Académica para Colegio.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del proyecto</CardTitle>
          <CardDescription>
            Funcionalidades desarrolladas en el sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              Frontend configurado con React, Vite, Tailwind CSS y shadcn/ui.
            </li>
            <li>Backend configurado con Node.js, Express y PostgreSQL.</li>
            <li>Autenticación mediante login y token JWT.</li>
            <li>Rutas protegidas en frontend y backend.</li>
            <li>
              CRUD de alumnos, profesores, encargados, grados, secciones y
              asignaturas.
            </li>
            <li>Asignación de profesores por asignatura, grado y sección.</li>
            <li>Control de inscripciones de alumnos.</li>
            <li>Registro, edición y anulación de notas.</li>
            <li>Dashboard conectado a PostgreSQL.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
