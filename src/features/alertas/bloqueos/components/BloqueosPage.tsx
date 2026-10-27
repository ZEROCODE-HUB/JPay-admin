import { useNavigate } from "@tanstack/react-router";
import { ArrowRightLeft, CheckCircle, Eye, Plus, Unlock } from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import type { ActionItem } from "@/components/actions-dropdown";
import { BtnPrimary, PageHeader } from "@/components/portal-shell";
import type { AccountBlock } from "@/lib/api/compliance";
import { TablaServidor } from "../../comun/components/TablaServidor";
import { useBloqueosListado } from "../hooks/useBloqueosListado";
import { BloqueoDetalleDialog, LiberarBloqueoDialog } from "./BloqueoDialogs";
import { columnasBloqueos } from "./columns";
import { NuevoBloqueoDialog } from "./NuevoBloqueoDialog";

/** Listado de bloqueos preventivos (vigentes e históricos). */
export function BloqueosPage() {
  const navigate = useNavigate();
  const s = useBloqueosListado();

  const getActions = (b: AccountBlock): ActionItem[] => [
    { label: "Ver detalle", icon: Eye, onClick: () => s.setDetalle(b) },
    ...(b.complianceStatus === "pending"
      ? [{ label: "Aceptar (Compliance)", icon: CheckCircle, onClick: () => s.setAceptando(b) }]
      : []),
    ...(b.blockStatus === "active"
      ? [
          {
            label: "Desbloquear",
            icon: Unlock,
            variant: "danger" as const,
            onClick: () => s.abrirLiberacion(b),
          },
        ]
      : []),
    ...(b.idTxn
      ? [
          {
            label: "Ver operación",
            icon: ArrowRightLeft,
            onClick: () =>
              navigate({ to: "/admin/general/movimientos", search: { txid: b.idTxn! } }),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Listado de bloqueos"
        description="Bloqueos preventivos vigentes e históricos. Un bloqueo activo impide los egresos de la cuenta o subcuenta y retiene los depósitos entrantes."
        action={
          <BtnPrimary onClick={() => s.setNuevo(true)}>
            <Plus size={14} /> Nuevo bloqueo manual
          </BtnPrimary>
        }
      />

      <TablaServidor
        listado={s.listado}
        columns={columnasBloqueos}
        rows={s.rows}
        total={s.total}
        getActions={getActions}
        loading={s.lista.isLoading}
        fetching={s.lista.isFetching}
        error={s.lista.isError ? (s.lista.error as Error).message : null}
        entidad="los bloqueos"
        onRetry={() => s.lista.refetch()}
        onExport={() => void s.exportar()}
        emptyMessage="No hay bloqueos que coincidan con los filtros."
        countLabel="bloqueo(s)"
      />

      {s.detalle && <BloqueoDetalleDialog detalle={s.detalle} onClose={() => s.setDetalle(null)} />}

      <ConfirmDialog
        open={s.aceptando !== null}
        onClose={() => s.setAceptando(null)}
        onConfirm={s.aceptar}
        title="Aceptar bloqueo"
        message="Compliance confirma el bloqueo. La cuenta sigue bloqueada hasta que se libere explícitamente."
        confirmLabel="Aceptar"
      />

      {s.liberando && (
        <LiberarBloqueoDialog
          liberando={s.liberando}
          notas={s.notas}
          onNotasChange={s.setNotas}
          enviando={s.enviando}
          onClose={() => s.setLiberando(null)}
          onSubmit={() => void s.liberar()}
        />
      )}

      {s.nuevo && <NuevoBloqueoDialog onClose={() => s.setNuevo(false)} onDone={s.refrescar} />}
    </>
  );
}
