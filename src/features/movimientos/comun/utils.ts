import { formatDateTime, formatMoney } from "@/shared/format";
import type { Movimiento } from "@/components/movimiento-detail";
import { calcularDesglose } from "@/lib/aranceles";
import type { EstadoMovimiento, Movimiento as MovimientoDB } from "@/lib/api/types";
import { resolverEstadoMovimiento } from "@/lib/estados";
import { brand } from "@/brand/brand";

/**
 * Convierte un movimiento de la base al formato del modal de detalle.
 * `fmtFecha` permite a cada pantalla mantener su formato de fecha.
 */
export function toViewMovimiento(
  m: MovimientoDB,
  catalogo: EstadoMovimiento[],
  fmtFecha: (iso: string) => string = formatDateTime,
): Movimiento {
  const pctImpuesto = m.comision > 0 ? (m.impuesto / m.comision) * 100 : 0;
  const estado = resolverEstadoMovimiento(m, catalogo).codigo;
  return {
    clienteId: m.clienteId,
    legajo: m.legajo,
    id: m.idTxn,
    tipo: m.tipo,
    cvu: m.cvu ?? "",
    usuario: m.cliente?.correo ?? "—",
    nombreOrigen: m.cliente?.nombre ?? "—",
    nombreDestino: m.destinatarioNombre ?? (m.tipo === "transferencia" ? "—" : brand.name),
    cuit: m.destinatarioCuit ?? m.cliente?.cuit ?? "—",
    bancoDestino: m.destinatarioBanco ?? undefined,
    monto: formatMoney(m.montoOperacion),
    fecha: fmtFecha(m.fecha),
    estado,
    desglose: calcularDesglose(m.comision, pctImpuesto),
  };
}

/** Rango de fechas del panel de filtros → límites ISO del día completo. */
export function rangoFechaApi(rango?: { from?: string; to?: string }): {
  fechaDesde: string | undefined;
  fechaHasta: string | undefined;
} {
  return {
    fechaDesde: rango?.from ? `${rango.from}T00:00:00.000` : undefined,
    fechaHasta: rango?.to ? `${rango.to}T23:59:59.999` : undefined,
  };
}

/** Movimiento seleccionado para el modal de cambio de estado. */
export type EstadoTarget = {
  dbId: string;
  estadoActual: string;
  nuevoId: number;
};
