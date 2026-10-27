import { formatMoney } from "@/shared/format";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Column } from "@/shared/ui/data-table";
import { estadoBadge } from "@/components/movimiento-detail";
import { LegajoCell, LEGAJO_TOOLTIP } from "@/components/legajo-label";
import { TIPOS_LINEA } from "@/lib/api/lineas-movimiento";
import { ESTADOS_MOVIMIENTO } from "@/lib/api/types";
import { TIPO_LINEA_STYLE } from "../estados";
import { fmtFecha, OPERACION_LABEL, TIPO_LINEA_LABEL, type Fila } from "../utils";

/** Columnas del listado de líneas; dependen del estado de agrupación por TXID. */
export function buildColumns({
  filtrarTxid,
  toggle,
  abiertos,
  agrupar,
}: {
  filtrarTxid: (txid: string) => void;
  toggle: (idTxn: string) => void;
  abiertos: Set<string>;
  agrupar: boolean;
}): Column<Fila>[] {
  return [
    {
      key: "legajo",
      label: "Legajo",
      hint: LEGAJO_TOOLTIP,
      minWidth: 130,
      render: (r) => <LegajoCell legajo={r.legajo} />,
    },
    {
      key: "idTxn",
      label: "ID transacción",
      minWidth: 180,
      maxWidth: 240,
      tooltip: (r) => r.idTxn,
      render: (r) => (
        <button
          type="button"
          onClick={() => filtrarTxid(r.idTxn)}
          className="font-mono tabular-nums text-left hover:text-primary-ink hover:underline underline-offset-2"
          title="Filtrar por este TXID"
        >
          {r.idTxn}
        </button>
      ),
    },
    {
      key: "tipoLinea",
      label: "Tipo",
      filterable: "enum",
      filterOptions: TIPOS_LINEA.map((t) => t.label),
      minWidth: 170,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r._esCabeza && r._hijas > 0 ? (
            <button
              type="button"
              onClick={() => toggle(r.idTxn)}
              className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
              title={abiertos.has(r.idTxn) ? "Ocultar desglose" : `Ver desglose (${r._hijas})`}
            >
              {abiertos.has(r.idTxn) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span
              className={agrupar && !r._esCabeza ? "w-5 border-l-2 border-muted h-5 ml-2" : "w-5"}
            />
          )}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TIPO_LINEA_STYLE[r.tipoLinea]}`}
          >
            {TIPO_LINEA_LABEL.get(r.tipoLinea) ?? r.tipoLinea}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {OPERACION_LABEL.get(r.tipoOperacion) ?? r.tipoOperacion}
          </span>
        </div>
      ),
    },
    {
      key: "cvu",
      label: "CVU",
      minWidth: 190,
      maxWidth: 230,
      render: (r) => <span className="font-mono tabular-nums">{r.cvu || "-"}</span>,
    },
    { key: "email", label: "Email", minWidth: 180, maxWidth: 260, render: (r) => r.email ?? "-" },
    {
      key: "nombre",
      label: "Nombre",
      minWidth: 160,
      maxWidth: 260,
      render: (r) => r.nombre ?? "-",
    },
    {
      key: "nombreDestino",
      label: "Nombre destino",
      minWidth: 180,
      maxWidth: 280,
      render: (r) => r.nombreDestino ?? "-",
    },
    {
      key: "cuit",
      label: "CUIT",
      minWidth: 120,
      render: (r) => <span className="font-mono tabular-nums">{r.cuit || "-"}</span>,
    },
    {
      key: "monto",
      label: "Monto",
      minWidth: 150,
      render: (r) => (
        <span
          className={`font-mono tabular-nums font-semibold ${r.monto >= 0 ? "text-emerald-700" : "text-danger-700"}`}
        >
          {formatMoney(r.monto, { signo: true })}
        </span>
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      filterable: "date",
      minWidth: 170,
      render: (r) => <span className="font-mono tabular-nums">{fmtFecha(r.fecha)}</span>,
    },
    {
      key: "estado",
      label: "Estado",
      filterable: "enum",
      filterOptions: [...ESTADOS_MOVIMIENTO],
      minWidth: 120,
      render: (r) => estadoBadge(r.estadoCodigo),
    },
  ];
}
