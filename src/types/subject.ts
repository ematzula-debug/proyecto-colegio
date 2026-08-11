export interface Subject {
  id: number;
  codigo: string;
  nombre: string;
  gradoId: number;
  gradoNombre?: string;
  gradoNivel?: string | null;
  estado: string;
}

export interface SubjectFormData {
  codigo: string;
  nombre: string;
  gradoId: string;
}

export interface SubjectsResponse {
  success: boolean;
  message: string;
  data: Subject[];
}

export interface SubjectResponse {
  success: boolean;
  message: string;
  data: Subject;
}
