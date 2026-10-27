import type { EstadoContra } from "@/lib/api/contracargos";

export type Tono = "warn" | "neutral" | "success" | "danger";

/** Valor de la base → etiqueta legible. */
export const ESTADO_LABEL: Record<EstadoContra, string> = {
  Simulado: "Simulado",
  Abierto: "Abierto",
  En_mediacion: "En mediación",
  Cerrado_acreditado: "Cerrado acreditado",
  Cerrado_retenido: "Cerrado retenido",
};

/** Estados que ofrece la UI (filtro, KPIs y selector del modal). */
export const ESTADO_OPTIONS_UI: EstadoContra[] = [
  "Simulado",
  "Abierto",
  "En_mediacion",
  "Cerrado_acreditado",
  "Cerrado_retenido",
];

const TONO_CONTRA: Record<EstadoContra, Tono> = {
  Simulado: "neutral",
  Abierto: "warn",
  En_mediacion: "neutral",
  Cerrado_acreditado: "success",
  Cerrado_retenido: "danger",
};

export function toneContra(e: EstadoContra): Tono {
  return TONO_CONTRA[e] ?? "danger";
}

/** ¿El contracargo está en mediación (plazo, adjuntos y envío a PayWay)? */
export function enMediacion(e: EstadoContra): boolean {
  return e === "En_mediacion";
}

/** ¿Se muestra el plazo de mediación? */
export function muestraPlazo(e: EstadoContra): boolean {
  return enMediacion(e);
}

/** ¿Se muestra la documentación adjunta? */
export function muestraAdjuntos(e: EstadoContra): boolean {
  return enMediacion(e) || e === "Cerrado_acreditado" || e === "Cerrado_retenido";
}
