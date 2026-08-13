import type { LoginRequest, LoginResponse, AuthUser } from "@/types/auth";
import { apiRequest } from "./api";

const TOKEN_KEY = "sistema_colegio_token";
const USER_KEY = "sistema_colegio_user";

export async function loginService(credentials: LoginRequest) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      usuario: credentials.usuario.trim(),
      contrasena: credentials.contrasena.trim(),
    }),
  });

  if (response.data) {
    localStorage.setItem("sistema_colegio_token", response.data.token);
    localStorage.setItem(
      "sistema_colegio_user",
      JSON.stringify(response.data.user),
    );
  }

  return response;
}

export function getStoredUser(): AuthUser | null {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  return JSON.parse(user) as AuthUser;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function logoutService() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
