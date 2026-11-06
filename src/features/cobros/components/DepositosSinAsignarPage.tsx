import { toast } from "sonner";
import { Badge, Card, PageHeader } from "@/components/portal-shell";
import { avisarError } from "@/features/configuracion/paises/utils";
import { useCobreAdminMutaciones, useDepositosSinAsignar } from "@/hooks/useCobre";
import { formatDateTime, formatMoney } from "@/shared/format";

const DEVOLUCION: Record<
  string,
  { label: string; tone: "success" | "warn" | "danger" | "neutral" }
> = {
  pendiente: { label: "Devolviendo", tone: "warn" },
  pendiente_aprobacion: { label: "Devolución por aprobar", tone: "warn" },
  completada: { label: "Devuelto", tone: "success" },
  rechazada: { label: "Devolución rechazada", tone: "danger" },
  fallida: { label: "Devolución fallida", tone: "danger" },
  cancelada: { label: "Devolución cancelada", tone: "neutral" },
};

/** Cobros > Depósitos sin asignar: SPEI que llegó a un Balance o CLABE sin comercio. */
export function DepositosSinAsignarPage() {
  const sinAsignar = useDepositosSinAsignar();
  const m = useCobreAdminMutaciones();

  return (
    <>
      <PageHeader
        title="Depósitos sin asignar"
        description="Llegaron a un Balance o CLABE que no es de ningún comercio: no se acreditaron a nadie. Puedes devolverlos al remitente (el monto completo, una sola vez)."
      />
      <Card>
        <h3 className="font-semibold">Depósitos sin dueño</h3>
        {sinAsignar.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
        ) : sinAsignar.error ? (
          <p className="mt-2 text-sm text-danger-600">{sinAsignar.error.message}</p>
        ) : (sinAsignar.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Todos los depósitos tienen dueño.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border text-sm">
            {sinAsignar.data!.map((d) => (
              <li key={d.id} className="py-2 flex flex-wrap justify-between gap-2">
                <span>
                  {d.remitente ?? "Sin remitente"} · CLABE{" "}
                  <span className="font-mono">{d.clabe ?? "—"}</span>
                </span>
                <span className="flex items-center gap-3 tabular-nums">
                  {d.devolucion && !["rechazada", "fallida", "cancelada"].includes(d.devolucion) ? (
                    <Badge tone={DEVOLUCION[d.devolucion]?.tone ?? "warn"}>
                      {DEVOLUCION[d.devolucion]?.label ?? d.devolucion}
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-semibold text-danger-600 hover:underline disabled:opacity-50"
                      disabled={m.devolver.isPending}
                      onClick={() =>
                        m.devolver.mutate(d.id, {
                          onSuccess: () => toast.success("Devolución enviada a Cobre"),
                          onError: avisarError,
                        })
                      }
                    >
                      Devolver
                    </button>
                  )}
                  {formatMoney(d.monto)}{" "}
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(d.recibidoAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
