import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthUser } from "@/types/auth";

interface HomePageProps {
  user: AuthUser;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Sistema Colegio</CardTitle>
            <CardDescription>
              Proyecto de Aseguramiento de la Calidad del Software
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-md border bg-white p-4">
              <p className="text-sm text-muted-foreground">
                Usuario autenticado:
              </p>
              <p className="font-semibold">{user.nombreUsuario}</p>
              <p className="text-sm">{user.correo}</p>
              <p className="text-sm">Rol: {user.rol}</p>
            </div>

            <Button variant="outline" onClick={onLogout}>
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
