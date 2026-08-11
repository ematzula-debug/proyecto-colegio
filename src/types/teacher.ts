export interface Teacher {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  estado: string;
  usuarioId: number | null;
}

export interface TeacherFormData {
  codigo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
}

export interface TeachersResponse {
  success: boolean;
  message: string;
  data: Teacher[];
}

export interface TeacherResponse {
  success: boolean;
  message: string;
  data: Teacher;
}
