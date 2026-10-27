export type ReporteImpuesto = {
  id: number;
  periodo: string;
  tramo: string;
  fechaCreacion: string;
  presentado: boolean;
  pagado: boolean;
  totalMovimientos: number;
  totalMontos: number;
  totalRetenciones: number;
};

// Vacío a propósito: eran datos de ejemplo. Pendiente de conectar a la base.
export const reportesIniciales: ReporteImpuesto[] = [];
