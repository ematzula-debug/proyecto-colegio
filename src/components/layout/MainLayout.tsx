import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
  NotebookPen,
  School,
  Users,
  UserRoundCheck,
  LinkIcon,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/types/auth";

interface MainLayoutProps {
  user: AuthUser;
  onLogout: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Alumnos",
    path: "/alumnos",
    icon: GraduationCap,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Profesores",
    path: "/profesores",
    icon: UserRoundCheck,
    roles: ["ADMIN"],
  },
  {
    title: "Padres/Encargados",
    path: "/encargados",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Grados",
    path: "/grados",
    icon: School,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Secciones",
    path: "/secciones",
    icon: ClipboardList,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Asignaturas",
    path: "/asignaturas",
    icon: BookOpen,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Asignaciones",
    path: "/asignaciones",
    icon: LinkIcon,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Inscripciones",
    path: "/inscripciones",
    icon: NotebookPen,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Notas",
    path: "/notas",
    icon: FileText,
    roles: ["ADMIN", "PROFESOR_DIRECTOR", "PADRE_ENCARGADO", "ALUMNO"],
  },
];

export function MainLayout({ user, onLogout }: MainLayoutProps) {
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.rol),
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-72 border-r bg-white md:flex md:flex-col">
        <div className="border-b p-6">
          <h1 className="text-xl font-bold">Sistema Colegio</h1>
          <p className="text-sm text-muted-foreground">Gestión académica</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="mb-4 rounded-md bg-slate-100 p-3">
            <p className="text-sm font-semibold">{user.nombreUsuario}</p>
            <p className="text-xs text-muted-foreground">{user.correo}</p>
            <p className="text-xs text-muted-foreground">Rol: {user.rol}</p>
          </div>

          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b bg-white p-4 md:hidden">
          <div>
            <h1 className="text-lg font-bold">Sistema Colegio</h1>
            <p className="text-sm text-muted-foreground">
              Usuario: {user.nombreUsuario}
            </p>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
