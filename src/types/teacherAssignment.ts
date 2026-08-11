export interface TeacherAssignment {
  id: number;
  profesorId: number;
  profesorNombre: string;
  asignaturaId: number;
  asignaturaNombre: string;
  asignaturaCodigo: string;
  gradoId: number;
  gradoNombre: string;
  gradoNivel: string | null | undefined;
  seccionId: number;
  seccionNombre: string;
  cicloEscolarId: number;
  cicloEscolarAnio: number;
  estado: string;
}

export interface TeacherAssignmentFormData {
  profesorId: string;
  asignaturaId: string;
  gradoId: string;
  seccionId: string;
}

export interface TeacherAssignmentsResponse {
  success: boolean;
  message: string;
  data: TeacherAssignment[];
}

export interface TeacherAssignmentResponse {
  success: boolean;
  message: string;
  data: TeacherAssignment;
}
