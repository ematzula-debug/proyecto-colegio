import { apiRequest } from "./api";
import type {
  Subject,
  SubjectFormData,
  SubjectResponse,
  SubjectsResponse,
} from "@/types/subject";

export async function getSubjectsService(): Promise<Subject[]> {
  const response = await apiRequest<SubjectsResponse>("/asignaturas");
  return response.data;
}

export async function createSubjectService(
  data: SubjectFormData,
): Promise<Subject> {
  const response = await apiRequest<SubjectResponse>("/asignaturas", {
    method: "POST",
    body: JSON.stringify({
      codigo: data.codigo,
      nombre: data.nombre,
      gradoId: Number(data.gradoId),
    }),
  });

  return response.data;
}

export async function updateSubjectService(
  id: number,
  data: SubjectFormData,
): Promise<Subject> {
  const response = await apiRequest<SubjectResponse>(`/asignaturas/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      codigo: data.codigo,
      nombre: data.nombre,
      gradoId: Number(data.gradoId),
    }),
  });

  return response.data;
}

export async function deactivateSubjectService(id: number): Promise<Subject> {
  const response = await apiRequest<SubjectResponse>(
    `/asignaturas/${id}/desactivar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
