export interface Enrollment {
  id: number;
  alumnoId: number;
  alumnoCodigo: string;
  alumnoNombre: string;
  cicloEscolarId: number;
  cicloEscolarAnio: number;
  gradoId: number;
  gradoNombre: string;
  gradoNivel: string | null;
  seccionId: number;
  seccionNombre: string;
  fechaInscripcion: string;
  estado: string;
}

export interface EnrollmentFormData {
  alumnoId: string;
  gradoId: string;
  seccionId: string;
}

export interface EnrollmentsResponse {
  success: boolean;
  message: string;
  data: Enrollment[];
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: Enrollment;
}
