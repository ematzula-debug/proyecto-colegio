import type { LoginRequest, LoginResponse, AuthUser } from "@/types/auth";
import { apiRequest } from "./api";

const TOKEN_KEY = "sistema_colegio_token";
const USER_KEY = "sistema_colegio_user";

export async function loginService(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.success && response.data) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
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
