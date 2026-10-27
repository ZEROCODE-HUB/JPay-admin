import { Plus } from "lucide-react";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { PermissionGuard } from "@/components/permission-guard";
import { ESTADOS_RESOLVER } from "@/lib/api/types";
import { DataAccessError } from "@/lib/api/errors";
import { AvisoDialog } from "../../components/AvisoDialog";
import { ListadoContenido } from "../../components/ListadoContenido";
import { ListadoFiltros } from "../../components/ListadoFiltros";
import { totalPaginas } from "../../listado";
import { useResolversPantalla } from "../hooks/useResolversPantalla";
import { PAGE_SIZE } from "../utils";
import { resolverAcciones, resolverColumns } from "./columns";
import { ResolverFormModal } from "./ResolverFormModal";

/** Pantalla de gestión de resolvers PCT. */
export function ResolversPage() {
  const p = useResolversPantalla();
  const { filtros, listado } = p;

  return (
    <PermissionGuard recurso="resolvers">
      <PageHeader
        title="Resolvers"
        description="Gestión de resolvers PCT (pagos con transferencia)."
        action={
          <BtnPrimary type="button" onClick={() => p.setShowNew(true)} disabled={!p.puedeCrear}>
            <Plus size={14} /> Nuevo resolver
          </BtnPrimary>
        }
      />

      <ListadoFiltros
        searchInput={filtros.searchInput}
        onSearchChange={filtros.cambiarBusqueda}
        placeholder="Nombre, CUIT o URL…"
        estadoFilter={filtros.estadoFilter}
        onEstadoChange={filtros.cambiarEstadoFilter}
        estados={ESTADOS_RESOLVER}
      />

      <ListadoContenido
        isLoading={listado.isLoading}
        isFetching={listado.isFetching}
        isError={listado.isError}
        err={listado.error instanceof DataAccessError ? listado.error : null}
        isEmpty={listado.isEmpty}
        onRetry={() => listado.refetch()}
        rows={listado.rows}
        total={listado.total}
        page={filtros.page}
        setPage={filtros.setPage}
        totalPaginas={totalPaginas(listado.total, PAGE_SIZE)}
        columns={resolverColumns}
        getActions={(row) =>
          resolverAcciones(row, {
            puedeModificar: p.puedeModificar,
            puedeBorrar: p.puedeBorrar,
            onCambiarEstado: p.cambiarEstado,
            onEditar: p.setEditTarget,
            onEliminar: p.setConfirmDelete,
          })
        }
        cargandoTexto="Cargando resolvers…"
        errorTitulo="Ocurrió un error al cargar los resolvers"
        vacioTexto="No hay resolvers que coincidan con la búsqueda."
        totalLabel="resolver(es)"
      />

      {(p.showNew || p.editTarget) && (
        <ResolverFormModal resolver={p.editTarget} onClose={p.cerrarForm} onSave={p.guardar} />
      )}

      <ConfirmDialog
        open={!!p.confirmDelete}
        onClose={() => p.setConfirmDelete(null)}
        title="Eliminar resolver"
        message={`¿Estás seguro de eliminar el resolver "${p.confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={p.eliminar}
      />

      <AvisoDialog confirmAction={p.confirmAction} onClose={p.cerrarAccion} />
    </PermissionGuard>
  );
}
