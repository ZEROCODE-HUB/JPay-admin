import { useState } from "react";
import { Download, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { FormDialog } from "@/shared/ui/form-dialog";
import { ImpuestoDetalleModal } from "@/features/reportes/components/ImpuestoDetalleModal";
import { downloadFile } from "@/features/reportes/utils/download";
import {
  generarTxtImpuesto,
  generarXmlImpuesto,
  nuevoImpuesto,
  type Impuesto,
} from "@/features/reportes/utils/impuestos";

/* ---------- Reportes de Impuestos ---------- */

const IMPUESTOS_DISPONIBLES = ["Ganancias", "Ingresos Brutos", "IVA", "Débito/Crédito (Sellos)"];

const impuestosData: Impuesto[] = [
  {
    id: "IMP-0001",
    reporte: "Ganancias",
    periodo: "2026-06",
    tramo: "Tramo 1",
    creado: "2026-07-05",
    presentado: "Sí",
    pagado: "Sí",
    totalRegistros: 1240,
    totalMovimientos: 1240,
    totalMonto: "$ 8.450.000",
    totalRetenciones: "$ 1.690.000",
  },
  {
    id: "IMP-0002",
    reporte: "Ingresos Brutos",
    periodo: "2026-05",
    tramo: "Tramo 2",
    creado: "2026-06-10",
    presentado: "Sí",
    pagado: "Sí",
    totalRegistros: 980,
    totalMovimientos: 980,
    totalMonto: "$ 5.120.000",
    totalRetenciones: "$ 512.000",
  },
  {
    id: "IMP-0003",
    reporte: "IVA",
    periodo: "2026-04",
    tramo: "Tramo 1",
    creado: "2026-05-05",
    presentado: "Sí",
    pagado: "No",
    totalRegistros: 1530,
    totalMovimientos: 1530,
    totalMonto: "$ 12.300.000",
    totalRetenciones: "$ 2.460.000",
  },
  {
    id: "IMP-0004",
    reporte: "Débito/Crédito (Sellos)",
    periodo: "2026-06",
    tramo: "Tramo 3",
    creado: "2026-07-08",
    presentado: "No",
    pagado: "No",
    totalRegistros: 640,
    totalMovimientos: 640,
    totalMonto: "$ 3.210.000",
    totalRetenciones: "$ 320.000",
  },
];

const columns: Column<Impuesto>[] = [
  {
    key: "periodo",
    label: "Período",
    filterable: true,
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.periodo}</span>,
  },
  {
    key: "tramo",
    label: "Tramo",
    filterable: "enum",
    filterOptions: ["Tramo 1", "Tramo 2", "Tramo 3"],
    render: (r) => r.tramo,
  },
  {
    key: "creado",
    label: "Fecha de creación",
    filterable: "date",
    render: (r) => <span className="font-mono tabular-nums">{r.creado}</span>,
  },
  {
    key: "presentado",
    label: "Presentado",
    filterable: "enum",
    filterOptions: ["Sí", "No"],
    render: (r) => (
      <Badge tone={r.presentado === "Sí" ? "success" : "danger"}>{r.presentado}</Badge>
    ),
  },
  {
    key: "pagado",
    label: "Pagado",
    filterable: "enum",
    filterOptions: ["Sí", "No"],
    render: (r) => <Badge tone={r.pagado === "Sí" ? "success" : "danger"}>{r.pagado}</Badge>,
  },
];

export function ReporteImpuestos() {
  const [data, setData] = useState<Impuesto[]>(impuestosData);
  const [detalle, setDetalle] = useState<Impuesto | null>(null);
  const [generando, setGenerando] = useState(false);
  const [form, setForm] = useState({ fecha: "", impuesto: "", tramo: "" });

  const marcarPresentado = (id: string) => {
    setData((prev) => prev.map((d) => (d.id === id ? { ...d, presentado: "Sí" } : d)));
    setDetalle((prev) => (prev && prev.id === id ? { ...prev, presentado: "Sí" } : prev));
    toast.success("Reporte marcado como presentado");
  };

  const marcarPagado = (id: string) => {
    setData((prev) => prev.map((d) => (d.id === id ? { ...d, pagado: "Sí" } : d)));
    setDetalle((prev) => (prev && prev.id === id ? { ...prev, pagado: "Sí" } : prev));
    toast.success("Reporte marcado como pagado");
  };

  const generarReporte = () => {
    if (!form.fecha || !form.impuesto || !form.tramo) return;
    const nuevo = nuevoImpuesto(data.length, form);
    setData((prev) => [...prev, nuevo]);
    setForm({ fecha: "", impuesto: "", tramo: "" });
    setGenerando(false);
    toast.success("Reporte generado correctamente");
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Reportes de presentación de impuestos por período y tramo.
        </p>
        <BtnPrimary type="button" className="h-9 text-sm" onClick={() => setGenerando(true)}>
          <Plus size={14} /> Generar reporte
        </BtnPrimary>
      </div>

      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        pageSize={10}
        showDownloadButton={false}
        actions={(r) => (
          <div className="flex items-center gap-1">
            <BtnOutline
              className="h-7 px-2 text-xs"
              onClick={() => setDetalle(r)}
              title="Ver detalle"
            >
              <FileText size={14} /> Ver detalle
            </BtnOutline>
            <BtnOutline
              className="h-7 px-2 text-xs"
              onClick={() => downloadFile(`${r.reporte}_${r.periodo}.txt`, generarTxtImpuesto(r))}
              title="Descargar TXT"
            >
              <Download size={14} /> TXT
            </BtnOutline>
            <BtnOutline
              className="h-7 px-2 text-xs"
              onClick={() => downloadFile(`${r.reporte}_${r.periodo}.xml`, generarXmlImpuesto(r))}
              title="Descargar XML"
            >
              <Download size={14} /> XML
            </BtnOutline>
          </div>
        )}
      />

      {detalle && (
        <ImpuestoDetalleModal
          impuesto={detalle}
          onClose={() => setDetalle(null)}
          onMarcarPresentado={marcarPresentado}
          onMarcarPagado={marcarPagado}
        />
      )}

      {generando && (
        <FormDialog
          open
          onClose={() => setGenerando(false)}
          title="Generar reporte"
          description="Completá los datos para generar un nuevo reporte de impuesto."
          onSubmit={generarReporte}
          submitLabel="Generar reporte"
          size="md"
        >
          <div>
            <Label htmlFor="ri-fecha">Fecha</Label>
            <input
              id="ri-fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <Label htmlFor="ri-impuesto">Impuesto para el reporte</Label>
            <select
              id="ri-impuesto"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              value={form.impuesto}
              onChange={(e) => setForm((f) => ({ ...f, impuesto: e.target.value }))}
            >
              <option value="">Seleccionar impuesto</option>
              {IMPUESTOS_DISPONIBLES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ri-tramo">Tramo</Label>
            <select
              id="ri-tramo"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              value={form.tramo}
              onChange={(e) => setForm((f) => ({ ...f, tramo: e.target.value }))}
            >
              <option value="">Seleccionar tramo</option>
              <option value="Tramo 1">Tramo 1</option>
              <option value="Tramo 2">Tramo 2</option>
              <option value="Tramo 3">Tramo 3</option>
            </select>
          </div>
        </FormDialog>
      )}
    </div>
  );
}
