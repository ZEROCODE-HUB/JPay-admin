import type { Movimiento } from "@/lib/api/types";

/** Fecha `YYYY-MM-DD` a partir de `toISOString()` (en UTC). */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Rango por defecto del cuadro de comisiones: desde el día 1 del mes hasta hoy. */
export function rangoMesActual(today: Date): { desde: string; hasta: string } {
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return { desde: toISODate(firstDay), hasta: toISODate(today) };
}

/** Lleva la fecha "hasta" al final del día; vacío → sin límite. */
export function finDeDia(hasta: string): string | undefined {
  return hasta ? hasta + "T23:59:59" : undefined;
}

export type ComisionPorComercio = {
  legajo: string;
  nombre: string;
  monto: number;
  comision: number;
  count: number;
};

export type ResumenComisiones = {
  montoTransaccionado: number;
  comisionTotal: number;
  remanente: number;
  porComercio: ComisionPorComercio[];
};

/** Totales del periodo y desglose por legajo, ordenado por monto descendente. */
export function resumirComisiones(movimientos: Movimiento[]): ResumenComisiones {
  let monto = 0;
  let comision = 0;
  const map = new Map<string, ComisionPorComercio>();
  for (const m of movimientos) {
    monto += Number(m.montoOperacion ?? 0);
    comision += Number(m.comision ?? 0);
    const key = m.legajo;
    const prev = map.get(key);
    const nombre = m.cliente?.nombre ?? m.legajo;
    if (!prev)
      map.set(key, {
        legajo: key,
        nombre,
        monto: Number(m.montoOperacion ?? 0),
        comision: Number(m.comision ?? 0),
        count: 1,
      });
    else {
      prev.monto += Number(m.montoOperacion ?? 0);
      prev.comision += Number(m.comision ?? 0);
      prev.count += 1;
    }
  }
  const porComercio = Array.from(map.values()).sort((a, b) => b.monto - a.monto);
  return {
    montoTransaccionado: monto,
    comisionTotal: comision,
    remanente: monto - comision,
    porComercio,
  };
}
