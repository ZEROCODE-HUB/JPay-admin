import { formatDate } from "@/shared/format";
import type { CvuRow } from "@/lib/api/subcuentas";

export const PAGE_SIZES = [10, 20, 50];

/** Fila de la tabla: la subcuenta más columnas derivadas (prefijo `_`). */
export type CvuTableRow = CvuRow & {
  _legajo: string;
  _cuit: string;
  _correo: string | null | undefined;
  _nombre: string;
  _apellido: string;
  _tipo: CvuRow["tipo"];
  _cvu: string | null;
  _cbk: string;
  _alias: string;
  _estado: string;
  _fechaAlta: string;
  _fechaAltaRaw: CvuRow["createdAt"];
};

/** Alias informativo: últimos 6 dígitos del CVU. */
export function aliasDeCvu(cbu: string | null | undefined): string {
  return cbu ? cbu.slice(-6) : "—";
}

/** Mapea una subcuenta a la fila que muestra la tabla. */
export function toCvuTableRow(r: CvuRow): CvuTableRow {
  return {
    ...r,
    _legajo: r.legajo,
    _cuit: r.cliente?.cuit ?? "",
    _correo: r.cliente?.correo ?? r.email,
    _nombre: r.nombre,
    _apellido: r.apellido,
    _tipo: r.tipo,
    _cvu: r.cbu ?? null,
    _cbk: r.cbu ? `CBK-${r.cbu.slice(-12)}` : "—",
    _alias: aliasDeCvu(r.cbu),
    _estado: r.estado,
    _fechaAlta: r.createdAt ? formatDate(r.createdAt) : "—",
    _fechaAltaRaw: r.createdAt,
  };
}
