import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/portal-shell";
import { ConexionesComerciosCard } from "@/features/configuracion/paises/components/ConexionesComerciosCard";
import { useConexionesComercios } from "@/hooks/usePaises";
import {
  getRetirosEcartPayComercio,
  listCobrosEcartPayCliente,
} from "@/lib/api/comercios-ecartpay";
import { formatDateTime, formatMoney } from "@/shared/format";
import { SectionCard } from "./SectionCard";

type Tono = "success" | "warn" | "danger" | "neutral";

const ESTADO_COBRO: Record<string, { label: string; tone: Tono }> = {
  pagado: { label: "Pagado", tone: "success" },
  pendiente: { label: "Pendiente", tone: "warn" },
  creado: { label: "Sin pagar", tone: "neutral" },
  rechazado: { label: "Rechazado", tone: "danger" },
  cancelado: { label: "Cancelado", tone: "neutral" },
  reembolsado: { label: "Reembolsado", tone: "neutral" },
  parcialmente_reembolsado: { label: "Reembolso parcial", tone: "warn" },
  error: { label: "Con error", tone: "danger" },
};

const ESTADO_RETIRO: Record<string, { label: string; tone: Tono }> = {
  paid: { label: "Depositado", tone: "success" },
  processing: { label: "En proceso", tone: "warn" },
  pending: { label: "Pendiente", tone: "warn" },
  failed: { label: "Fallido", tone: "danger" },
  rejected: { label: "Rechazado", tone: "danger" },
  canceled: { label: "Cancelado", tone: "neutral" },
};

/** Ecart Pay del cliente: conexión de sus comercios, cobros recientes y retiros. */
export function EcartPayTab({ legajo }: { legajo: string }) {
  const conexiones = useConexionesComercios();
  const conectados = (conexiones.data ?? []).filter(
    (c) => c.legajo === legajo && c.proveedor === "ecartpay" && c.estado === "conectado",
  );
  const cobros = useQuery({
    queryKey: ["ecartpay-cliente", legajo, "cobros"],
    queryFn: () => listCobrosEcartPayCliente(legajo),
    enabled: !!legajo,
  });

  return (
    <div className="space-y-4">
      <div className="mt-6">
        <ConexionesComerciosCard legajo={legajo} />
      </div>

      <SectionCard title="Cobros recientes">
        {cobros.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : cobros.error ? (
          <p className="text-sm text-danger-600">{(cobros.error as Error).message}</p>
        ) : (cobros.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este cliente no tiene cobros con Ecart Pay.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground text-left">
                <tr>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Comercio</th>
                  <th className="py-2 pr-4">Pagador</th>
                  <th className="py-2 pr-4">Método</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4 text-right">Monto</th>
                  <th className="py-2 text-right">Comisión Ecart Pay</th>
                </tr>
              </thead>
              <tbody>
                {cobros.data!.map((c) => {
                  const e = ESTADO_COBRO[c.estado] ?? { label: c.estado, tone: "neutral" as const };
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2 pr-4 whitespace-nowrap text-xs">
                        {formatDateTime(c.pagadoAt ?? c.creadoAt)}
                      </td>
                      <td className="py-2 pr-4">{c.comercio}</td>
                      <td className="py-2 pr-4">{c.pagador ?? "—"}</td>
                      <td className="py-2 pr-4">{c.metodo ? c.metodo.toUpperCase() : "—"}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={e.tone}>{e.label}</Badge>
                        {c.reembolsado > 0 && (
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            Reembolsado {formatMoney(c.reembolsado, { moneda: c.moneda })}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono">
                        {formatMoney(c.monto, { moneda: c.moneda })}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {c.comision != null ? formatMoney(c.comision, { moneda: c.moneda }) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Retiros">
        {conexiones.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : conectados.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin comercios conectados: no hay retiros que consultar.
          </p>
        ) : (
          <div className="space-y-5">
            {conectados.map((c) => (
              <RetirosComercio key={c.id} comercioId={c.comercioId} nombre={c.comercio} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/** Saldo y últimos retiros de un comercio, consultados en vivo a Ecart Pay. */
function RetirosComercio({ comercioId, nombre }: { comercioId: string; nombre: string }) {
  const q = useQuery({
    queryKey: ["ecartpay-cliente", "retiros", comercioId],
    queryFn: () => getRetirosEcartPayComercio(comercioId),
    staleTime: 60_000,
  });
  const d = q.data;
  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">{nombre}</p>
        {d?.saldo && (
          <span className="text-xs text-muted-foreground">
            Disponible{" "}
            <span className="font-mono font-semibold text-foreground">
              {formatMoney(d.saldo.disponible, { moneda: d.saldo.moneda })}
            </span>
          </span>
        )}
      </div>
      {q.isLoading ? (
        <p className="mt-1 text-muted-foreground">Consultando a Ecart Pay…</p>
      ) : q.error ? (
        <p className="mt-1 text-danger-600">{(q.error as Error).message}</p>
      ) : !d || d.retiros.length === 0 ? (
        <p className="mt-1 text-muted-foreground">Sin retiros.</p>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {d.retiros.slice(0, 10).map((r) => {
            const e = ESTADO_RETIRO[r.estado] ?? { label: r.estado, tone: "neutral" as const };
            return (
              <li key={r.id} className="py-1.5 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <Badge tone={e.tone}>{e.label}</Badge>
                  {r.enRevision && <Badge tone="warn">En revisión</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {r.creadoAt ? formatDateTime(r.creadoAt) : "—"}
                  </span>
                </span>
                <span className="font-mono">
                  {formatMoney(r.monto, { moneda: r.moneda ?? "MXN" })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {d && d.errores.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          Ecart Pay no devolvió: {d.errores.join(", ")}.
        </p>
      )}
    </div>
  );
}
