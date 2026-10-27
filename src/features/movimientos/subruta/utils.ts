import type { Movimiento } from "@/components/movimiento-detail";
import type { EstadoMovimiento, Movimiento as MovimientoDB } from "@/lib/api/types";
import { toViewMovimiento } from "../comun/utils";

export const PAGE_SIZE = 25;

export const TIPO_LABEL: Record<string, string> = {
  deposito: "Depósito",
  retiro: "Retiro",
  transferencia: "Transferencia",
  tarjeta: "Pago con tarjeta",
  pago_pct: "Pago PCT",
  cobro_pct: "Cobro PCT",
};

/** Fila de vista = movimiento + montos reales almacenados, para las columnas de cada vista. */
export type FilaSubRuta = Movimiento & {
  _comision: number;
  _iva: number;
  _cobrado: number;
  _montoOperacion: number;
  _impuesto: number;
  _comercioId: string | null;
  _bandera: string | null;
  _dbId: string;
};

export function toFilaSubRuta(m: MovimientoDB, catalogo: EstadoMovimiento[]): FilaSubRuta {
  return {
    ...toViewMovimiento(m, catalogo),
    _comision: m.comision,
    _iva: m.impuesto,
    _cobrado: m.montoCobrado,
    _montoOperacion: m.montoOperacion,
    _impuesto: m.impuesto,
    _comercioId: m.comercioId ?? null,
    _bandera: m.bandera ?? null,
    _dbId: m.id,
  };
}

/** Porcentaje que representa `parte` sobre el monto de la operación (0 si no hay monto). */
export function pctSobreOperacion(parte: number, montoOperacion: number): number {
  return montoOperacion > 0 ? (parte / montoOperacion) * 100 : 0;
}

/**
 * Comisión Payway de un movimiento con tarjeta: usa el % congelado en el lote si
 * existe; si no, el % vigente de la bandera del comercio (0 si no hay).
 */
export function comisionPayway(
  r: Pick<FilaSubRuta, "_dbId" | "_comercioId" | "_bandera" | "_montoOperacion">,
  snapshot: Map<string, { pct: number }> | undefined,
  banderasLookup: Map<string, number>,
): { pct: number; monto: number } {
  const snap = snapshot?.get(r._dbId);
  const pct = snap ? snap.pct : (banderasLookup.get(`${r._comercioId}::${r._bandera}`) ?? 0);
  return { pct, monto: (r._montoOperacion * pct) / 100 };
}

/** Qué columnas se muestran según el tipo fijo / la vista transversal. */
export function columnaVisible(
  key: string,
  opts: { tipoCode?: string; soloConComision: boolean; isTarjeta: boolean },
): boolean {
  return (
    (Boolean(opts.tipoCode) || key !== "tipo") &&
    (opts.soloConComision || !["iva", "cobrado"].includes(key)) &&
    (opts.isTarjeta || key !== "payway")
  );
}

/** Inserta `col` después de la columna `despuesDe` (o al final si no está). */
export function insertarDespues<T extends { key: string }>(
  cols: T[],
  despuesDe: string,
  col: T,
): T[] {
  const idx = cols.findIndex((c) => c.key === despuesDe);
  if (idx === -1) return [...cols, col];
  const next = [...cols];
  next.splice(idx + 1, 0, col);
  return next;
}
