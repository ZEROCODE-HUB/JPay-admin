import type { EstadoCategoria } from "./utils";

/** Tono del badge según el estado de la categoría. */
export function estadoCategoriaTone(estado: EstadoCategoria): "success" | "neutral" {
  return estado === "activo" ? "success" : "neutral";
}
