import { formatDate } from "@/shared/format";
import type { SubcuentaConCliente } from "@/lib/api/subcuentas";

export const PAGE_SIZES = [10, 20, 50];

/** Fila de la tabla: la subcuenta más columnas derivadas (prefijo `_`). */
export type ClabeTableRow = SubcuentaConCliente & {
  _legajo: string;
  _rfc: string;
  _correo: string | null | undefined;
  _nombre: string;
  _apellido: string;
  _tipo: SubcuentaConCliente["tipo"];
  /** La CLABE (columna `cbu` de la base). */
  _clabe: string | null;
  _estado: string;
  _fechaAlta: string;
  _fechaAltaRaw: SubcuentaConCliente["createdAt"];
};

/** Mapea una subcuenta a la fila que muestra la tabla. */
export function toClabeTableRow(r: SubcuentaConCliente): ClabeTableRow {
  return {
    ...r,
    _legajo: r.legajo,
    _rfc: r.cliente?.taxId ?? "",
    _correo: r.cliente?.correo ?? r.email,
    _nombre: r.nombre,
    _apellido: r.apellido,
    _tipo: r.tipo,
    _clabe: r.cbu ?? null,
    _estado: r.estado,
    _fechaAlta: r.createdAt ? formatDate(r.createdAt) : "—",
    _fechaAltaRaw: r.createdAt,
  };
}
