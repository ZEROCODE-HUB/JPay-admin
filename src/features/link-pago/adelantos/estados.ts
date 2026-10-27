import type { EstadoAdelanto } from "@/lib/api/types";

export type Tono = "warn" | "success" | "danger" | "neutral";

const TONO_ADELANTO: Record<EstadoAdelanto, Tono> = {
  Pendiente: "warn",
  Aprobado: "neutral",
  Acreditado: "success",
  Cancelado: "neutral",
  Rechazado: "danger",
};

export function toneAdelanto(e: EstadoAdelanto): Tono {
  return TONO_ADELANTO[e] ?? "danger";
}

/** Orden de los estados en filtro, columnas y cards de totales. */
export const ESTADOS: readonly EstadoAdelanto[] = [
  "Pendiente",
  "Aprobado",
  "Rechazado",
  "Acreditado",
  "Cancelado",
];

/** Umbral bajo el cual el cupo del pool se muestra en ámbar. */
export const CUPO_POOL_BAJO = 10000;

export type NivelCupo = "sin-liquidez" | "bajo" | "ok";

export function nivelCupoPool(cupo: number): NivelCupo {
  if (cupo <= 0) return "sin-liquidez";
  if (cupo < CUPO_POOL_BAJO) return "bajo";
  return "ok";
}

export const CUPO_BORDE: Record<NivelCupo, string> = {
  "sin-liquidez": "border-l-danger-500",
  bajo: "border-l-amber-500",
  ok: "border-l-emerald-500",
};

export const CUPO_TEXTO: Record<NivelCupo, string> = {
  "sin-liquidez": "text-danger-600",
  bajo: "text-amber-700",
  ok: "text-emerald-700",
};
