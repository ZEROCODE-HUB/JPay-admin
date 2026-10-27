import type { EstadoContra } from "@/lib/api/contracargos";

export type Tono = "warn" | "neutral" | "success" | "danger";

export const ESTADO_LABEL: Record<EstadoContra, string> = {
  Simulado: "Simulado",
  Abierto: "Abierto",
  En_mediación: "En mediación",
  En_mediacion: "En mediación",
  Cerrado_acreditado: "Cerrado acreditado",
  Cerrado_retenido: "Cerrado retenido",
};

/** Estados que ofrece la UI (filtro, KPIs y selector del modal). */
export const ESTADO_OPTIONS_UI: EstadoContra[] = [
  "Simulado",
  "Abierto",
  "En_mediación",
  "Cerrado_acreditado",
  "Cerrado_retenido",
];

const TONO_CONTRA: Record<EstadoContra, Tono> = {
  Simulado: "neutral",
  Abierto: "warn",
  En_mediación: "neutral",
  En_mediacion: "neutral",
  Cerrado_acreditado: "success",
  Cerrado_retenido: "danger",
};

export function toneContra(e: EstadoContra): Tono {
  return TONO_CONTRA[e] ?? "danger";
}
