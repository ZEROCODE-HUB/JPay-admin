import { formatDateTime, formatMoney } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { Badge } from "@/components/portal-shell";
import { LegajoCell } from "@/components/legajo-label";
import type { AccountBlock } from "@/lib/api/compliance";
import { complianceTone, estadoBloqueoTone } from "../estados";
import { ALCANCE_LABEL, COMPLIANCE_LABEL, ESTADO_LABEL } from "../utils";

export const columnasBloqueos: Column<AccountBlock>[] = [
  {
    key: "legajo",
    label: "Legajo",
    minWidth: 130,
    render: (r) => <LegajoCell legajo={r.legajo} />,
  },
  { key: "correo", label: "Usuario", minWidth: 180, maxWidth: 260, render: (r) => r.correo },
  { key: "nombre", label: "Nombre", minWidth: 160, maxWidth: 240, render: (r) => r.nombre },
  {
    key: "alcance",
    label: "Tipo / alcance",
    filterable: "enum",
    filterOptions: Object.values(ALCANCE_LABEL),
    minWidth: 190,
    render: (r) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm">{r.origin === "rule" ? (r.ruleName ?? "Regla") : "Manual"}</span>
        <span className="text-[11px] text-muted-foreground">
          {ALCANCE_LABEL[r.scope]}
          {r.scope === "subaccount" && r.subcuentaNombre ? `: ${r.subcuentaNombre}` : ""}
        </span>
      </div>
    ),
  },
  {
    key: "reason",
    label: "Motivo",
    minWidth: 200,
    maxWidth: 300,
    tooltip: (r) => r.reason,
    render: (r) => r.reason,
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: Object.values(ESTADO_LABEL),
    minWidth: 120,
    render: (r) => (
      <div className="flex flex-col gap-0.5">
        <Badge tone={estadoBloqueoTone(r.blockStatus)}>{ESTADO_LABEL[r.blockStatus]}</Badge>
        {r.heldAmount > 0 && (
          <span className="text-[11px] text-muted-foreground">
            Retenido {formatMoney(r.heldAmount)}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "compliance",
    label: "Compliance",
    filterable: "enum",
    filterOptions: Object.values(COMPLIANCE_LABEL),
    minWidth: 110,
    render: (r) => (
      <Badge tone={complianceTone(r.complianceStatus)}>
        {COMPLIANCE_LABEL[r.complianceStatus]}
      </Badge>
    ),
  },
  {
    key: "blockedAt",
    label: "Fecha de bloqueo",
    filterable: "date",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatDateTime(r.blockedAt)}</span>
    ),
  },
  {
    key: "acceptedAt",
    label: "Fecha de aceptación",
    filterable: "date",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatDateTime(r.acceptedAt)}</span>
    ),
  },
];
