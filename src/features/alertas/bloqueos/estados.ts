import type { BlockStatus, ComplianceStatus } from "@/lib/api/compliance";

export type Tono = "warn" | "neutral" | "success" | "danger";

/** Tono del badge según el estado del bloqueo (activo → danger). */
export const estadoBloqueoTone = (s: BlockStatus): Tono => (s === "active" ? "danger" : "success");

/** Tono del badge según la aceptación de Compliance. */
export const complianceTone = (s: ComplianceStatus): Tono =>
  s === "accepted" ? "success" : "warn";
