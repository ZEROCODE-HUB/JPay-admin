import type { EstadoComercio } from "@/lib/api/types";

export type Tono = "success" | "neutral" | "warn" | "danger";

/** Tono del badge según el estado del comercio. Cualquier estado no mapeado (p. ej. pendiente) va en "warn". */
export function estadoComercioTone(estado: EstadoComercio): Tono {
  if (estado === "Activado") return "success";
  if (estado === "Desactivado") return "neutral";
  if (estado === "Rechazado") return "danger";
  return "warn";
}
