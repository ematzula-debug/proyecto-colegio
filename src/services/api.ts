const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      (data as { message?: string }).message ??
        "Error al realizar la solicitud.",
    );
  }

  return data;
}
