import type { EstadoApiUsuario } from "@/lib/api/types";

export type Tono = "success" | "neutral" | "warn" | "danger";

/** Tono del badge según el estado de la integración del usuario de API. */
export function estadoUsuarioApiTone(estado: EstadoApiUsuario): Tono {
  if (estado === "Producción") return "success";
  if (estado === "Suspendido" || estado === "Deshabilitado") return "danger";
  if (estado === "Homologación") return "warn";
  return "neutral";
}
