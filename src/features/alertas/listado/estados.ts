import type { AlertStatus } from "@/lib/api/compliance";

export type Tono = "warn" | "neutral" | "success" | "danger";

/** Tono del badge según el estado de la alerta. */
export const STATUS_TONE: Record<AlertStatus, Tono> = {
  pending: "warn",
  in_review: "neutral",
  resolved: "success",
  dismissed: "neutral",
};

/** Tono del badge "Activo" (alerta vigente → warn). */
export const activoTone = (activo: boolean): Tono => (activo ? "warn" : "neutral");
