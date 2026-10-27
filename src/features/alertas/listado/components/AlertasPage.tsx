import { useNavigate } from "@tanstack/react-router";
import { Landmark, Loader2, RefreshCw } from "lucide-react";
import { BtnOutline, PageHeader } from "@/components/portal-shell";
import type { AlertItem } from "@/lib/api/compliance";
import { TablaServidor } from "../../comun/components/TablaServidor";
import { useAlertasListado } from "../hooks/useAlertasListado";
import { AlertaDetalleDialog } from "./AlertaDetalleDialog";
import { DictamenDialog } from "./DictamenDialog";
import { SimularDepositoDialog } from "./SimularDepositoDialog";
import { accionesAlerta, columnasAlertas } from "./columns";

/** Pantalla "Listado de alertas" de compliance. */
export function AlertasPage() {
  const navigate = useNavigate();
  const s = useAlertasListado();

  const getActions = (a: AlertItem) =>
    accionesAlerta(a, {
      verDetalle: s.setDetalle,
      aceptar: (x) => void s.aceptar(x),
      abrirDictamen: s.abrirDictamen,
      verOperacion: (txid) => navigate({ to: "/admin/general/movimientos", search: { txid } }),
    });

  return (
    <>
      <PageHeader
        title="Listado de alertas"
        description="Alertas generadas por el motor de monitoreo y el screening PLAFT."
        action={
          <div className="flex flex-wrap gap-2">
            <BtnOutline onClick={() => s.setSimOpen(true)}>
              <Landmark size={14} /> Simular depósito
            </BtnOutline>
            <BtnOutline onClick={() => void s.barrer()} disabled={s.barriendo}>
              {s.barriendo ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}{" "}
              Ejecutar barrido de compliance
            </BtnOutline>
          </div>
        }
      />

      <TablaServidor
        listado={s.listado}
        columns={columnasAlertas}
        rows={s.rows}
        total={s.total}
        getActions={getActions}
        loading={s.lista.isLoading}
        fetching={s.lista.isFetching}
        error={s.lista.isError ? (s.lista.error as Error).message : null}
        entidad="las alertas"
        onRetry={() => void s.lista.refetch()}
        onExport={() => void s.exportar()}
        emptyMessage="No hay alertas que coincidan con los filtros."
        countLabel="alerta(s)"
      />

      {s.detalle && (
        <AlertaDetalleDialog
          detalle={s.detalle}
          onClose={() => s.setDetalle(null)}
          onAceptar={(a) => void s.aceptar(a).then(() => s.setDetalle(null))}
          onDictamen={s.abrirDictamen}
        />
      )}

      {s.dictamen && (
        <DictamenDialog
          dictamen={s.dictamen}
          notas={s.notas}
          onNotasChange={s.setNotas}
          enviando={s.enviando}
          onClose={() => s.setDictamen(null)}
          onConfirm={() => void s.confirmarDictamen()}
        />
      )}

      {s.simOpen && (
        <SimularDepositoDialog onClose={() => s.setSimOpen(false)} onDone={s.refrescar} />
      )}
    </>
  );
}
