import { apiRequest } from "./api";
import type {
  TeacherAssignment,
  TeacherAssignmentFormData,
  TeacherAssignmentResponse,
  TeacherAssignmentsResponse,
} from "@/types/teacherAssignment";

export async function getTeacherAssignmentsService(): Promise<
  TeacherAssignment[]
> {
  const response = await apiRequest<TeacherAssignmentsResponse>(
    "/asignaciones-profesor",
  );

  return response.data;
}

export async function createTeacherAssignmentService(
  data: TeacherAssignmentFormData,
): Promise<TeacherAssignment> {
  const response = await apiRequest<TeacherAssignmentResponse>(
    "/asignaciones-profesor",
    {
      method: "POST",
      body: JSON.stringify({
        profesorId: Number(data.profesorId),
        asignaturaId: Number(data.asignaturaId),
        gradoId: Number(data.gradoId),
        seccionId: Number(data.seccionId),
      }),
    },
  );

  return response.data;
}

export async function updateTeacherAssignmentService(
  id: number,
  data: TeacherAssignmentFormData,
): Promise<TeacherAssignment> {
  const response = await apiRequest<TeacherAssignmentResponse>(
    `/asignaciones-profesor/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        profesorId: Number(data.profesorId),
        asignaturaId: Number(data.asignaturaId),
        gradoId: Number(data.gradoId),
        seccionId: Number(data.seccionId),
      }),
    },
  );

  return response.data;
}

export async function deactivateTeacherAssignmentService(
  id: number,
): Promise<TeacherAssignment> {
  const response = await apiRequest<TeacherAssignmentResponse>(
    `/asignaciones-profesor/${id}/desactivar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
