import type { EstadoQr } from "@/lib/api/types";

export type Tono = "success" | "neutral" | "warn" | "danger";

/** Estados que se ofrecen en el filtro del listado. */
export const ESTADOS_QR: EstadoQr[] = [
  "Pendiente de aprobación",
  "Activado",
  "Desactivado",
  "Rechazado",
  "Suspendido",
  "Eliminado",
];

/** Tono del badge según el estado del QR/POS. Cualquier estado no mapeado (p. ej. pendiente) va en "warn". */
export function estadoQrTone(estado: string): Tono {
  if (estado === "Activado") return "success";
  if (estado === "Rechazado" || estado === "Eliminado") return "danger";
  if (estado === "Suspendido") return "danger";
  if (estado === "Desactivado") return "neutral";
  return "warn";
}
