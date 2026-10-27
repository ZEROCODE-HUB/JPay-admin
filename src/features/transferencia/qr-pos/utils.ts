import { brand } from "@/brand/brand";
import type { EstadoQr, PuntoVenta } from "@/lib/api/types";

export const PAGE_SIZES = [10, 20, 50];

/** Acciones del menú de un QR/POS (además de "Ver detalles"), en el orden en que se muestran. */
export type AccionQr =
  "Activar" | "Desactivar" | "Rechazar" | "Suspender" | "Pendiente" | "Eliminar";

/** Estado destino de cada acción que cambia el estado (Eliminar borra el registro). */
export const ESTADO_DESTINO: Record<Exclude<AccionQr, "Eliminar">, EstadoQr> = {
  Activar: "Activado",
  Desactivar: "Desactivado",
  Rechazar: "Rechazado",
  Suspender: "Suspendido",
  Pendiente: "Pendiente de aprobación",
};

/** Valor codificado en el QR: la URL guardada o, si no hay, la URL pública del punto de venta. */
export function qrValue(qr: Pick<PuntoVenta, "id" | "qrUrl">): string {
  return qr.qrUrl || `${brand.web.website}/qr/pdv/${qr.id}`;
}

function esPendiente(estado: string): boolean {
  return estado === "Pendiente de aprobación" || estado === "Pendiente de aprobacion";
}

/**
 * Acciones disponibles para un QR/POS según su estado actual: todas las transiciones
 * están siempre disponibles salvo la que lleva al estado en el que ya está.
 */
export function accionesDisponibles(estado: string): AccionQr[] {
  const acciones: AccionQr[] = [];
  if (estado !== "Activado") acciones.push("Activar");
  if (estado !== "Desactivado") acciones.push("Desactivar");
  if (estado !== "Rechazado") acciones.push("Rechazar");
  if (estado !== "Suspendido") acciones.push("Suspender");
  if (!esPendiente(estado)) acciones.push("Pendiente");
  if (estado !== "Eliminado") acciones.push("Eliminar");
  return acciones;
}

/** Cantidad de páginas (mínimo 1). */
export function totalPaginas(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
