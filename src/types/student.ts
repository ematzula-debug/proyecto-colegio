export interface Student {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string | null;
  direccion: string | null;
  telefono: string | null;
  estado: string;
  usuarioId: number | null;
}

export interface StudentFormData {
  codigo: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
}

export interface StudentsResponse {
  success: boolean;
  message: string;
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  message: string;
  data: Student;
}
