import { apiRequest } from "./api";
import type {
  Student,
  StudentFormData,
  StudentResponse,
  StudentsResponse,
} from "@/types/student.ts";

export async function getStudentsService(): Promise<Student[]> {
  const response = await apiRequest<StudentsResponse>("/alumnos");
  return response.data;
}

export async function createStudentService(
  data: StudentFormData,
): Promise<Student> {
  const response = await apiRequest<StudentResponse>("/alumnos", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateStudentService(
  id: number,
  data: StudentFormData,
): Promise<Student> {
  const response = await apiRequest<StudentResponse>(`/alumnos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deactivateStudentService(id: number): Promise<Student> {
  const response = await apiRequest<StudentResponse>(
    `/alumnos/${id}/desactivar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
