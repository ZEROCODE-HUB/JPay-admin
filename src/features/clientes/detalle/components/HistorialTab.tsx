import { DataTable } from "@/shared/ui/data-table";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import { historialColumns } from "./columns";
import { Seccion } from "./Seccion";

export function HistorialTab({ data }: { data: ClienteDetalleData }) {
  const { historialCambiosQuery } = data;

  return (
    <Seccion
      titulo="Historial de cambios"
      loading={historialCambiosQuery.isLoading}
      error={historialCambiosQuery.isError ? historialCambiosQuery.error : null}
      onRetry={historialCambiosQuery.refetch}
      vacio={!historialCambiosQuery.isLoading && (historialCambiosQuery.data?.length ?? 0) === 0}
    >
      <DataTable
        columns={historialColumns}
        data={historialCambiosQuery.data ?? []}
        keyExtractor={(r) => r.id}
        emptyMessage="Sin cambios registrados para este cliente"
      />
    </Seccion>
  );
}
