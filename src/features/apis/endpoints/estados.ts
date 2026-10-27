import type { EstadoEndpoint, MetodoHttp } from "@/lib/api/types";

/** Tono del badge según el estado del endpoint. */
export function estadoEndpointTone(estado: EstadoEndpoint): "success" | "neutral" {
  return estado === "Habilitado" ? "success" : "neutral";
}

/** Tono del badge según el método HTTP. */
export function metodoTone(metodo: MetodoHttp): "success" | "warn" | "danger" | "neutral" {
  if (metodo === "GET") return "success";
  if (metodo === "DELETE") return "danger";
  if (metodo === "POST") return "warn";
  return "neutral";
}
