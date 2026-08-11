import { apiRequest } from "./api";
import type {
  Guardian,
  GuardianFormData,
  GuardianResponse,
  GuardiansResponse,
} from "@/types/guardian";

export async function getGuardiansService(): Promise<Guardian[]> {
  const response = await apiRequest<GuardiansResponse>("/encargados");
  return response.data;
}

export async function createGuardianService(
  data: GuardianFormData,
): Promise<Guardian> {
  const response = await apiRequest<GuardianResponse>("/encargados", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateGuardianService(
  id: number,
  data: GuardianFormData,
): Promise<Guardian> {
  const response = await apiRequest<GuardianResponse>(`/encargados/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deactivateGuardianService(id: number): Promise<Guardian> {
  const response = await apiRequest<GuardianResponse>(
    `/encargados/${id}/desactivar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
