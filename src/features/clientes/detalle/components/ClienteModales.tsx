import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatCuit, formatDate, formatMoney } from "@/shared/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FormDialog } from "@/shared/ui/form-dialog";
import { AlertaGestionModal } from "@/components/alerta-gestion";
import { DetailModal, MovimientoDetail } from "@/components/movimiento-detail";
import { registrarEvaluacionRiesgo, updatePerfilTransaccional } from "@/lib/api/clientes";
import { useCambiarEstadoMovimiento } from "@/hooks/useMovimientoActions";
import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { ALERTA_PARAM_DEF, BLOQUEO_PARAM_DEF } from "../utils";
import { ApiDetalleModal } from "./ApiDetalleModal";
import { ExencionModal } from "./ExencionModal";
import { ModulosModales } from "./ModulosModales";
import { ParametrosEditorModal } from "./ParametrosEditorModal";
import { PlaftPerfilModal } from "./PlaftPerfilModal";
import { PlaftRiesgoModal } from "./PlaftRiesgoModal";

/** Modales de la ficha que viven a nivel pantalla (su estado sobrevive al cambio de pestaña). */
export function ClienteModales({
  legajo,
  cliente,
  data,
  ui,
}: {
  legajo: string;
  cliente: Cliente;
  data: ClienteDetalleData;
  ui: ClienteDetalleUi;
}) {
  const queryClient = useQueryClient();
  const {
    evaluacionesQuery,
    riesgoVigente,
    paramAlertasQuery,
    paramBloqueosQuery,
    apiCantidadReal,
    catalogoEstados,
  } = data;
  const {
    apiDetalleOpen,
    setApiDetalleId,
    apiDetalleId,
    editAlertasOpen,
    setEditAlertasOpen,
    editBloqueosOpen,
    setEditBloqueosOpen,
    editRiesgoOpen,
    setEditRiesgoOpen,
    editPerfilOpen,
    setEditPerfilOpen,
    gestionTarget,
    setGestionTarget,
    setGestiones,
    exencionOpen,
    setExencionOpen,
    movDetail,
    setMovDetail,
    impuestoDetail,
    setImpuestoDetail,
    estadoTarget,
    setEstadoTarget,
    confirmAction,
    setConfirmAction,
  } = ui;
  const cambiarMovimientoEstado = useCambiarEstadoMovimiento();

  const registrarRiesgoMutation = useMutation({
    mutationFn: registrarEvaluacionRiesgo,
    onSuccess: () => {
      toast.success("Nivel de riesgo actualizado");
      void evaluacionesQuery.refetch();
      void queryClient.invalidateQueries({ queryKey: ["clientes-enrichment"] });
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setEditRiesgoOpen(false);
    },
    onError: (e: unknown) => {
      toast.error((e as Error).message ?? "No se pudo registrar la evaluación");
    },
  });

  const updatePerfilMutation = useMutation({
    mutationFn: updatePerfilTransaccional,
    onSuccess: () => {
      toast.success("Perfil transaccional actualizado");
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
      void queryClient.invalidateQueries({ queryKey: ["clientes-enrichment"] });
      setEditPerfilOpen(false);
    },
    onError: (e: unknown) => {
      toast.error((e as Error).message ?? "No se pudo actualizar el perfil");
    },
  });

  return (
    <>
      <ModulosModales data={data} ui={ui} />

      <ApiDetalleModal
        open={apiDetalleOpen}
        onClose={() => setApiDetalleId(null)}
        apiUsuarioId={apiDetalleId}
        cantidad={apiCantidadReal}
      />

      {/* Edición de parámetros dentro del contexto del usuario */}
      <ParametrosEditorModal
        open={editAlertasOpen}
        onClose={() => setEditAlertasOpen(false)}
        title="Parámetros de alertas automáticas"
        legajo={legajo}
        defs={ALERTA_PARAM_DEF}
        stored={paramAlertasQuery.data ?? []}
        kind="alerta"
      />
      <ParametrosEditorModal
        open={editBloqueosOpen}
        onClose={() => setEditBloqueosOpen(false)}
        title="Parámetros de bloqueos"
        legajo={legajo}
        defs={BLOQUEO_PARAM_DEF}
        stored={paramBloqueosQuery.data ?? []}
        kind="bloqueo"
      />

      {/* PLAFT: Nivel de Riesgo */}
      <PlaftRiesgoModal
        open={editRiesgoOpen}
        onClose={() => setEditRiesgoOpen(false)}
        legajo={legajo}
        vigente={riesgoVigente ?? null}
        loading={registrarRiesgoMutation.isPending}
        onSubmit={(nivel, motivo, vigenteHasta) =>
          registrarRiesgoMutation.mutate({ legajo, nivel, motivo, vigenteHasta })
        }
      />

      {/* PLAFT: Perfil Transaccional */}
      <PlaftPerfilModal
        open={editPerfilOpen}
        onClose={() => setEditPerfilOpen(false)}
        clienteId={cliente.id}
        initial={{
          limiteTransferencia: cliente.limiteTransferencia ?? null,
          limiteOpsDiarias: cliente.limiteOpsDiarias ?? null,
          limiteMontoDiario: cliente.limiteMontoDiario ?? null,
        }}
        cuit={formatCuit(cliente.cuit)}
        loading={updatePerfilMutation.isPending}
        onSubmit={(input) => updatePerfilMutation.mutate({ clienteId: cliente.id, ...input })}
      />

      <AlertaGestionModal
        open={!!gestionTarget}
        onClose={() => setGestionTarget(null)}
        resumen={gestionTarget?.resumen ?? ""}
        onGuardar={(g) => {
          if (gestionTarget) {
            setGestiones((prev) => ({ ...prev, [gestionTarget.id]: g }));
          }
        }}
      />

      <ExencionModal
        open={exencionOpen}
        onClose={() => setExencionOpen(false)}
        legajo={cliente.legajo}
        cuitDefault={cliente.cuit}
      />

      {movDetail && <MovimientoDetail m={movDetail} onClose={() => setMovDetail(null)} />}

      {impuestoDetail && (
        <DetailModal
          title="Detalle de impuesto asignado"
          onClose={() => setImpuestoDetail(null)}
          rows={[
            {
              label: "Impuesto",
              value: impuestoDetail.impuesto?.nombre ?? impuestoDetail.impuestoId,
            },
            { label: "Código", value: impuestoDetail.impuesto?.codigo ?? "—" },
            { label: "Tipo", value: impuestoDetail.impuesto?.tipo ?? impuestoDetail.tipo },
            {
              label: "Monto / Tasa",
              value:
                (impuestoDetail.impuesto?.tipo ?? impuestoDetail.tipo) === "Porcentaje"
                  ? `${impuestoDetail.impuesto?.monto ?? impuestoDetail.monto ?? 0} %`
                  : formatMoney(impuestoDetail.impuesto?.monto ?? impuestoDetail.monto),
            },
            { label: "Fecha asignación", value: formatDate(impuestoDetail.fechaAsignacion) },
            { label: "Estado", value: impuestoDetail.estado },
            { label: "Legajo", value: impuestoDetail.clienteLegajo },
          ]}
        />
      )}

      {estadoTarget && (
        <FormDialog
          open
          onClose={() => setEstadoTarget(null)}
          title="Cambiar estado del movimiento"
          description={`Transición atómica registrada en el historial (origen = manual). Estado actual: ${estadoTarget.estadoActual}.`}
          onSubmit={async () => {
            await cambiarMovimientoEstado.mutateAsync({
              movimientoId: estadoTarget.dbId,
              nuevoEstadoId: estadoTarget.nuevoId,
              observaciones: "Cambio manual desde ficha de cliente",
            });
            setEstadoTarget(null);
          }}
          submitLabel={cambiarMovimientoEstado.isPending ? "Guardando…" : "Confirmar cambio"}
          size="md"
        >
          {cambiarMovimientoEstado.isError && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{(cambiarMovimientoEstado.error as Error).message}</span>
            </div>
          )}
          <div>
            <label htmlFor="nuevo-estado-cli" className="text-sm font-medium">
              Nuevo estado
            </label>
            <select
              id="nuevo-estado-cli"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-sm"
              value={estadoTarget.nuevoId}
              onChange={(e) =>
                setEstadoTarget((s) => (s ? { ...s, nuevoId: Number(e.target.value) } : s))
              }
            >
              {catalogoEstados.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codigo} — {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </FormDialog>
      )}

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          variant={confirmAction.variant}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </>
  );
}
