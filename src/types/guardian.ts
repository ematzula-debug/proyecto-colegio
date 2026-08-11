export interface Guardian {
  id: number;
  dpi: string | null;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  direccion: string | null;
  correo: string | null;
  estado: string;
  usuarioId: number | null;
}

export interface GuardianFormData {
  dpi: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  correo: string;
}

export interface GuardiansResponse {
  success: boolean;
  message: string;
  data: Guardian[];
}

export interface GuardianResponse {
  success: boolean;
  message: string;
  data: Guardian;
}
