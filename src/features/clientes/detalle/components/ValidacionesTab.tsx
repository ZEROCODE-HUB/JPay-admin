import { Download, RefreshCw } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import { downloadCSV } from "../utils";
import { validacionesColumns } from "./columns";
import { Seccion } from "./Seccion";

export function ValidacionesTab({
  data,
  forzando,
  forzarNuevaValidacion,
}: {
  data: ClienteDetalleData;
  forzando: boolean;
  forzarNuevaValidacion: () => void;
}) {
  const { validacionesQuery } = data;

  return (
    <Seccion
      titulo="Validaciones automáticas"
      loading={validacionesQuery.isLoading}
      error={validacionesQuery.isError ? validacionesQuery.error : null}
      onRetry={validacionesQuery.refetch}
      vacio={!validacionesQuery.isLoading && (validacionesQuery.data?.length ?? 0) === 0}
    >
      <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={forzarNuevaValidacion}
          disabled={forzando}
          className="inline-flex items-center gap-1.5 h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <RefreshCw size={16} className={forzando ? "animate-spin" : ""} /> Forzar nueva validación
        </button>
        <button
          type="button"
          onClick={() =>
            downloadCSV("validaciones.csv", [
              ["Proveedor", "Estado", "Fecha"],
              ...(validacionesQuery.data ?? []).map((v) => [v.proveedor, v.estado, v.fecha]),
            ])
          }
          className="inline-flex items-center gap-1.5 h-9 rounded-md border border-input px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Download size={16} /> Descargar CSV
        </button>
      </div>
      <DataTable
        columns={validacionesColumns}
        data={validacionesQuery.data ?? []}
        keyExtractor={(v) => v.id}
        emptyMessage="Sin validaciones para este cliente"
        showDownloadButton={false}
      />
    </Seccion>
  );
}
