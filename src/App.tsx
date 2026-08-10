import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sistema Colegio</CardTitle>
          <CardDescription>
            Proyecto de Aseguramiento de la Calidad del Software
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Entorno frontend configurado con React, Vite, Tailwind CSS y
            shadcn/ui.
          </p>

          <Button className="w-full">Iniciar proyecto</Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
