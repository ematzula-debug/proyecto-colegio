import { apiRequest } from "./api";
import type {
  Grade,
  GradeFormData,
  GradeResponse,
  GradesResponse,
} from "@/types/grade";

export async function getGradesService(): Promise<Grade[]> {
  const response = await apiRequest<GradesResponse>("/grados");
  return response.data;
}

export async function createGradeService(data: GradeFormData): Promise<Grade> {
  const response = await apiRequest<GradeResponse>("/grados", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateGradeService(
  id: number,
  data: GradeFormData,
): Promise<Grade> {
  const response = await apiRequest<GradeResponse>(`/grados/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deactivateGradeService(id: number): Promise<Grade> {
  const response = await apiRequest<GradeResponse>(`/grados/${id}/desactivar`, {
    method: "PATCH",
  });

  return response.data;
}
