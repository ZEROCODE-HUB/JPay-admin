import type { Movimiento } from "@/components/movimiento-detail";
import type { EstadoMovimiento, Movimiento as MovimientoDB } from "@/lib/api/types";
import { toViewMovimiento } from "../comun/utils";

export const PAGE_SIZE = 25;

export const TIPO_LABEL: Record<string, string> = {
  deposito: "Depósito",
  retiro: "Retiro",
  transferencia: "Transferencia",
  conversion: "Conversión a dólares",
  tarjeta: "Pago con tarjeta",
};

/** Fila de vista = movimiento + montos reales almacenados, para las columnas de cada vista. */
export type FilaSubRuta = Movimiento & {
  _comision: number;
  _iva: number;
  _cobrado: number;
  _montoOperacion: number;
  _impuesto: number;
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
    _dbId: m.id,
  };
}

/** Porcentaje que representa `parte` sobre el monto de la operación (0 si no hay monto). */
export function pctSobreOperacion(parte: number, montoOperacion: number): number {
  return montoOperacion > 0 ? (parte / montoOperacion) * 100 : 0;
}

/** Qué columnas se muestran según el tipo fijo / la vista transversal. */
export function columnaVisible(
  key: string,
  opts: { tipoCode?: string; soloConComision: boolean },
): boolean {
  return (
    (Boolean(opts.tipoCode) || key !== "tipo") &&
    (opts.soloConComision || !["iva", "cobrado"].includes(key))
  );
}
