import { apiRequest } from "./api";
import type {
  Enrollment,
  EnrollmentFormData,
  EnrollmentResponse,
  EnrollmentsResponse,
} from "@/types/enrollment";

export async function getEnrollmentsService(): Promise<Enrollment[]> {
  const response = await apiRequest<EnrollmentsResponse>("/inscripciones");
  return response.data;
}

export async function createEnrollmentService(
  data: EnrollmentFormData,
): Promise<Enrollment> {
  const response = await apiRequest<EnrollmentResponse>("/inscripciones", {
    method: "POST",
    body: JSON.stringify({
      alumnoId: Number(data.alumnoId),
      gradoId: Number(data.gradoId),
      seccionId: Number(data.seccionId),
    }),
  });

  return response.data;
}

export async function updateEnrollmentService(
  id: number,
  data: EnrollmentFormData,
): Promise<Enrollment> {
  const response = await apiRequest<EnrollmentResponse>(
    `/inscripciones/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        alumnoId: Number(data.alumnoId),
        gradoId: Number(data.gradoId),
        seccionId: Number(data.seccionId),
      }),
    },
  );

  return response.data;
}

export async function withdrawEnrollmentService(
  id: number,
): Promise<Enrollment> {
  const response = await apiRequest<EnrollmentResponse>(
    `/inscripciones/${id}/retirar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
