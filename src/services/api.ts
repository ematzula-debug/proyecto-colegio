const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "sistema_colegio_token";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}
