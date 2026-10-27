import { Plus } from "lucide-react";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { PermissionGuard } from "@/components/permission-guard";
import type { ApiEndpoint } from "@/lib/api/types";
import { AvisoDialog } from "../../components/AvisoDialog";
import { ListadoContenido } from "../../components/ListadoContenido";
import { useEndpointsApi } from "../hooks/useEndpointsApi";
import { endpointAcciones, endpointsColumns } from "./columns";
import { EndpointFormModal } from "./EndpointFormModal";
import { EndpointsFiltros } from "./EndpointsFiltros";

/** Pantalla "Endpoints" (APIs externas). */
export function EndpointsPage() {
  const s = useEndpointsApi();

  const getActions = (row: ApiEndpoint) =>
    endpointAcciones(row, {
      puedeModificar: s.puedeModificar,
      puedeBorrar: s.puedeBorrar,
      onEditar: s.setEditTarget,
      onCambiarEstado: s.cambiarEstado,
      onEliminar: s.setConfirmDelete,
    });

  return (
    <PermissionGuard recurso="apis_externas">
      <PageHeader
        title="Endpoints"
        description="Endpoints disponibles de las APIs externas de la plataforma."
        action={
          <BtnPrimary type="button" onClick={() => s.setShowNew(true)} disabled={!s.puedeCrear}>
            <Plus size={14} /> Nuevo endpoint
          </BtnPrimary>
        }
      />

      <EndpointsFiltros s={s} />

      <ListadoContenido
        isLoading={s.isLoading}
        isError={s.isError}
        isEmpty={s.isEmpty}
        isFetching={s.isFetching}
        err={s.err}
        onRetry={() => s.refetch()}
        cargandoTexto="Cargando endpoints…"
        errorTitulo="Ocurrió un error al cargar los endpoints"
        vacioTexto="No hay endpoints que coincidan con la búsqueda."
        columns={endpointsColumns}
        rows={s.rows}
        getActions={getActions}
        total={s.total}
        totalLabel="endpoint(s)"
        page={s.page}
        setPage={s.setPage}
        totalPaginas={s.totalPaginas}
      />

      {(s.showNew || s.editTarget) && (
        <EndpointFormModal
          endpoint={s.editTarget}
          onClose={s.cerrarFormulario}
          onSave={s.guardar}
        />
      )}

      <ConfirmDialog
        open={!!s.confirmDelete}
        onClose={() => s.setConfirmDelete(null)}
        title="Eliminar endpoint"
        message={`¿Estás seguro de eliminar el endpoint "${s.confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={s.eliminar}
      />

      <AvisoDialog confirmAction={s.confirmAction} onClose={() => s.setConfirmAction(null)} />
    </PermissionGuard>
  );
}
