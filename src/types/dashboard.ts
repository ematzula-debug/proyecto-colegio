export interface DashboardSummary {
  alumnos: string;
  profesores: string;
  encargados: string;
  grados: string;
  secciones: string;
  asignaturas: string;
  inscripciones: string;
  notas: string;
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}
