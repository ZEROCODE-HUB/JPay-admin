import { Download } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { brand } from "@/brand/brand";
import { downloadExcel } from "@/features/reportes/utils/download";

export function ReporteUnidadNegocio() {
  const data = [
    {
      unidad: "CVU",
      generaPropio: "$ 450.000",
      payWay: "$ 320.000",
      neto: "$ 130.000",
      impuestos: "$ 45.000",
      total: "$ 945.000",
    },
    {
      unidad: "CVU / CVU chica U",
      generaPropio: "$ 180.000",
      payWay: "$ 120.000",
      neto: "$ 60.000",
      impuestos: "$ 18.000",
      total: "$ 378.000",
    },
    {
      unidad: "Pago por QR",
      generaPropio: "$ 95.000",
      payWay: "$ 70.000",
      neto: "$ 25.000",
      impuestos: "$ 12.000",
      total: "$ 202.000",
    },
    {
      unidad: "Link de Pago",
      generaPropio: "$ 620.000",
      payWay: "$ 810.000",
      neto: "$ -190.000",
      impuestos: "$ 310.000",
      total: "$ 1.740.000",
    },
    {
      unidad: "E-commerce",
      generaPropio: "$ 510.000",
      payWay: "$ 680.000",
      neto: "$ -170.000",
      impuestos: "$ 260.000",
      total: "$ 1.450.000",
    },
  ];
  const columns: Column<(typeof data)[number]>[] = [
    {
      key: "unidad",
      label: "Unidad de negocio",
      filterable: true,
      render: (r) => <span className="font-semibold">{r.unidad}</span>,
    },
    {
      key: "generaPropio",
      label: `Genera ${brand.name}`,
      render: (r) => <span className="font-mono text-emerald-700">{r.generaPropio}</span>,
    },
    {
      key: "payWay",
      label: "Corresponde PayWay",
      render: (r) => <span className="font-mono">{r.payWay}</span>,
    },
    {
      key: "neto",
      label: "Neto",
      render: (r) => <span className="font-mono font-semibold">{r.neto}</span>,
    },
    {
      key: "impuestos",
      label: "Impuestos",
      render: (r) => <span className="font-mono">{r.impuestos}</span>,
    },
    {
      key: "total",
      label: "Total",
      render: (r) => <span className="font-mono font-semibold">{r.total}</span>,
    },
    {
      key: "xls",
      label: "XLS",
      render: (r) => (
        <button
          onClick={() => downloadExcel(`unidad_${r.unidad}.xlsx`, [r])}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-ink hover:underline"
        >
          <Download size={14} /> XLS
        </button>
      ),
    },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Análisis por unidad de negocio — cuánto deja cada unidad ({brand.name} vs PayWay vs neto).
      </p>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.unidad}
        pageSize={10}
        showDownloadButton={false}
      />
    </div>
  );
}
