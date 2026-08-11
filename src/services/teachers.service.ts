import { apiRequest } from "./api";
import type {
  Teacher,
  TeacherFormData,
  TeacherResponse,
  TeachersResponse,
} from "@/types/teacher";

export async function getTeachersService(): Promise<Teacher[]> {
  const response = await apiRequest<TeachersResponse>("/profesores");
  return response.data;
}

export async function createTeacherService(
  data: TeacherFormData,
): Promise<Teacher> {
  const response = await apiRequest<TeacherResponse>("/profesores", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateTeacherService(
  id: number,
  data: TeacherFormData,
): Promise<Teacher> {
  const response = await apiRequest<TeacherResponse>(`/profesores/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deactivateTeacherService(id: number): Promise<Teacher> {
  const response = await apiRequest<TeacherResponse>(
    `/profesores/${id}/desactivar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
