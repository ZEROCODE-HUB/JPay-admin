import { useMemo } from "react";
import { AlertTriangle, Edit3, Eye, Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { BtnPrimary } from "@/components/portal-shell";
import { LegajoCell } from "@/components/legajo-label";
import type { ClientBlockParameter } from "@/lib/api/alert-rules";
import type { ParametrosClientes } from "../hooks/useParametrosClientes";
import { PAGE_SIZES, fmtUmbral } from "../utils";

/** Tarjeta "Parámetros de usuarios": grilla paginada de umbrales individuales. */
export function ParametrosUsuariosCard({ c }: { c: ParametrosClientes }) {
  const { lista, filas, total, page, pageSize, filtros, totalPaginas } = c;

  const getActions = (r: ClientBlockParameter): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => c.setViendo(r) },
    { label: "Editar", icon: Edit3, onClick: () => c.abrirEditar(r) },
    { label: "Eliminar", icon: Trash2, variant: "danger", onClick: () => c.setBorrando(r) },
  ];

  const columns: Column<ClientBlockParameter>[] = useMemo(
    () => [
      {
        key: "legajo",
        label: "Legajo",
        filterable: true,
        render: (r) => <LegajoCell legajo={r.legajo} />,
      },
      { key: "correo", label: "Usuario (correo)", filterable: true, render: (r) => r.correo },
      {
        key: "persona",
        label: "Cantidad de salarios mínimos depositados por persona",
        render: (r) => (
          <span
            className={`font-mono tabular-nums ${r.individualMinWages == null ? "text-muted-foreground" : ""}`}
          >
            {fmtUmbral(r.individualMinWages)}
          </span>
        ),
      },
      {
        key: "empresa",
        label: "Cantidad de salarios mínimos depositados por empresa",
        render: (r) => (
          <span
            className={`font-mono tabular-nums ${r.companyMinWages == null ? "text-muted-foreground" : ""}`}
          >
            {fmtUmbral(r.companyMinWages)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-card border rounded-lg p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            Parámetros de usuarios
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Umbrales de depósitos configurados individualmente por usuario (reemplazan a los
            generales)
          </p>
        </div>
        <BtnPrimary onClick={c.abrirNuevo}>
          <Plus size={14} /> Agregar nuevos parámetros de usuario
        </BtnPrimary>
      </div>

      {lista.isError ? (
        <div className="flex items-center gap-2 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
          <AlertTriangle size={14} /> No se pudieron cargar los parámetros:{" "}
          {(lista.error as Error).message}
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filas}
            keyExtractor={(r) => r.id}
            actions={(r) => <ActionsDropdown actions={getActions(r)} />}
            loading={lista.isLoading}
            hidePagination
            serverFilterState={filtros}
            onServerFilterChange={c.cambiarFiltros}
            serverResultCount={total}
            onDownloadCSV={() => void c.exportar()}
            emptyMessage="No hay parámetros individuales cargados."
          />
          <Pagination
            page={page + 1}
            totalPages={totalPaginas}
            pageSize={pageSize}
            total={total}
            countLabel="usuario(s)"
            pageSizes={PAGE_SIZES}
            disabled={lista.isFetching}
            onPageChange={(p) => c.setPage(p - 1)}
            onPageSizeChange={c.cambiarPageSize}
          />
        </>
      )}
    </div>
  );
}
