import { Download } from "lucide-react";
import { formatNumber } from "@/shared/format";
import { Badge } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { downloadExcel } from "@/features/reportes/utils/download";
import { periodoEnCurso } from "@/features/reportes/utils/periodos";

/* ---------- Reportes de Comisiones ---------- */

type Comision = {
  periodo: string;
  tipo: string;
  cantidad: number;
  monto: string;
  comision: string;
  enCurso: boolean;
};

function comisionesData(cursoMes: string): Comision[] {
  return [
    {
      periodo: cursoMes,
      tipo: "Depósitos",
      cantidad: 820,
      monto: "$ 8.200.000",
      comision: "$ 123.000",
      enCurso: true,
    },
    {
      periodo: cursoMes,
      tipo: "Retiros",
      cantidad: 540,
      monto: "$ 5.400.000",
      comision: "$ 81.000",
      enCurso: true,
    },
    {
      periodo: "01/07/2026",
      tipo: "Depósitos",
      cantidad: 1245,
      monto: "$ 12.450.000",
      comision: "$ 186.750",
      enCurso: false,
    },
    {
      periodo: "01/07/2026",
      tipo: "Retiros",
      cantidad: 892,
      monto: "$ 8.920.000",
      comision: "$ 133.800",
      enCurso: false,
    },
    {
      periodo: "01/07/2026",
      tipo: "Transferencias",
      cantidad: 3456,
      monto: "$ 34.560.000",
      comision: "$ 518.400",
      enCurso: false,
    },
    {
      periodo: "01/06/2026",
      tipo: "Depósitos",
      cantidad: 1187,
      monto: "$ 11.870.000",
      comision: "$ 178.050",
      enCurso: false,
    },
    {
      periodo: "01/05/2026",
      tipo: "Depósitos",
      cantidad: 1050,
      monto: "$ 10.500.000",
      comision: "$ 157.500",
      enCurso: false,
    },
  ];
}

const columns: Column<Comision>[] = [
  {
    key: "periodo",
    label: "Período",
    filterable: "date",
    sortable: true,
    render: (r) => (
      <span className="font-mono tabular-nums">
        {r.periodo}
        {r.enCurso ? (
          <Badge tone="warn" className="ml-1.5">
            En curso
          </Badge>
        ) : null}
      </span>
    ),
  },
  { key: "tipo", label: "Tipo", filterable: true, render: (r) => r.tipo },
  {
    key: "cantidad",
    label: "Cantidad",
    filterable: true,
    sortable: true,
    render: (r) => formatNumber(r.cantidad),
  },
  {
    key: "monto",
    label: "Monto cobrado",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.monto}</span>,
  },
  {
    key: "comision",
    label: "Comisión",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.comision}</span>,
  },
  {
    key: "xls",
    label: "XLS",
    render: (r) => (
      <button
        type="button"
        onClick={() =>
          downloadExcel(`comisiones_${r.periodo}_${r.tipo}.xlsx`, [
            {
              periodo: r.periodo,
              tipo: r.tipo,
              cantidad: r.cantidad,
              monto: r.monto,
              comision: r.comision,
            },
          ])
        }
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-ink hover:underline"
      >
        <Download size={14} /> XLS
      </button>
    ),
  },
];

export function ReporteComisiones() {
  const data = comisionesData(periodoEnCurso());
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge tone="warn">Reporte en curso</Badge>
        <span>
          Los períodos marcados como "En curso" corresponden al mes actual y reflejan las comisiones
          acumuladas hasta ahora. Al finalizar el mes se genera el reporte definitivo.
        </span>
      </div>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.periodo + r.tipo}
        pageSize={10}
        showDownloadButton={false}
      />
    </div>
  );
}
