import type { EstadoLote } from "@/lib/api/types";

export type Tono = "success" | "warn" | "danger" | "neutral";

const TONO_LOTE: Record<EstadoLote, Tono> = {
  Programado: "neutral",
  Pendiente: "warn",
  Acreditado: "success",
  Contracargo: "danger",
  Cancelado: "neutral",
};

export function toneLote(e: EstadoLote): Tono {
  return TONO_LOTE[e] ?? "neutral";
}

const TONO_MOVIMIENTO: Record<string, Tono> = {
  APROBADO: "success",
  ACREDITADO: "success",
  COMPLETADO: "success",
  RECHAZADO: "danger",
  CANCELADO: "danger",
  DEVUELTO: "danger",
  PENDIENTE: "warn",
  EN_PROGRESO: "warn",
  EN_REVISION: "warn",
  REQUIERE_ACCION: "warn",
};

/**
 * Tone para el estado de un movimiento (link de pago, no lote).
 *
 * Mapea por `estadoCodigo` cuando está presente (códigos del catálogo
 * `estados_movimiento`); si el código es desconocido cae a `warn` para
 * que el operador note que hay un estado que no está en la lista y lo
 * revise, en vez de mostrarlo silenciosamente como neutral.
 */
export function toneMovimiento(codigo: string | null | undefined): Tono {
  if (!codigo) return "neutral";
  return TONO_MOVIMIENTO[codigo.toUpperCase()] ?? "warn";
}

const TONO_ADELANTO: Record<string, Tono> = {
  Pendiente: "warn",
  Aprobado: "success",
  Acreditado: "success",
  Rechazado: "danger",
};

export function toneAdelanto(estado: string): Tono {
  return TONO_ADELANTO[estado] ?? "neutral";
}

/** Estados que ofrece el filtro de la grilla (Cancelado no se lista). */
export const ESTADOS_FILTRO: EstadoLote[] = [
  "Programado",
  "Pendiente",
  "Acreditado",
  "Contracargo",
];

/** Banderas por si el catálogo no responde. */
export const BANDERAS_FALLBACK = ["Visa", "Mastercard", "Amex", "Cabal", "Diners"];
