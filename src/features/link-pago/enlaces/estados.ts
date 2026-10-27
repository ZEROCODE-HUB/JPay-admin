export type Tono = "success" | "neutral" | "warn" | "danger";

/** Tono del badge según el estado del enlace de pago. */
export function toneEnlace(e: string): Tono {
  if (e === "Pagado") return "success";
  if (e === "Activado") return "success";
  if (e === "Desactivado") return "neutral";
  if (e === "Contracargo") return "danger";
  if (e === "Expirado" || e === "Cancelado") return "neutral";
  if (e === "Rechazado" || e === "Eliminado" || e === "Suspendido") return "danger";
  return "warn"; // Pendiente de aprobación
}
