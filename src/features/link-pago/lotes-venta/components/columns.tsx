import { formatDate, formatDateTime, formatMoney } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { Badge } from "@/components/portal-shell";
import type { LoteVenta, Movimiento } from "@/lib/api/types";
import { toneOperacion } from "../estados";
import { legajoComercioVenta, nombreComercioVenta } from "../utils";

export const columnasLotesVenta: Column<LoteVenta>[] = [
  {
    key: "fecha",
    label: "Fecha Venta",
    minWidth: 120,
    render: (r) => <span className="font-mono text-xs tabular-nums">{formatDate(r.fecha)}</span>,
  },
  {
    key: "comercio",
    label: "Comercio / Legajo",
    minWidth: 200,
    maxWidth: 320,
    render: (r) => (
      <div>
        <div className="font-semibold text-sm truncate max-w-[180px]">{nombreComercioVenta(r)}</div>
        <div className="font-mono text-xs text-muted-foreground">{legajoComercioVenta(r)}</div>
      </div>
    ),
  },
  {
    key: "bandera",
    label: "Bandera",
    minWidth: 130,
    render: (r) => (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-muted/50">
        {r.bandera}
      </span>
    ),
  },
  {
    key: "cantidadOperaciones",
    label: "Ops",
    minWidth: 80,
    render: (r) => <span className="font-mono tabular-nums">{r.cantidadOperaciones}</span>,
  },
  {
    key: "importeBruto",
    label: "Bruto",
    minWidth: 130,
    render: (r) => <span className="font-mono tabular-nums">{formatMoney(r.importeBruto)}</span>,
  },
  {
    key: "impuestos",
    label: "Impuestos Est.",
    minWidth: 130,
    render: (r) => (
      <span className="font-mono tabular-nums text-danger-600">- {formatMoney(r.impuestos)}</span>
    ),
  },
  {
    key: "comision",
    label: "Comisión Est.",
    minWidth: 130,
    render: (r) => (
      <span className="font-mono tabular-nums text-danger-600">- {formatMoney(r.comision)}</span>
    ),
  },
  {
    key: "netoEstimado",
    label: "Neto Estimado",
    minWidth: 140,
    render: (r) => (
      <span className="font-mono tabular-nums font-semibold text-emerald-700">
        {formatMoney(r.netoEstimado)}
      </span>
    ),
  },
];

export const columnasOperacionesLote: Column<Movimiento>[] = [
  {
    key: "fecha",
    label: "Fecha",
    minWidth: 130,
    render: (r) => (
      <span className="font-mono text-xs tabular-nums">{formatDateTime(r.fecha)}</span>
    ),
  },
  {
    key: "idTxn",
    label: "ID Transacción",
    minWidth: 180,
    maxWidth: 240,
    render: (r) => (
      <span className="font-mono text-xs truncate block" title={r.idTxn}>
        {r.idTxn}
      </span>
    ),
  },
  {
    key: "cliente",
    label: "Cliente",
    minWidth: 200,
    render: (r) => (
      <div>
        <div className="text-sm truncate max-w-[180px]">{r.cliente?.nombre ?? r.legajo}</div>
        <div className="font-mono text-xs text-muted-foreground">{r.legajo}</div>
      </div>
    ),
  },
  {
    key: "montoOperacion",
    label: "Monto",
    minWidth: 110,
    render: (r) => <span className="font-mono tabular-nums">{formatMoney(r.montoOperacion)}</span>,
  },
  {
    key: "comision",
    label: "Comisión",
    minWidth: 110,
    render: (r) => (
      <span className="font-mono tabular-nums text-danger-600">- {formatMoney(r.comision)}</span>
    ),
  },
  {
    key: "impuesto",
    label: "Impuesto",
    minWidth: 110,
    render: (r) => (
      <span className="font-mono tabular-nums text-danger-600">- {formatMoney(r.impuesto)}</span>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    minWidth: 110,
    render: (r) => (
      <Badge tone={toneOperacion(r.estadoCodigo)}>{r.estadoNombre ?? r.estadoCodigo ?? "—"}</Badge>
    ),
  },
];
