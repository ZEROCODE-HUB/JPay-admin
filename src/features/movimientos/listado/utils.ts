import { TIPOS_LINEA, type LineaMovimiento } from "@/lib/api/lineas-movimiento";

export const PAGE_SIZES = [10, 20, 50];

// Operación de negocio que originó las líneas (transactions.tipo).
export const OPERACIONES: { label: string; code: string }[] = [
  { label: "Depósito", code: "deposito" },
  { label: "Retiro", code: "retiro" },
  { label: "Transferencia", code: "transferencia" },
  { label: "Pago con tarjeta", code: "tarjeta" },
  { label: "Pago PCT", code: "pago_pct" },
  { label: "Cobro PCT", code: "cobro_pct" },
  { label: "Liquidación de lote", code: "liquidacion_lote" },
  { label: "Acreditación de lote", code: "acreditacion_lote" },
  { label: "Adelanto", code: "adelanto" },
  { label: "Ajuste de saldo", code: "ajuste_manual" },
];
export const OPERACION_LABEL = new Map(OPERACIONES.map((o) => [o.code, o.label]));
export const TIPO_LINEA_LABEL = new Map(TIPOS_LINEA.map((t) => [t.code, t.label]));
export const TIPO_LINEA_CODE = new Map(TIPOS_LINEA.map((t) => [t.label, t.code]));

/** Fecha local `YYYY-MM-DD HH:mm:ss`; si no es una fecha válida devuelve el texto original. */
export function fmtFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Fila de la tabla: la línea + si encabeza un grupo de su TXID y cuántas líneas oculta. */
export type Fila = LineaMovimiento & { _esCabeza: boolean; _hijas: number };

/**
 * Agrupación por TXID dentro de la página: la primera línea de cada operación
 * encabeza el grupo y las demás (comisión, impuesto, ...) se despliegan solo si
 * el TXID está en `abiertos`. Sin `agrupar`, todas las líneas quedan planas.
 */
export function agruparPorTxid(
  rows: LineaMovimiento[],
  agrupar: boolean,
  abiertos: Set<string>,
): Fila[] {
  const porTxn = new Map<string, LineaMovimiento[]>();
  for (const r of rows) {
    const g = porTxn.get(r.idTxn);
    if (g) g.push(r);
    else porTxn.set(r.idTxn, [r]);
  }
  const out: Fila[] = [];
  const vistos = new Set<string>();
  for (const r of rows) {
    const grupo = porTxn.get(r.idTxn)!;
    const esCabeza = !vistos.has(r.idTxn);
    vistos.add(r.idTxn);
    if (!agrupar) {
      out.push({ ...r, _esCabeza: false, _hijas: 0 });
    } else if (esCabeza) {
      out.push({ ...r, _esCabeza: true, _hijas: grupo.length - 1 });
    } else if (abiertos.has(r.idTxn)) {
      out.push({ ...r, _esCabeza: false, _hijas: 0 });
    }
  }
  return out;
}

/** Devuelve un nuevo Set con `id` agregado o quitado. */
export function toggleEnSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
