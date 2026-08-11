export interface AcademicNote {
  id: number;
  alumnoId: number;
  alumnoCodigo: string;
  alumnoNombre: string;
  asignaturaId: number;
  asignaturaCodigo: string;
  asignaturaNombre: string;
  profesorId: number;
  profesorNombre: string;
  cicloEscolarId: number;
  cicloEscolarAnio: number;
  unidad: string;
  nota: string;
  fechaRegistro: string;
  estado: string;
}

export interface NoteFormData {
  alumnoId: string;
  asignacionId: string;
  asignaturaId: string;
  profesorId: string;
  unidad: string;
  nota: string;
}

export interface NotesResponse {
  success: boolean;
  message: string;
  data: AcademicNote[];
}

export interface NoteResponse {
  success: boolean;
  message: string;
  data: AcademicNote;
}
