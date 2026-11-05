import { formatMoney, formatPercent } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { estadoBadge } from "@/components/movimiento-detail";
import { LegajoCell, LEGAJO_TOOLTIP } from "@/components/legajo-label";
import { ESTADOS_MOVIMIENTO } from "@/lib/api/types";
import { pctSobreOperacion, TIPO_LABEL, type FilaSubRuta } from "../utils";

export const columnasSubRuta: Column<FilaSubRuta>[] = [
  {
    key: "legajo",
    label: "Número de cliente",
    hint: LEGAJO_TOOLTIP,
    filterable: true,
    minWidth: 100,
    render: (r) => <LegajoCell legajo={r.legajo} />,
  },
  {
    key: "id",
    label: "ID",
    filterable: true,
    minWidth: 120,
    maxWidth: 200,
    render: (r) => <span className="font-mono tabular-nums">{r.id}</span>,
  },
  {
    key: "tipo",
    label: "Tipo de movimiento",
    filterable: false,
    minWidth: 140,
    render: (r) => TIPO_LABEL[r.tipo] ?? r.tipo,
  },
  {
    key: "clabe",
    label: "CLABE",
    filterable: true,
    minWidth: 120,
    maxWidth: 200,
    render: (r) => <span className="font-mono tabular-nums">{r.clabe}</span>,
  },
  {
    key: "usuario",
    label: "Usuario",
    filterable: true,
    minWidth: 180,
    maxWidth: 280,
    render: (r) => r.usuario,
  },
  {
    key: "nombreOrigen",
    label: "Nombre empresa/persona",
    filterable: true,
    minWidth: 200,
    maxWidth: 320,
    render: (r) => r.nombreOrigen,
  },
  {
    key: "rfc",
    label: "RFC contraparte",
    filterable: true,
    minWidth: 120,
    render: (r) => <span className="font-mono tabular-nums">{r.rfc}</span>,
  },
  {
    key: "monto",
    label: "Monto operación",
    minWidth: 140,
    render: (r) => <span className="font-mono tabular-nums">{r.monto}</span>,
  },
  {
    key: "comision",
    label: "Comisión",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono tabular-nums">
        {formatMoney(r._comision)}{" "}
        <span className="text-muted-foreground">
          ({formatPercent(pctSobreOperacion(r._comision, r._montoOperacion))})
        </span>
      </span>
    ),
  },
  {
    key: "retencion",
    label: "Impuesto",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono tabular-nums">
        {formatMoney(r._impuesto)}{" "}
        <span className="text-muted-foreground">
          ({formatPercent(pctSobreOperacion(r._impuesto, r._montoOperacion))})
        </span>
      </span>
    ),
  },
  {
    key: "iva",
    label: "IVA sobre comisión",
    minWidth: 140,
    render: (r) => <span className="font-mono tabular-nums">{formatMoney(r._iva)}</span>,
  },
  {
    key: "cobrado",
    label: "Monto cobrado",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono font-semibold tabular-nums">{formatMoney(r._cobrado)}</span>
    ),
  },
  {
    key: "fecha",
    label: "Fecha",
    filterable: "date",
    minWidth: 160,
    render: (r) => <span className="font-mono tabular-nums">{r.fecha}</span>,
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: [...ESTADOS_MOVIMIENTO],
    minWidth: 120,
    render: (row) => estadoBadge(row.estado),
  },
];
