export interface Grade {
  id: number;
  nombre: string;
  nivel: string | null;
  estado: string;
}

export interface GradeFormData {
  nombre: string;
  nivel: string;
}

export interface GradesResponse {
  success: boolean;
  message: string;
  data: Grade[];
}

export interface GradeResponse {
  success: boolean;
  message: string;
  data: Grade;
}
