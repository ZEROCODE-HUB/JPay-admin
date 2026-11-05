import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { FormDialog } from "@/shared/ui/form-dialog";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { Badge, PageHeader } from "@/components/portal-shell";
import { listFondosPorUsuario, type FondoSubcuenta } from "@/lib/api/fondos";
import { cuentaDelPais } from "@/lib/cuenta-pais";
import { formatMoney } from "@/shared/format";

export const Route = createFileRoute("/admin/administracion/registros/")({
  head: () => ({ meta: [{ title: "Fondos por usuario — Admin Panel" }] }),
  component: Page,
});

function downloadExcel(filename: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const saldo = (r: FondoSubcuenta) => formatMoney(r.disponible + r.retenido, { moneda: r.moneda });

function Page() {
  const [viewing, setViewing] = useState<FondoSubcuenta | null>(null);
  const q = useQuery({ queryKey: ["fondos-por-usuario"], queryFn: listFondosPorUsuario });
  const filas = q.data ?? [];
  const cuenta = cuentaDelPais();

  const getActions = (r: FondoSubcuenta): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => setViewing(r) },
  ];

  const columns: Column<FondoSubcuenta>[] = [
    { key: "legajo", label: "Legajo", sortable: true, filterable: true, render: (r) => r.legajo },
    { key: "email", label: "Email", filterable: true, render: (r) => r.email },
    { key: "nombre", label: "Nombre", filterable: true, render: (r) => r.nombre },
    { key: "subcuenta", label: "Subcuenta", filterable: true, render: (r) => r.subcuenta },
    {
      key: "cuenta",
      label: cuenta,
      filterable: true,
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.cuenta ?? "—"}</span>,
    },
    {
      key: "disponible",
      label: "Disponible",
      sortable: true,
      render: (r) => (
        <span className="font-semibold font-mono text-xs">
          {formatMoney(r.disponible, { moneda: r.moneda })}
        </span>
      ),
    },
    {
      key: "retenido",
      label: "Retenido",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs">{formatMoney(r.retenido, { moneda: r.moneda })}</span>
      ),
    },
    {
      key: "activa",
      label: "Estado",
      render: (r) => (
        <Badge tone={r.activa ? "success" : "danger"}>{r.activa ? "Activa" : "Suspendida"}</Badge>
      ),
    },
  ];

  const excelRows = (data: FondoSubcuenta[]) =>
    data.map((r) => ({
      Legajo: r.legajo,
      Email: r.email,
      Nombre: r.nombre,
      Subcuenta: r.subcuenta,
      [cuenta]: r.cuenta ?? "",
      Moneda: r.moneda,
      Disponible: r.disponible,
      Retenido: r.retenido,
      Estado: r.activa ? "Activa" : "Suspendida",
    }));

  return (
    <>
      <PageHeader
        title="Fondos por usuario"
        description="Saldo disponible y retenido de cada subcuenta de los clientes"
        action={
          <button
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            disabled={!filas.length}
            onClick={() => {
              downloadExcel("fondos_por_usuario.xlsx", excelRows(filas));
              toast.success("Archivo Excel descargado correctamente");
            }}
          >
            <Download size={14} /> Descargar Excel
          </button>
        }
      />
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : q.isError ? (
        <p className="text-sm text-danger-600">{(q.error as Error).message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={filas}
          keyExtractor={(r) => r.id}
          pageSize={10}
          actions={(r) => <ActionsDropdown actions={getActions(r)} />}
          onDownloadCSV={() => downloadExcel("fondos_filtrados.xlsx", excelRows(filas))}
        />
      )}

      {viewing && (
        <FormDialog
          open={!!viewing}
          onClose={() => setViewing(null)}
          title="Detalle de fondo"
          description={`${viewing.nombre} — ${viewing.subcuenta}`}
          onSubmit={() => setViewing(null)}
          submitLabel="Cerrar"
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Legajo:</span>{" "}
              <span className="font-medium font-mono">{viewing.legajo}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              <span className="font-medium">{viewing.nombre}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium">{viewing.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{cuenta}:</span>{" "}
              <span className="font-medium font-mono text-xs">{viewing.cuenta ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Moneda:</span>{" "}
              <span className="font-medium">{viewing.moneda}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Disponible:</span>{" "}
              <span className="font-medium font-mono">
                {formatMoney(viewing.disponible, { moneda: viewing.moneda })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Retenido:</span>{" "}
              <span className="font-medium font-mono">
                {formatMoney(viewing.retenido, { moneda: viewing.moneda })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Saldo total:</span>{" "}
              <span className="font-medium font-mono">{saldo(viewing)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>{" "}
              <span className="font-medium">{viewing.activa ? "Activa" : "Suspendida"}</span>
            </div>
          </div>
        </FormDialog>
      )}
    </>
  );
}
