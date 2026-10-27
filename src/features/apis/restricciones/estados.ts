import type { EstadoRestriccion } from "@/lib/api/types";

/** Tono del badge según el estado de la restricción. */
export function estadoRestriccionTone(estado: EstadoRestriccion): "danger" | "neutral" {
  return estado === "Restringiendo" ? "danger" : "neutral";
}

/** Estado al que pasa la restricción con la acción "Restringir" / "Sacar restricción". */
export function estadoOpuesto(estado: EstadoRestriccion): EstadoRestriccion {
  return estado === "Restringiendo" ? "No restringiendo" : "Restringiendo";
}
