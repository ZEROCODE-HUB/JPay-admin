import type { ResolverEstado } from "@/lib/api/types";

/** Tono del badge según el estado del resolver. */
export function estadoResolverTone(estado: ResolverEstado): "success" | "neutral" {
  return estado === "Activo" ? "success" : "neutral";
}
