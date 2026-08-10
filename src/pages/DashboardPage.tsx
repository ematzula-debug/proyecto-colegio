import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  NotebookPen,
  School,
  Users,
  UserRoundCheck,
} from "lucide-react";

const summaryCards = [
  {
    title: "Alumnos",
    value: "0",
    description: "Alumnos registrados",
    icon: GraduationCap,
  },
  {
    title: "Profesores",
    value: "0",
    description: "Docentes registrados",
    icon: UserRoundCheck,
  },
  {
    title: "Encargados",
    value: "0",
    description: "Padres o encargados",
    icon: Users,
  },
  {
    title: "Grados",
    value: "0",
    description: "Grados académicos",
    icon: School,
  },
  {
    title: "Asignaturas",
    value: "0",
    description: "Cursos registrados",
    icon: BookOpen,
  },
  {
    title: "Inscripciones",
    value: "0",
    description: "Alumnos inscritos",
    icon: NotebookPen,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general del Sistema Web de Gestión Académica para Colegio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                <div className="text-2xl font-bold">{card.value}</div>
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
            Funcionalidades iniciales configuradas correctamente.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              Frontend configurado con React, Vite, Tailwind CSS y shadcn/ui.
            </li>
            <li>Backend configurado con Node.js, Express y PostgreSQL.</li>
            <li>Login conectado al backend.</li>
            <li>Rutas protegidas y layout principal en desarrollo.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
