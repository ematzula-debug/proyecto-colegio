import { apiRequest } from "./api";
import type {
  AcademicNote,
  NoteFormData,
  NoteResponse,
  NotesResponse,
} from "@/types/note";

export async function getNotesService(): Promise<AcademicNote[]> {
  const response = await apiRequest<NotesResponse>("/notas");
  return response.data;
}

export async function createNoteService(
  data: NoteFormData,
): Promise<AcademicNote> {
  const response = await apiRequest<NoteResponse>("/notas", {
    method: "POST",
    body: JSON.stringify({
      alumnoId: Number(data.alumnoId),
      asignaturaId: Number(data.asignaturaId),
      profesorId: Number(data.profesorId),
      unidad: data.unidad,
      nota: Number(data.nota),
    }),
  });

  return response.data;
}

export async function updateNoteService(
  id: number,
  data: NoteFormData,
): Promise<AcademicNote> {
  const response = await apiRequest<NoteResponse>(`/notas/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      alumnoId: Number(data.alumnoId),
      asignaturaId: Number(data.asignaturaId),
      profesorId: Number(data.profesorId),
      unidad: data.unidad,
      nota: Number(data.nota),
    }),
  });

  return response.data;
}

export async function annulNoteService(id: number): Promise<AcademicNote> {
  const response = await apiRequest<NoteResponse>(`/notas/${id}/anular`, {
    method: "PATCH",
  });

  return response.data;
}
