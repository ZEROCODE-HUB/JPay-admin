import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BtnPrimary, Card, Input, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { downloadExcel } from "@/features/reportes/utils/download";

/* ---------- Reportes AFIP (B-8-1-25 / B-8-1-26) ---------- */

type AfipParams = {
  montoTransaccion: string;
  montoSaldo: string;
};

const afipParamsIniciales: AfipParams = {
  montoTransaccion: "500000",
  montoSaldo: "100000",
};

type AfipRow = { fecha: string; b8125: string; b8126: string };

const afipData: AfipRow[] = [
  { fecha: "01/08/2026", b8125: "B-8-1-25_202608.xlsx", b8126: "B-8-1-26_202608.xlsx" },
  { fecha: "01/07/2026", b8125: "B-8-1-25_202607.xlsx", b8126: "B-8-1-26_202607.xlsx" },
  { fecha: "01/06/2026", b8125: "B-8-1-25_202606.xlsx", b8126: "B-8-1-26_202606.xlsx" },
  { fecha: "01/05/2026", b8125: "B-8-1-25_202605.xlsx", b8126: "B-8-1-26_202605.xlsx" },
];

export function ReporteAFIP() {
  const [params, setParams] = useState<AfipParams>(afipParamsIniciales);

  const guardarParams = () => {
    toast.success("Parámetros para reportes actualizados");
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Parámetros para reportes
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="afip-monto-txn">Monto de transacción por mes</Label>
            <Input
              id="afip-monto-txn"
              value={params.montoTransaccion}
              onChange={(e) => setParams({ ...params, montoTransaccion: e.target.value })}
              placeholder="Ej: 500000"
            />
          </div>
          <div>
            <Label htmlFor="afip-monto-saldo">Monto de saldo a fin de mes</Label>
            <Input
              id="afip-monto-saldo"
              value={params.montoSaldo}
              onChange={(e) => setParams({ ...params, montoSaldo: e.target.value })}
              placeholder="Ej: 100000"
            />
          </div>
        </div>
        <div className="mt-4">
          <BtnPrimary className="h-8 text-xs px-3" onClick={guardarParams}>
            Guardar
          </BtnPrimary>
        </div>
      </Card>

      <AfipTabla params={params} />
    </div>
  );
}

function AfipTabla({ params }: { params: AfipParams }) {
  const filaReporte = (r: AfipRow) => ({
    concepto: "Reporte AFIP",
    periodo: r.fecha,
    monto_transaccion_mes: params.montoTransaccion,
    monto_saldo_fin_mes: params.montoSaldo,
  });

  const columns: Column<AfipRow>[] = [
    {
      key: "b8125",
      label: "B8125",
      sortable: true,
      filterable: true,
      render: (r) => (
        <button
          type="button"
          onClick={() => downloadExcel(r.b8125, [filaReporte(r)])}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-ink hover:underline"
        >
          <Download size={14} /> XLS
        </button>
      ),
    },
    {
      key: "b8126",
      label: "B8126",
      sortable: true,
      filterable: true,
      render: (r) => (
        <button
          type="button"
          onClick={() => downloadExcel(r.b8126, [filaReporte(r)])}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-ink hover:underline"
        >
          <Download size={14} /> XLS
        </button>
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      filterable: "date",
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.fecha}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={afipData}
      keyExtractor={(r) => r.fecha}
      pageSize={10}
      showDownloadButton={false}
    />
  );
}
