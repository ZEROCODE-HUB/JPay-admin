import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card } from "@/components/portal-shell";
import { Toggle } from "@/features/alertas/parametros-alertas/components/Toggle";
import { useCobreAdmin, useCobreAdminMutaciones } from "@/hooks/useCobre";
import { formatDateTime, formatMoney, parseMonto } from "@/shared/format";
import { avisarError } from "../utils";

const input = "mt-1 block w-full h-9 rounded-md border border-input bg-card px-2 text-sm";

/**
 * Cobre (México), según el Solution Design de JPAY: cada comercio tiene su Cobre Balance (se da
 * de alta desde el detalle del cliente). Aquí solo la configuración: Balances Global y USA de JPay
 * (dólares), suscripción de avisos, montos de aprobación y OTP. Las aprobaciones están en Envíos
 * y los depósitos sin asignar en Cobros. Los simuladores están en Sistema → Herramientas de prueba.
 */
export function CobreCard() {
  const { configuracion, balances, suscripcion } = useCobreAdmin();
  const m = useCobreAdminMutaciones();
  const c = configuracion.data;
  const [monto, setMonto] = useState("");
  const [montoUsd, setMontoUsd] = useState("");
  const [otp, setOtp] = useState(false);
  const [reglasFx, setReglasFx] = useState(false);
  const [modoComision, setModoComision] = useState<"descontar" | "calcular">("descontar");
  const [saldos, setSaldos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!c) return;
    setMonto(c.montoAprobacion != null ? String(c.montoAprobacion) : "");
    setMontoUsd(c.montoAprobacionUsd != null ? String(c.montoAprobacionUsd) : "");
    setOtp(c.exigirOtp);
    setReglasFx(c.conversionEvaluaReglas);
    setModoComision(c.modoComision);
  }, [c]);

  const guardar = () => {
    const mxn = monto.trim() ? parseMonto(monto) : null;
    const usd = montoUsd.trim() ? parseMonto(montoUsd) : null;
    if ((mxn !== null && !(mxn > 0)) || (usd !== null && !(usd > 0))) {
      return toast.error("Monto de aprobación inválido");
    }
    m.guardar.mutate(
      {
        montoAprobacion: mxn,
        montoAprobacionUsd: usd,
        exigirOtp: otp,
        conversionEvaluaReglas: reglasFx,
        modoComision,
      },
      { onSuccess: () => toast.success("Configuración de Cobre guardada"), onError: avisarError },
    );
  };

  const verSaldo = (id: string) =>
    m.consultarBalance.mutate(id, {
      onSuccess: (r) =>
        setSaldos((s) => ({ ...s, [id]: formatMoney(r.saldo, { moneda: r.moneda ?? "USD" }) })),
      onError: avisarError,
    });

  return (
    <Card>
      <h3 className="font-semibold">Cobre: cuentas, SPEI y dólares</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Cada comercio tiene su propia cuenta en Cobre: se da de alta desde el detalle del cliente
        (pestaña Cobre).
      </p>
      {configuracion.isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
      ) : configuracion.error ? (
        <p className="mt-2 text-sm text-danger-600">{configuracion.error.message}</p>
      ) : (
        <div className="mt-3 space-y-5 text-sm">
          <section>
            <p className="text-xs font-medium">Balances de JPay en dólares (Global y USA)</p>
            {(balances.data ?? []).length < 2 ? (
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-muted-foreground">
                  Hacen falta para convertir a dólares y pagar por Fedwire o SWIFT.
                </span>
                <BtnOutline
                  disabled={m.crearBalances.isPending}
                  onClick={() =>
                    m.crearBalances.mutate(undefined, {
                      onSuccess: () => toast.success("Balances creados en Cobre"),
                      onError: avisarError,
                    })
                  }
                >
                  {m.crearBalances.isPending ? "Creando…" : "Crear balances"}
                </BtnOutline>
              </div>
            ) : (
              <ul className="mt-1 divide-y divide-border">
                {balances.data!.map((b) => (
                  <li
                    key={b.id}
                    className="py-1.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <span>
                      {b.tipo === "global"
                        ? "Global USD (recibe las conversiones)"
                        : "USA (paga Fedwire y SWIFT)"}{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        {b.cuentaExterna}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {b.conectividad && b.conectividad !== "connected" && (
                        <Badge tone="warn">{b.conectividad}</Badge>
                      )}
                      {saldos[b.id] ? (
                        <span className="tabular-nums">{saldos[b.id]}</span>
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-secondary hover:underline"
                          onClick={() => verSaldo(b.id)}
                        >
                          Ver saldo
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="text-xs font-medium">Avisos de Cobre (webhooks)</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {suscripcion.data
                  ? `Suscripción ${suscripcion.data.id} · ${suscripcion.data.eventos} eventos · ${formatDateTime(suscripcion.data.creadaAt)}`
                  : "Sin suscripción registrada por API."}
              </span>
              <BtnOutline
                disabled={m.suscribir.isPending}
                onClick={() =>
                  m.suscribir.mutate(undefined, {
                    onSuccess: (r) =>
                      toast.success(
                        r.faltan.length
                          ? `Suscripción ${r.suscripcion}: faltan ${r.faltan.length} eventos`
                          : `Suscripción ${r.suscripcion} con todos los eventos`,
                      ),
                    onError: avisarError,
                  })
                }
              >
                {m.suscribir.isPending
                  ? "Registrando…"
                  : suscripcion.data
                    ? "Revisar suscripción"
                    : "Suscribir"}
              </BtnOutline>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <label className="text-xs">
              Aprobación desde (pesos)
              <input
                className={input}
                inputMode="decimal"
                placeholder="Sin aprobación"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Transferencias SPEI y lotes (por el total) desde este monto esperan a un admin.
              </span>
            </label>
            <label className="text-xs">
              Aprobación desde (dólares)
              <input
                className={input}
                inputMode="decimal"
                placeholder="Sin aprobación"
                value={montoUsd}
                onChange={(e) => setMontoUsd(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Envíos Fedwire y SWIFT desde este monto esperan a un admin.
              </span>
            </label>
            <div className="text-xs">
              Exigir código OTP al transferir
              <div className="mt-2 flex items-center gap-2">
                <Toggle label="Exigir OTP" enabled={otp} onClick={() => setOtp(!otp)} />
                <span className="text-muted-foreground">{otp ? "Sí" : "No"}</span>
              </div>
            </div>
            <div className="text-xs md:col-span-3">
              <label htmlFor="cobre-modo-comision">Comisión de JPay</label>
              <select
                id="cobre-modo-comision"
                className="mt-2 block w-full md:w-[28rem] h-9 px-2 rounded-md border border-input bg-card text-sm"
                value={modoComision}
                onChange={(e) => setModoComision(e.target.value as "descontar" | "calcular")}
              >
                <option value="descontar">
                  Descontarla del saldo del comercio en cada operación
                </option>
                <option value="calcular">
                  No descontarla: calcularla y pedirle el pago a la empresa
                </option>
              </select>
              <p className="mt-1 text-muted-foreground">
                Lo calculado se ve en Finanzas JPay → Comisiones.
              </p>
            </div>
            <div className="text-xs md:col-span-3">
              Conversiones a dólares: aplicar las reglas de prevención (como un retiro)
              <div className="mt-2 flex items-center gap-2">
                <Toggle
                  label="Reglas en conversiones"
                  enabled={reglasFx}
                  onClick={() => setReglasFx(!reglasFx)}
                />
                <span className="text-muted-foreground">{reglasFx ? "Sí" : "No"}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                La comisión de JPay por convertir se carga por cliente en Finanzas JPay → Comisiones
                → Carga por cliente (tipo Conversión).
              </p>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <BtnPrimary onClick={guardar} disabled={m.guardar.isPending}>
                {m.guardar.isPending ? "Guardando…" : "Guardar"}
              </BtnPrimary>
            </div>
          </section>
        </div>
      )}
    </Card>
  );
}
