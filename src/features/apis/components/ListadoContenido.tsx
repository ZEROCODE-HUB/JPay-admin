import type { Dispatch, SetStateAction } from "react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import type { DataAccessError } from "@/lib/api/errors";
import { LISTADO_PAGE_SIZE } from "../listado";
import { ListadoMensajeEstado } from "./ListadoMensajeEstado";

/** Cuerpo de un listado de APIs: cargando / error / vacío / tabla con paginación de servidor. */
export function ListadoContenido<T extends { id: string }>({
  isLoading,
  isError,
  isEmpty,
  isFetching,
  err,
  onRetry,
  cargandoTexto,
  errorTitulo,
  vacioTexto,
  columns,
  rows,
  getActions,
  total,
  totalLabel,
  page,
  setPage,
  totalPaginas,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isFetching: boolean;
  err: DataAccessError | null;
  onRetry: () => void;
  cargandoTexto: string;
  errorTitulo: string;
  vacioTexto: string;
  columns: Column<T>[];
  rows: T[];
  getActions: (row: T) => ActionItem[];
  total: number;
  /** Ej.: "endpoint(s)". */
  totalLabel: string;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPaginas: number;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
        <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
        {cargandoTexto}
      </div>
    );
  }
  if (isError) {
    return (
      <ListadoMensajeEstado
        tipo={err?.permission ? "permiso" : "error"}
        mensaje={err?.message ?? "Error desconocido"}
        onRetry={onRetry}
        errorTitulo={errorTitulo}
        vacioTexto={vacioTexto}
      />
    );
  }
  if (isEmpty) {
    return (
      <ListadoMensajeEstado
        tipo="vacio"
        mensaje=""
        errorTitulo={errorTitulo}
        vacioTexto={vacioTexto}
      />
    );
  }
  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => r.id}
        pageSize={LISTADO_PAGE_SIZE}
        showDownloadButton={false}
        actions={(r) => <ActionsDropdown actions={getActions(r)} />}
      />
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>
          {total} {totalLabel} · página {page + 1} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0 || isFetching}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPaginas || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
