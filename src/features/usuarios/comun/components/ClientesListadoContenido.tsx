import { DataTable, type Column } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { DataAccessError } from "@/lib/api/errors";
import type { ClientesListado } from "../hooks/useClientesListado";
import { EstadoClienteFiltro } from "./EstadoClienteFiltro";
import { EstadoMensaje } from "./EstadoMensaje";

const PAGE_SIZES = [10, 20, 50];

/** Cargando / error / vacío / tabla + paginación del listado de clientes. */
export function ClientesListadoContenido<T extends { legajo: string }>({
  listado,
  columns,
  data,
  getActions,
  cargandoTexto,
  errorTitulo,
  vacioTexto,
  agruparMensaje,
  countLabel,
}: {
  listado: ClientesListado;
  columns: Column<T>[];
  data: T[];
  getActions: (row: T) => ActionItem[];
  cargandoTexto: string;
  errorTitulo: string;
  vacioTexto: string;
  agruparMensaje?: boolean;
  countLabel: string;
}) {
  const { isLoading, isError, isEmpty, error, refetch, total, page, pageSize } = listado;
  const err = error instanceof DataAccessError ? error : null;
  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));

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
      <EstadoMensaje
        tipo={err?.permission ? "permiso" : "error"}
        mensaje={err?.message ?? "Error desconocido"}
        onRetry={() => refetch()}
        errorTitulo={errorTitulo}
        vacioTexto={vacioTexto}
        agrupado={agruparMensaje}
      />
    );
  }
  if (isEmpty) {
    return (
      <EstadoMensaje
        tipo="vacio"
        mensaje=""
        errorTitulo={errorTitulo}
        vacioTexto={vacioTexto}
        agrupado={agruparMensaje}
      />
    );
  }
  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.legajo}
        actions={(r) => <ActionsDropdown actions={getActions(r)} />}
        hidePagination
        serverFilterState={listado.filtrosPanel}
        onServerFilterChange={listado.aplicarFiltros}
        serverResultCount={total}
        extraFilters={
          <EstadoClienteFiltro
            value={listado.filtroEstado}
            onChange={listado.cambiarFiltroEstado}
          />
        }
      />
      <Pagination
        page={page + 1}
        totalPages={totalPaginas}
        pageSize={pageSize}
        total={total}
        countLabel={countLabel}
        pageSizes={PAGE_SIZES}
        disabled={listado.isFetching}
        onPageChange={(p) => listado.setPage(p - 1)}
        onPageSizeChange={listado.cambiarPageSize}
      />
    </>
  );
}
