import { AlertTriangle } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import type { ListadoServidor } from "../hooks/useListadoServidor";
import { PAGE_SIZES, totalPaginas } from "../utils";

type Props<T extends { id: string }> = {
  listado: ListadoServidor;
  columns: Column<T>[];
  rows: T[];
  total: number;
  getActions: (row: T) => ActionItem[];
  loading: boolean;
  fetching: boolean;
  /** Mensaje de error de la query; si está, se muestra el bloque de error en lugar de la tabla. */
  error: string | null;
  /** "las alertas", "los bloqueos"… */
  entidad: string;
  onRetry: () => void;
  onExport: () => void;
  emptyMessage: string;
  countLabel: string;
};

/** Tabla con filtros server-side + paginación, o el bloque de error con "Reintentar". */
export function TablaServidor<T extends { id: string }>({
  listado,
  columns,
  rows,
  total,
  getActions,
  loading,
  fetching,
  error,
  entidad,
  onRetry,
  onExport,
  emptyMessage,
  countLabel,
}: Props<T>) {
  if (error !== null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 px-6 py-10 text-center text-sm text-danger-700">
        <AlertTriangle size={24} />
        <p>
          No se pudieron cargar {entidad}: {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => r.id}
        actions={(r) => <ActionsDropdown actions={getActions(r)} />}
        loading={loading}
        hidePagination
        serverFilterState={listado.panel}
        onServerFilterChange={listado.cambiarFiltros}
        serverResultCount={total}
        onDownloadCSV={onExport}
        emptyMessage={emptyMessage}
      />
      <Pagination
        page={listado.page + 1}
        totalPages={totalPaginas(total, listado.pageSize)}
        pageSize={listado.pageSize}
        total={total}
        countLabel={countLabel}
        pageSizes={PAGE_SIZES}
        disabled={fetching}
        onPageChange={(p) => listado.setPage(p - 1)}
        onPageSizeChange={listado.cambiarPageSize}
      />
    </>
  );
}
