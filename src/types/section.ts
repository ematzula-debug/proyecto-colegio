export interface Section {
  id: number;
  nombre: string;
  gradoId: number;
  gradoNombre?: string;
  gradoNivel?: string | null;
  estado: string;
}

export interface SectionFormData {
  nombre: string;
  gradoId: string;
}

export interface SectionsResponse {
  success: boolean;
  message: string;
  data: Section[];
}

export interface SectionResponse {
  success: boolean;
  message: string;
  data: Section;
}
