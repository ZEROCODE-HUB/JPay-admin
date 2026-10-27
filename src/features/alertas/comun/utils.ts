import { formatDateTime } from "@/shared/format";
import type { TableServerFilters } from "@/shared/ui/data-table";

/** Tamaños de página de los listados de alertas y bloqueos. */
export const PAGE_SIZES = [10, 20, 50];

/** Invierte un mapa código → etiqueta para traducir la etiqueta elegida en el filtro al código. */
export const invertir = <K extends string>(m: Record<K, string>) =>
  new Map(Object.entries(m).map(([k, v]) => [v as string, k as K]));

/** Rango de fechas de una columna del panel de filtros (vacío → undefined). */
export function rangoFiltro(
  dates: TableServerFilters["dates"],
  key: string,
): { from: string | undefined; to: string | undefined } {
  return { from: dates[key]?.from || undefined, to: dates[key]?.to || undefined };
}

/** Nombre del CSV exportado: `<prefijo>-AAAA-MM-DD.csv`. */
export function nombreCsv(prefijo: string, hoy: Date = new Date()): string {
  return `${prefijo}-${hoy.toISOString().slice(0, 10)}.csv`;
}

/** "fecha · responsable" o "—" si el evento no ocurrió. */
export function fechaYResponsable(
  fecha: string | null,
  responsable: string | null,
  sinResponsable = "—",
): string {
  return fecha ? `${formatDateTime(fecha)} · ${responsable ?? sinResponsable}` : "—";
}

/** Total de páginas (mínimo 1). */
export function totalPaginas(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
