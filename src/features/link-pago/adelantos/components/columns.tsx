import { Badge } from "@/components/portal-shell";
import { formatMoney } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { ESTADOS, toneAdelanto } from "../estados";
import type { AdelantoUI } from "../utils";

export const adelantosColumns: Column<AdelantoUI>[] = [
  {
    key: "id",
    label: "Solicitud",
    filterable: true,
    render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span>,
  },
  {
    key: "comercio",
    label: "Comercio",
    filterable: true,
    render: (r) => (
      <div>
        <div className="font-semibold text-sm truncate max-w-[200px]">{r.comercio}</div>
        <div className="font-mono text-xs text-muted-foreground">{r.legajo}</div>
      </div>
    ),
  },
  {
    key: "importeSolicitado",
    label: "Importe",
    render: (r) => (
      <span className="font-mono tabular-nums font-semibold">
        {formatMoney(r.importeSolicitado)}
      </span>
    ),
  },
  {
    key: "plazoSolicitado",
    label: "Plazo",
    render: (r) => (
      <div>
        <div className="font-semibold text-sm">{r.plazoSolicitado}</div>
        <div className="text-xs text-muted-foreground">{r.plazoContractual}</div>
      </div>
    ),
  },
  {
    key: "comision",
    label: "Tasa / comisión",
    render: (r) => (
      <div>
        <div className="font-semibold text-sm">{r.comision}</div>
        <div className="text-xs text-muted-foreground">{r.tasaEfectiva ?? "—"}</div>
      </div>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: [...ESTADOS],
    render: (r) => <Badge tone={toneAdelanto(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "fechaSolicitud",
    label: "Fecha",
    render: (r) => <span className="font-mono text-xs">{r.fechaSolicitud}</span>,
  },
];
