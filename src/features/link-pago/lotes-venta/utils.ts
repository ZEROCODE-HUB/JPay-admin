import type { LoteVenta } from "@/lib/api/types";
import { parseDateLocal } from "../lotes/utils";

import { getPais } from "@/shared/pais";
export { PAGE_SIZES } from "../lotes/utils";

/** Nombre visible del comercio del lote de venta. */
export function nombreComercioVenta(l: LoteVenta): string {
  return l.comercio?.nombreComercio ?? l.comercio?.usuario ?? "—";
}

/** Legajo del comercio (cae al id si no vino el embed). */
export function legajoComercioVenta(l: LoteVenta): string {
  return l.comercio?.legajo ?? l.comercioId;
}

/** Clave única de la fila: la vista agrupa por comercio + bandera + fecha. */
export function keyLoteVenta(l: LoteVenta): string {
  return `${l.comercioId}-${l.bandera}-${l.fecha}`;
}

/** Escapa una celda para CSV separado por `;`. */
export function celdaCsv(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADERS_CSV = [
  "Fecha Venta",
  "Comercio",
  "Legajo",
  "Bandera",
  "Ops",
  "Bruto",
  "Impuestos Est.",
  "Comisión Est.",
  "Neto Estimado",
];

/** CSV (sin BOM) de los lotes de venta exportados. */
export function lotesVentaACsv(rows: LoteVenta[]): string {
  const lines = rows.map((r) => [
    parseDateLocal(r.fecha).toLocaleDateString(getPais().locale),
    nombreComercioVenta(r),
    legajoComercioVenta(r),
    r.bandera,
    r.cantidadOperaciones,
    r.importeBruto.toFixed(2),
    r.impuestos.toFixed(2),
    r.comision.toFixed(2),
    r.netoEstimado.toFixed(2),
  ]);
  return [HEADERS_CSV, ...lines].map((row) => row.map(celdaCsv).join(";")).join("\n");
}
