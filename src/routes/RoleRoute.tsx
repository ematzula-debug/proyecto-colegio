import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getDefaultPathByRole, isUserRole, type UserRole } from "@/lib/roles";
import { getStoredUser } from "@/services/auth.service";

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isUserRole(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to={getDefaultPathByRole(user.rol)} replace />;
  }

  return children;
}
