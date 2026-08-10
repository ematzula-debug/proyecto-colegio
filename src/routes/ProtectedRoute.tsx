import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { AuthUser } from "@/types/auth";

interface ProtectedRouteProps {
  user: AuthUser | null;
  children: ReactNode;
}

export function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
