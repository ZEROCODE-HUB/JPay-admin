import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { pageTitle } from "@/brand/brand";
import { PageHeader, BtnPrimary } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataAccessError } from "@/lib/api/errors";
import { useComerciosGestion } from "@/features/comercios/gestion/hooks/useComerciosGestion";
import { ComerciosFiltros } from "@/features/comercios/gestion/components/ComerciosFiltros";
import { ComerciosTabla } from "@/features/comercios/gestion/components/ComerciosTabla";
import { ComercioDetalle } from "@/features/comercios/gestion/components/ComercioDetalle";
import { ComercioFormModal } from "@/features/comercios/gestion/components/ComercioFormModal";
import { MensajeEstado } from "@/features/comercios/gestion/components/MensajeEstado";

export const Route = createFileRoute("/admin/comercios/gestion/")({
  component: Page,
  head: () => ({
    meta: [
      { title: pageTitle("Gestión de comercios — Admin") },
      {
        name: "description",
        content:
          "Gestión centralizada de comercios y su asociación a los canales de la plataforma.",
      },
    ],
  }),
});

function Page() {
  const s = useComerciosGestion();
  const { isLoading, isError, error, isEmpty, refetch } = s.listado;
  const err = error instanceof DataAccessError ? error : null;

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Comercios"
        description="Listado centralizado de comercios de la plataforma, recuperados desde la base de datos."
        action={
          <BtnPrimary
            type="button"
            onClick={() => s.setShowNew(true)}
            disabled={!s.puedeCrear || !s.clientes}
          >
            <Plus size={14} /> Nuevo comercio
          </BtnPrimary>
        }
      />

      <ComerciosFiltros s={s} />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando comercios…
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
        <ComerciosTabla s={s} />
      )}

      {s.detail && <ComercioDetalle comercio={s.detail} onClose={() => s.setDetail(null)} />}

      {(s.showNew || s.editTarget) && (
        <ComercioFormModal
          comercio={s.editTarget}
          clientes={s.clientes ?? []}
          categorias={s.categorias ?? []}
          adminUsers={s.adminUsers ?? []}
          isSaving={s.isSaving}
          onClose={s.cerrarForm}
          onSave={s.guardar}
        />
      )}

      <ConfirmDialog
        open={!!s.confirmDelete}
        onClose={s.cerrarDeshabilitar}
        title="Deshabilitar comercio"
        message={`¿Deshabilitar el comercio "${s.confirmDelete?.usuario}"? El comercio pasará a estado "Desactivado" y no podrá operar. Esta acción queda registrada en el historial.`}
        confirmLabel="Deshabilitar"
        variant="danger"
        onConfirm={s.deshabilitar}
        extraContent={
          <div className="mt-3">
            <label className="text-xs font-semibold">Motivo de deshabilitación (requerido)</label>
            <textarea
              value={s.deshabilitarMotivo}
              onChange={(e) => s.setDeshabilitarMotivo(e.target.value)}
              rows={3}
              placeholder="Motivo de la deshabilitación..."
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        }
      />

      {s.confirmAction && (
        <ConfirmDialog
          open={!!s.confirmAction}
          onClose={() => s.setConfirmAction(null)}
          title={s.confirmAction.title}
          message={s.confirmAction.message}
          confirmLabel={s.confirmAction.confirmLabel}
          variant={s.confirmAction.variant}
          onConfirm={s.confirmAction.onConfirm}
        />
      )}
    </PermissionGuard>
  );
}
