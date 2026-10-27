import { Plus } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { BtnPrimary, Input, Label, PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { DataAccessError } from "@/lib/api/errors";
import { useCategoriasPantalla } from "../hooks/useCategoriasPantalla";
import { PAGE_SIZE, type EstadoCategoria } from "../utils";
import { CategoriaFormModal } from "./CategoriaFormModal";
import { categoriaAcciones, categoriaColumns } from "./columns";
import { MensajeEstado } from "./MensajeEstado";

const BOTON_PAGINA =
  "inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed";

/** Administración de códigos de categoría para comercios. */
export function CategoriaComercioPage() {
  const p = useCategoriasPantalla();
  const { rows, total, isLoading, isFetching, isError, error, isEmpty, refetch } = p.listado;
  const { page, setPage } = p;

  const err = error instanceof DataAccessError ? error : null;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Códigos de categoría"
        description="Administración de códigos de categoría para comercios."
        action={
          <BtnPrimary type="button" onClick={() => p.setShowNew(true)} disabled={!p.puedeCrear}>
            <Plus size={14} /> Nueva categoría
          </BtnPrimary>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="buscar">Buscar</Label>
          <Input
            id="buscar"
            value={p.searchInput}
            onChange={(e) => p.cambiarBusqueda(e.target.value)}
            placeholder="Código, nombre o descripción…"
          />
        </div>
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={p.estadoFilter}
            onChange={(e) => p.cambiarEstadoFilter(e.target.value as EstadoCategoria | "")}
          >
            <option value="">Todos</option>
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando categorías…
        </div>
      ) : isError ? (
        <MensajeEstado
          tipo={err?.permission ? "permiso" : "error"}
          mensaje={err?.message ?? "Error desconocido"}
          onRetry={() => refetch()}
        />
      ) : isEmpty ? (
        <MensajeEstado tipo="vacio" mensaje="" />
      ) : (
        <>
          <DataTable
            columns={categoriaColumns}
            data={rows}
            keyExtractor={(r) => r.id}
            pageSize={PAGE_SIZE}
            showDownloadButton={false}
            actions={(r) => (
              <ActionsDropdown
                actions={categoriaAcciones(r, {
                  puedeModificar: p.puedeModificar,
                  puedeBorrar: p.puedeBorrar,
                  onCambiarEstado: p.cambiarEstado,
                  onEditar: p.setEditTarget,
                  onEliminar: p.setConfirmDelete,
                })}
              />
            )}
          />
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              {total} categoría(s) · página {page + 1} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((x) => Math.max(0, x - 1))}
                className={BOTON_PAGINA}
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPaginas || isFetching}
                onClick={() => setPage((x) => x + 1)}
                className={BOTON_PAGINA}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {(p.showNew || p.editTarget) && (
        <CategoriaFormModal categoria={p.editTarget} onClose={p.cerrarForm} onSave={p.guardar} />
      )}

      <ConfirmDialog
        open={!!p.confirmDelete}
        onClose={() => p.setConfirmDelete(null)}
        title="Eliminar categoría"
        message={`¿Estás seguro de eliminar la categoría "${p.confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={p.eliminar}
      />

      {p.confirmAction && (
        <ConfirmDialog
          open={!!p.confirmAction}
          onClose={() => p.setConfirmAction(null)}
          title={p.confirmAction.title}
          message={p.confirmAction.message}
          confirmLabel={p.confirmAction.confirmLabel}
          variant={p.confirmAction.variant}
          onConfirm={p.confirmAction.onConfirm}
        />
      )}
    </PermissionGuard>
  );
}
