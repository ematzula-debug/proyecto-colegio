import { apiRequest } from "./api";
import type {
  Section,
  SectionFormData,
  SectionResponse,
  SectionsResponse,
} from "@/types/section";

export async function getSectionsService(): Promise<Section[]> {
  const response = await apiRequest<SectionsResponse>("/secciones");
  return response.data;
}

export async function createSectionService(
  data: SectionFormData,
): Promise<Section> {
  const response = await apiRequest<SectionResponse>("/secciones", {
    method: "POST",
    body: JSON.stringify({
      nombre: data.nombre,
      gradoId: Number(data.gradoId),
    }),
  });

  return response.data;
}

export async function updateSectionService(
  id: number,
  data: SectionFormData,
): Promise<Section> {
  const response = await apiRequest<SectionResponse>(`/secciones/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nombre: data.nombre,
      gradoId: Number(data.gradoId),
    }),
  });

  return response.data;
}

export async function deactivateSectionService(id: number): Promise<Section> {
  const response = await apiRequest<SectionResponse>(
    `/secciones/${id}/desactivar`,
    {
      method: "PATCH",
    },
  );

  return response.data;
}
