import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, BtnPrimary, Card } from "@/components/portal-shell";
import { Toggle } from "@/features/alertas/parametros-alertas/components/Toggle";
import { useConexionesComercios, useMsiComercio } from "@/hooks/usePaises";
import type { ConfigMsi, PlanMsi } from "@/lib/api/paises";
import { formatMoney, formatPercent, parseMonto } from "@/shared/format";
import { avisarError } from "../utils";

const input =
  "h-8 w-24 rounded-md border border-input bg-card px-2 text-right text-sm tabular-nums";

/**
 * Meses sin intereses por comercio: plazos, montos mínimo/máximo y si son cuotas con interés
 * para el cliente. Se guardan en la cuenta Ecart Pay del comercio; el checkout de Ecart Pay las
 * ofrece solo en pagos con tarjeta (Visa, Mastercard y American Express) en pesos mexicanos.
 */
export function MsiCard() {
  const conexiones = useConexionesComercios();
  const conectados = (conexiones.data ?? []).filter(
    (c) => c.proveedor === "ecartpay" && c.estado === "conectado",
  );
  const [comercioId, setComercioId] = useState<string | null>(null);
  const actual = comercioId ?? conectados[0]?.comercioId ?? null;
  const { config, guardar } = useMsiComercio(actual);
  const [borrador, setBorrador] = useState<ConfigMsi | null>(null);

  useEffect(() => setBorrador(config.data ?? null), [config.data]);

  const cambiarPlan = (meses: number, cambios: Partial<PlanMsi>) =>
    setBorrador(
      (b) =>
        b && { ...b, planes: b.planes.map((p) => (p.meses === meses ? { ...p, ...cambios } : p)) },
    );
  const monto = (v: string) => (v.trim() === "" ? null : Math.round(parseMonto(v)));
  const sucio = JSON.stringify(borrador) !== JSON.stringify(config.data ?? null);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Meses sin intereses</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Plazos que el checkout de Ecart Pay ofrece en pagos con tarjeta. Sin intereses, la
            comisión del plazo la absorbe el comercio; con "cuotas con interés" la paga el cliente.
          </p>
        </div>
        {conectados.length > 1 && (
          <select
            className="h-9 rounded-md border border-input bg-card px-2 text-sm"
            value={actual ?? ""}
            onChange={(e) => setComercioId(e.target.value)}
          >
            {conectados.map((c) => (
              <option key={c.comercioId} value={c.comercioId}>
                {c.comercio}
              </option>
            ))}
          </select>
        )}
      </div>

      {conexiones.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : !actual ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Ningún comercio tiene Ecart Pay conectado.
        </p>
      ) : config.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Consultando Ecart Pay…</p>
      ) : config.error ? (
        <p className="mt-4 text-sm text-danger-600">
          No se pudo leer la configuración: {config.error.message}
        </p>
      ) : borrador ? (
        <>
          {conectados.length === 1 && (
            <p className="mt-3 text-sm font-medium">{conectados[0].comercio}</p>
          )}
          {!borrador.habilitado && (
            <p className="mt-3 text-xs">
              <Badge tone="warn">Apagado en la cuenta</Badge>{" "}
              <span className="text-muted-foreground">
                La cuenta de Ecart Pay del comercio tiene los meses sin intereses desactivados. Al
                guardar se activan con los plazos de abajo.
              </span>
            </p>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground text-left">
                <tr>
                  <th className="py-2 pr-4">Plazo</th>
                  <th className="py-2 pr-4">Activo</th>
                  <th className="py-2 pr-4">Cuotas con interés</th>
                  <th className="py-2 pr-4 text-right">Mínimo</th>
                  <th className="py-2 pr-4 text-right">Máximo</th>
                  <th className="py-2 text-right">Comisión</th>
                </tr>
              </thead>
              <tbody>
                {borrador.planes.map((p) => (
                  <tr key={p.meses} className="border-t border-border">
                    <td className="py-2 pr-4 font-medium">{p.meses} meses</td>
                    <td className="py-2 pr-4">
                      <Toggle
                        label={`Activar ${p.meses} meses`}
                        enabled={p.activo}
                        onClick={() => cambiarPlan(p.meses, { activo: !p.activo })}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <Toggle
                        label={`Cuotas con interés en ${p.meses} meses`}
                        enabled={p.cuotasFijas}
                        onClick={() => cambiarPlan(p.meses, { cuotasFijas: !p.cuotasFijas })}
                      />
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <input
                        className={input}
                        inputMode="numeric"
                        aria-label={`Mínimo para ${p.meses} meses`}
                        value={p.minimo ?? ""}
                        onChange={(e) => cambiarPlan(p.meses, { minimo: monto(e.target.value) })}
                      />
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <input
                        className={input}
                        inputMode="numeric"
                        aria-label={`Máximo para ${p.meses} meses`}
                        value={p.maximo ?? ""}
                        onChange={(e) => cambiarPlan(p.meses, { maximo: monto(e.target.value) })}
                      />
                    </td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {p.tasa === null ? "—" : formatPercent(p.tasa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs">
              <Toggle
                label="Cuotas con interés en American Express"
                enabled={borrador.amexCuotasFijas}
                onClick={() =>
                  setBorrador({ ...borrador, amexCuotasFijas: !borrador.amexCuotasFijas })
                }
              />
              Cuotas con interés en American Express
            </label>
            <BtnPrimary
              disabled={!sucio || guardar.isPending}
              onClick={() =>
                guardar.mutate(borrador, {
                  onSuccess: () => toast.success("Meses sin intereses guardados en Ecart Pay"),
                  onError: avisarError,
                })
              }
            >
              {guardar.isPending ? "Guardando…" : "Guardar"}
            </BtnPrimary>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Montos en pesos, sin centavos. Ejemplo: mínimo {formatMoney(300, { decimals: 0 })}.
          </p>
        </>
      ) : null}
    </Card>
  );
}
