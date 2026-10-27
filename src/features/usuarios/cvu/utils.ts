import { formatDate } from "@/shared/format";
import type { ClienteParaCvu } from "@/lib/api/cvu";
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

/** Alias a mostrar: el guardado en el cliente o, si no hay, el derivado del CVU. */
export function aliasDeFila(r: Pick<CvuRow, "cbu" | "cliente">): string {
  return r.cliente?.alias?.trim() || aliasDeCvu(r.cbu);
}

/**
 * Valida el alias editado (formato BCRA: 6 a 20 caracteres, letras, números, punto o guion).
 * Devuelve el mensaje de error o null si es válido.
 */
export function validarAlias(alias: string): string | null {
  const a = alias.trim();
  if (a.length < 6 || a.length > 20) return "El alias debe tener entre 6 y 20 caracteres";
  if (!/^[A-Za-z0-9.-]+$/.test(a)) return "El alias solo admite letras, números, punto y guion";
  return null;
}

/**
 * Titular para asignar un CVU a una subcuenta existente. El `id` es el del cliente
 * (no el de la subcuenta). Devuelve null si falta el cliente, el legajo o el CUIT.
 */
export function clienteParaCvu(row: CvuRow): ClienteParaCvu | null {
  const cuit = (row.cliente?.cuit ?? "").replace(/\D/g, "");
  if (!row.cliente?.id || !row.legajo || !cuit) return null;
  return {
    id: row.cliente.id,
    legajo: row.legajo,
    correo: row.cliente.correo ?? row.email ?? "",
    cuit,
    nombre: `${row.nombre} ${row.apellido}`.trim() || row.nombre,
    tipoPersona: row.cliente.tipoPersona === "juridica" ? "juridica" : "fisica",
  };
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
    _alias: aliasDeFila(r),
    _estado: r.estado,
    _fechaAlta: r.createdAt ? formatDate(r.createdAt) : "—",
    _fechaAltaRaw: r.createdAt,
  };
}
