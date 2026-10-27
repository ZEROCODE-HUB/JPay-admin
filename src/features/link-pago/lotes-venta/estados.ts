export type Tono = "success" | "warn" | "danger" | "neutral";

/**
 * Tone para el estado de una operación del lote de venta.
 *
 * Ojo: no es igual a `toneMovimiento` de `lotes/estados`: acá un código
 * desconocido cae a `neutral` y `PROCESADO` cuenta como `warn`.
 */
export function toneOperacion(codigo?: string): Tono {
  if (!codigo) return "neutral";
  if (codigo === "APROBADO") return "success";
  if (codigo === "PENDIENTE" || codigo === "PROCESADO") return "warn";
  if (codigo === "RECHAZADO" || codigo === "CANCELADO" || codigo === "ERROR") return "danger";
  return "neutral";
}
