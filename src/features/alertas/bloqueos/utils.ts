import { formatMoney } from "@/shared/format";
import type { TableServerFilters } from "@/shared/ui/data-table";
import type { AccountBlock, BlockFilters, BlockScope } from "@/lib/api/compliance";
import { invertir, rangoFiltro } from "../comun/utils";

export const ESTADO_LABEL = { active: "Bloqueado", released: "Desbloqueado" } as const;
export const COMPLIANCE_LABEL = { pending: "Pendiente", accepted: "Aceptado" } as const;
export const ALCANCE_LABEL: Record<BlockScope, string> = {
  client: "Toda la cuenta",
  subaccount: "Subcuenta",
};

export const ESTADO_BY_LABEL = invertir(ESTADO_LABEL);
export const COMPLIANCE_BY_LABEL = invertir(COMPLIANCE_LABEL);
export const ALCANCE_BY_LABEL = invertir(ALCANCE_LABEL);

/** Traduce el panel de filtros de la tabla a los filtros de la API de bloqueos. */
export function filtrosBloqueos(panel: TableServerFilters, search: string): BlockFilters {
  const bloqueado = rangoFiltro(panel.dates, "blockedAt");
  const aceptado = rangoFiltro(panel.dates, "acceptedAt");
  return {
    search: search || undefined,
    blockStatus: panel.enums.estado ? ESTADO_BY_LABEL.get(panel.enums.estado) : undefined,
    complianceStatus: panel.enums.compliance
      ? COMPLIANCE_BY_LABEL.get(panel.enums.compliance)
      : undefined,
    scope: panel.enums.alcance ? ALCANCE_BY_LABEL.get(panel.enums.alcance) : undefined,
    blockedFrom: bloqueado.from,
    blockedTo: bloqueado.to,
    acceptedFrom: aceptado.from,
    acceptedTo: aceptado.to,
  };
}

export const CSV_CABECERA = [
  "Legajo",
  "Usuario",
  "Nombre",
  "Origen",
  "Alcance",
  "Subcuenta",
  "Motivo",
  "Estado",
  "Compliance",
  "Fecha de bloqueo",
  "Fecha de aceptación",
  "Fecha de liberación",
  "Retenido",
];

export function filaCsvBloqueo(b: AccountBlock): (string | number | null)[] {
  return [
    b.legajo,
    b.correo,
    b.nombre,
    b.origin === "rule" ? `Regla: ${b.ruleName ?? ""}` : "Manual",
    ALCANCE_LABEL[b.scope],
    b.subcuentaNombre ?? "",
    b.reason,
    ESTADO_LABEL[b.blockStatus],
    COMPLIANCE_LABEL[b.complianceStatus],
    b.blockedAt,
    b.acceptedAt ?? "",
    b.releasedAt ?? "",
    b.heldAmount,
  ];
}

/** Alcance del bloqueo tal como se muestra en el detalle. */
export function alcanceDetalle(b: AccountBlock): string {
  return b.scope === "client"
    ? "Toda la cuenta"
    : `Subcuenta ${b.subcuentaNombre ?? ""} ${b.subcuentaCvu ?? ""}`;
}

/** Toast de resultado de la liberación de un bloqueo. */
export function mensajeLiberacion(r: { depositos_liberados: number; monto_liberado: number }) {
  return r.depositos_liberados > 0
    ? `Bloqueo liberado. Se liberaron ${r.depositos_liberados} depósito(s) retenido(s) por ${formatMoney(Number(r.monto_liberado))}.`
    : "Bloqueo liberado.";
}
