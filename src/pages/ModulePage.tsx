import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ModulePageProps {
  title: string;
  description: string;
}

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en construcción</CardTitle>
          <CardDescription>
            Esta pantalla será desarrollada en las siguientes fases del
            proyecto.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            En este módulo se agregarán formularios, tablas, validaciones,
            conexión con PostgreSQL, pruebas funcionales y evidencias de
            calidad.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
