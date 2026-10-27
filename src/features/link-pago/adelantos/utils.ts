import type { ComercioResumen } from "@/lib/api/adelantos";
import type { Adelanto, EstadoAdelanto } from "@/lib/api/types";
import { formatDate, formatPercent } from "@/shared/format";

// Lo que la grilla necesita del comercio lo armamos via join para no
// mostrar el UUID crudo en la columna "Comercio".
export type AdelantoUI = {
  id: string;
  /** UUID real del adelanto (para llamar a las RPCs). */
  fullId: string;
  /** UUID del comercio (para el filtro del deep link). */
  comercioId: string;
  /** Texto a mostrar: nombre del comercio o, si no se pudo resolver, el UUID. */
  comercio: string;
  legajo: string;
  fechaSolicitud: string;
  importeSolicitado: number;
  plazoSolicitado: string;
  plazoContractual: string;
  comision: string;
  tasaEfectiva?: string;
  estado: EstadoAdelanto;
  notas?: string | null;
  tasaInteresPct?: number | null;
  motivo?: string | null;
  fechaAcreditacion?: string | null;
  montoPorAcreditar?: number | null;
  fechaResolucion?: string | null;
};

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

/** TEM (mensual) → TNA simple. */
export function tnaDesdeTem(temPct: number): number {
  return temPct * 12;
}

/** Fila de la API + resumen del comercio → fila de la grilla. */
export function toAdelantoUI(a: Adelanto, c: ComercioResumen | undefined): AdelantoUI {
  return {
    id: shortId(a.id),
    fullId: a.id,
    comercioId: a.comercioId,
    comercio: c?.nombre ?? a.comercioId,
    legajo: c?.legajo ?? "—",
    fechaSolicitud: formatDate(a.fechaSolicitud),
    importeSolicitado: a.montoSolicitado,
    plazoSolicitado: `${a.plazoAdelantadoDias} días`,
    plazoContractual: `${a.plazoOriginalDias} días`,
    comision: a.tasaInteresPct != null ? `${a.tasaInteresPct}%` : "Pendiente",
    tasaEfectiva:
      a.tasaInteresPct != null
        ? `TNA ${formatPercent(tnaDesdeTem(a.tasaInteresPct), 0)}`
        : undefined,
    estado: a.estado,
    notas: a.motivo,
    tasaInteresPct: a.tasaInteresPct,
    motivo: a.motivo,
    fechaAcreditacion: a.fechaAcreditacion,
    montoPorAcreditar: a.montoPorAcreditar,
    fechaResolucion: a.fechaResolucion,
  };
}

/** Texto del input de tasa → número, o null si está vacío / no es número. */
export function parseTasa(valor: string): number | null {
  if (valor.trim() === "") return null;
  const v = parseFloat(valor.replace(",", "."));
  return Number.isFinite(v) ? v : null;
}

/** ¿Se acepta este texto mientras el operador tipea la tasa? */
export function esTasaTipeable(valor: string): boolean {
  return valor === "" || /^[0-9]*[.,]?[0-9]*$/.test(valor);
}

/** Error a mostrar al aprobar con esa tasa, o null si es válida. */
export function validarTasa(tasa: number | null): string | null {
  if (tasa == null) return "Cargá la tasa de interés (0-100%)";
  if (tasa < 0 || tasa > 100) return "Tasa fuera de rango (0-100%)";
  return null;
}

/** Interés = importe × TEM / 100, redondeado a centavos. */
export function interesAdelanto(importe: number, tasaPct: number | null | undefined): number {
  if (tasaPct == null) return 0;
  return Math.round(((importe * tasaPct) / 100) * 100) / 100;
}

/** Neto a depositar al comercio (nunca negativo). */
export function netoAdelanto(importe: number, interes: number): number {
  return Math.max(0, importe - interes);
}

/** El pool no alcanza para acreditar (solo aplica a adelantos Aprobados). */
export function poolInsuficiente(
  estado: EstadoAdelanto,
  cupoDisponible: number | undefined,
  importe: number,
): boolean {
  return estado === "Aprobado" && (cupoDisponible ?? 0) < importe;
}

export type TotalEstado = { cantidad: number; monto: number };

/** Cantidad y monto solicitado por estado (cards KPI). */
export function totalesPorEstado(
  adelantos: Pick<Adelanto, "estado" | "montoSolicitado">[],
): Record<EstadoAdelanto, TotalEstado> {
  const m: Record<EstadoAdelanto, TotalEstado> = {
    Pendiente: { cantidad: 0, monto: 0 },
    Aprobado: { cantidad: 0, monto: 0 },
    Rechazado: { cantidad: 0, monto: 0 },
    Acreditado: { cantidad: 0, monto: 0 },
    Cancelado: { cantidad: 0, monto: 0 },
  };
  for (const a of adelantos) {
    const estado = a.estado as EstadoAdelanto;
    m[estado].cantidad += 1;
    m[estado].monto += Number(a.montoSolicitado ?? 0);
  }
  return m;
}

/** Cantidad de páginas para un total (mínimo 1). */
export function totalPaginas(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
}

/**
 * Search params al cerrar el modal abierto por enlace directo: se quita
 * `adelanto` (si no, el modal se vuelve a abrir) y se conserva el resto.
 */
export function searchSinAdelanto<T extends { adelanto?: string }>(search: T): Omit<T, "adelanto"> {
  const resto: Partial<T> = { ...search };
  delete resto.adelanto;
  return resto as Omit<T, "adelanto">;
}
