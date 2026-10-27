import { Badge } from "@/components/portal-shell";
import type { Contra } from "@/lib/api/contracargos";
import { formatDate, formatMoney } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { ESTADO_LABEL, ESTADO_OPTIONS_UI, toneContra } from "../estados";

export const contracargosColumns: Column<Contra>[] = [
  {
    key: "id",
    label: "ID",
    filterable: true,
    render: (r) => (
      <div className="flex items-center gap-1.5">
        {r.esSimulacion && (
          <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-medium">
            sim
          </span>
        )}
        {r.siteTransactionId && (
          <span
            className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 font-medium"
            title="Importado de PayWay"
          >
            PW
          </span>
        )}
        <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span>
      </div>
    ),
  },
  {
    key: "comercio",
    label: "Comercio",
    filterable: true,
    render: (r) => (
      <div>
        <div className="font-semibold text-sm truncate max-w-[140px]">{r.comercioNombre}</div>
        <div className="font-mono text-xs text-muted-foreground">{r.comercioLegajo}</div>
      </div>
    ),
  },
  {
    key: "importe",
    label: "Importe",
    render: (r) => (
      <span className="font-mono tabular-nums font-semibold text-danger-600">
        -{formatMoney(r.importe)}
      </span>
    ),
  },
  {
    key: "ticketPayway",
    label: "Ticket / TID",
    filterable: true,
    render: (r) => (
      <div className="space-y-0.5">
        {r.ticketPayway && <span className="font-mono text-xs block">{r.ticketPayway}</span>}
        {r.siteTransactionId && (
          <span
            className="font-mono text-[10px] text-muted-foreground block truncate max-w-[160px]"
            title={r.siteTransactionId}
          >
            TID: {r.siteTransactionId.slice(0, 12)}…
          </span>
        )}
        {!r.ticketPayway && !r.siteTransactionId && "—"}
      </div>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: ESTADO_OPTIONS_UI.map((s) => ESTADO_LABEL[s]),
    render: (r) => <Badge tone={toneContra(r.estado)}>{ESTADO_LABEL[r.estado]}</Badge>,
  },
  {
    key: "createdAt",
    label: "Fecha",
    render: (r) => <span className="font-mono text-xs">{formatDate(r.createdAt)}</span>,
  },
];
