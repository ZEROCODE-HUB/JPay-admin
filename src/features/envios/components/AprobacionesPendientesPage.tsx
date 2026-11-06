import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card, PageHeader } from "@/components/portal-shell";
import { avisarError } from "@/features/configuracion/paises/utils";
import { useAprobacionesCobre, useCobreAdminMutaciones } from "@/hooks/useCobre";
import { formatDateTime, formatMoney } from "@/shared/format";

/**
 * Envíos > Aprobaciones pendientes: transferencias SPEI, envíos en dólares y lotes que pasan el
 * monto de aprobación de Cobre. Al aprobar sale a Cobre; al rechazar se libera el saldo.
 */
export function AprobacionesPendientesPage() {
  const { aprobaciones, lotes } = useAprobacionesCobre();
  const m = useCobreAdminMutaciones();
  const cargando = aprobaciones.isLoading || lotes.isLoading;
  const error = aprobaciones.error ?? lotes.error;
  const vacio = (aprobaciones.data ?? []).length === 0 && (lotes.data ?? []).length === 0;

  const decidir = (id: string, aprobar: boolean, lote = false) =>
    m.decidir.mutate(
      {
        id,
        aprobar,
        lote,
        nota: aprobar ? "Aprobada desde el backoffice" : "Rechazada desde el backoffice",
      },
      {
        onSuccess: () =>
          toast.success(aprobar ? "Aprobado: sale a Cobre" : "Rechazado: se liberó el saldo"),
        onError: avisarError,
      },
    );

  return (
    <>
      <PageHeader
        title="Aprobaciones pendientes"
        description="Envíos que pasan el monto de aprobación configurado en Integraciones (Cobre). Se actualiza cada 30 segundos."
      />
      <Card>
        <h3 className="font-semibold">Esperando aprobación</h3>
        {cargando ? (
          <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
        ) : error ? (
          <p className="mt-2 text-sm text-danger-600">{error.message}</p>
        ) : vacio ? (
          <p className="mt-2 text-sm text-muted-foreground">No hay envíos pendientes.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border text-sm">
            {(aprobaciones.data ?? []).map((t) => (
              <li key={t.id} className="py-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium tabular-nums">
                    {formatMoney(t.monto, { moneda: t.moneda })} · {t.legajo}{" "}
                    <Badge tone="neutral">{t.tipo.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    A {t.destinatario ?? "—"} · {t.concepto ?? ""} · {formatDateTime(t.creadaAt)} ·{" "}
                    {t.idTxn}
                  </div>
                </div>
                <div className="flex gap-2">
                  <BtnOutline disabled={m.decidir.isPending} onClick={() => decidir(t.id, false)}>
                    Rechazar
                  </BtnOutline>
                  <BtnPrimary disabled={m.decidir.isPending} onClick={() => decidir(t.id, true)}>
                    Aprobar
                  </BtnPrimary>
                </div>
              </li>
            ))}
            {(lotes.data ?? []).map((l) => (
              <li key={l.id} className="py-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium tabular-nums">
                    Lote de {l.cantidad} pagos · {formatMoney(l.total)} · {l.legajo}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(l.creadoAt)}</div>
                </div>
                <div className="flex gap-2">
                  <BtnOutline
                    disabled={m.decidir.isPending}
                    onClick={() => decidir(l.id, false, true)}
                  >
                    Rechazar
                  </BtnOutline>
                  <BtnPrimary
                    disabled={m.decidir.isPending}
                    onClick={() => decidir(l.id, true, true)}
                  >
                    Aprobar
                  </BtnPrimary>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
