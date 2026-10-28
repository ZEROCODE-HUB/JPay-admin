import { toast } from "sonner";
import { Badge, BtnOutline, Card } from "@/components/portal-shell";
import { useConciliacion, usePaisesMutaciones } from "@/hooks/usePaises";
import { formatDateTime } from "@/shared/format";
import { avisarError } from "../utils";

const TIPO: Record<string, string> = {
  falta_en_jpay: "Cobro en Ecart Pay que JPay no tiene",
  falta_en_proveedor: "Pago cobrado en JPay sin transacción en Ecart Pay",
  monto_distinto: "Monto distinto",
  estado_distinto: "Estado distinto",
};

const num = (v: unknown) => (typeof v === "number" ? v : 0);

/** Conciliación diaria con Ecart Pay: corridas y bandeja de diferencias. */
export function ConciliacionCard() {
  const { corridas, diferencias } = useConciliacion();
  const { conciliar, resolverDiferencia } = usePaisesMutaciones();
  const ultima = corridas.data?.[0];
  const abiertas = diferencias.data ?? [];

  const correr = () =>
    conciliar.mutate(undefined, {
      onSuccess: (r) =>
        toast.success(
          `Conciliación: ${num(r.transacciones)} transacciones, ${num(r.diferencias)} diferencias`,
        ),
      onError: avisarError,
    });

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Conciliación con Ecart Pay</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Todos los días se comparan los pagos de JPay con las transacciones de cada comercio
            (últimos 3 días). También guarda la comisión y el neto de Ecart Pay en cada pago.
          </p>
          {ultima && (
            <p className="text-xs mt-2">
              Última: {formatDateTime(ultima.ejecutadaAt)} ({ultima.origen}) ·{" "}
              {num(ultima.resumen.comercios)} comercios · {num(ultima.resumen.transacciones)}{" "}
              transacciones · {num(ultima.resumen.diferencias)} diferencias
              {ultima.error && <span className="text-danger-600"> · Error: {ultima.error}</span>}
            </p>
          )}
        </div>
        <BtnOutline onClick={correr} disabled={conciliar.isPending}>
          {conciliar.isPending ? "Conciliando…" : "Conciliar ahora"}
        </BtnOutline>
      </div>

      {diferencias.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : abiertas.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <Badge tone="success">Sin diferencias abiertas</Badge>
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border text-sm">
          {abiertas.map((d) => (
            <li key={d.id} className="py-2.5 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge tone="danger">{TIPO[d.tipo] ?? d.tipo}</Badge>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {d.ordenId && `Orden ${d.ordenId} · `}
                  {Object.entries(d.detalle)
                    .map(([k, v]) => `${k}: ${String(v)}`)
                    .join(" · ")}
                </p>
                <p className="text-[11px] text-muted-foreground">{formatDateTime(d.createdAt)}</p>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-secondary hover:underline disabled:opacity-50"
                disabled={resolverDiferencia.isPending}
                onClick={() =>
                  resolverDiferencia.mutate(
                    { id: d.id, nota: "Revisada desde el panel" },
                    { onSuccess: () => toast.success("Diferencia resuelta"), onError: avisarError },
                  )
                }
              >
                Marcar resuelta
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
