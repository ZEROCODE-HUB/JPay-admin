import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card } from "@/components/portal-shell";
import { Toggle } from "@/features/alertas/parametros-alertas/components/Toggle";
import {
  barrerAhora,
  getConfiguracionBarrido,
  guardarConfiguracionBarrido,
  listBarridos,
  listResumenBarrido,
  prepararBalanceComisiones,
  type ModoBarrido,
} from "@/lib/api/cobre-barridos";
import { formatDateTime, formatMoney, parseMonto } from "@/shared/format";
import { InfoTip } from "@/shared/ui/info-tip";
import { brand } from "@/brand/brand";
import { avisarError } from "../utils";

const KEY = ["cobre", "barrido"] as const;
const input = "mt-1 block w-full h-9 rounded-md border border-input bg-card px-2 text-sm";

const MODOS: Record<ModoBarrido, string> = {
  desactivado: "Desactivado (las comisiones se quedan en la cuenta de cada comercio)",
  por_envio: "Al confirmarse cada envío o conversión (más un reintento diario)",
  diario: "Una vez al día, todo junto",
};

const ESTADOS: Record<string, { label: string; tone: "success" | "warn" | "danger" | "neutral" }> =
  {
    pendiente: { label: "Pendiente", tone: "warn" },
    enviado: { label: "En curso", tone: "warn" },
    completado: { label: "Completado", tone: "success" },
    fallido: { label: "Fallido", tone: "danger" },
  };

/**
 * Barrido de comisiones de Cobre: la comisión + IVA que se descuenta al comercio queda en su Cobre
 * Balance; el barrido la mueve a la cuenta de comisiones de la plataforma.
 */
export function BarridoComisionesCard() {
  const qc = useQueryClient();
  const refrescar = () => qc.invalidateQueries({ queryKey: KEY });
  const config = useQuery({ queryKey: [...KEY, "config"], queryFn: getConfiguracionBarrido });
  const resumen = useQuery({ queryKey: [...KEY, "resumen"], queryFn: listResumenBarrido });
  const historial = useQuery({
    queryKey: [...KEY, "historial"],
    queryFn: listBarridos,
    refetchInterval: 30_000,
  });
  const guardar = useMutation({ mutationFn: guardarConfiguracionBarrido, onSuccess: refrescar });
  const preparar = useMutation({ mutationFn: prepararBalanceComisiones, onSuccess: refrescar });
  const barrer = useMutation({ mutationFn: barrerAhora, onSettled: refrescar });

  const [modo, setModo] = useState<ModoBarrido>("desactivado");
  const [minimo, setMinimo] = useState("");
  const [hora, setHora] = useState("9");
  const [instancias, setInstancias] = useState(false);
  const [clabe, setClabe] = useState("");
  const [titular, setTitular] = useState("");
  const [rfc, setRfc] = useState("");
  const [cuentaExistente, setCuentaExistente] = useState("");

  const c = config.data?.config;
  useEffect(() => {
    if (!c) return;
    setModo(c.modo);
    setMinimo(c.montoMinimo ? String(c.montoMinimo) : "");
    setHora(String(c.hora));
    setInstancias(c.instancias);
    setClabe(c.clabe ?? "");
    setTitular(c.titular ?? "");
    setRfc(c.rfc ?? "");
  }, [c]);

  const balance = config.data?.balance ?? null;

  const onGuardar = () => {
    const min = minimo.trim() ? parseMonto(minimo) : 0;
    if (!(min >= 0)) return toast.error("Monto mínimo inválido");
    const h = Number(hora);
    if (!Number.isInteger(h) || h < 0 || h > 23) return toast.error("La hora va de 0 a 23");
    const cl = clabe.replace(/\D/g, "");
    if (cl && cl.length !== 18) return toast.error("La CLABE debe tener 18 dígitos");
    if (instancias && (!cl || !titular.trim() || !rfc.trim())) {
      return toast.error("Para cuentas propias faltan la CLABE, el titular y el RFC");
    }
    if (modo !== "desactivado" && !balance) {
      toast.warning("Sin cuenta de comisiones, solo se barrerán las cuentas propias");
    }
    guardar.mutate(
      {
        modo,
        montoMinimo: min,
        hora: h,
        instancias,
        clabe: cl || null,
        titular: titular.trim() || null,
        rfc: rfc.trim().toUpperCase() || null,
      },
      { onSuccess: () => toast.success("Barrido de comisiones guardado"), onError: avisarError },
    );
  };

  const onBarrer = (legajo: string) =>
    barrer.mutate(legajo, {
      onSuccess: (r) =>
        r.estado === "omitido"
          ? toast.info(r.motivo ?? "Nada por barrer")
          : r.estado === "fallido"
            ? toast.error(r.motivo ?? "No se pudo barrer")
            : toast.success(`Barrido ${r.estado}: ${formatMoney(r.monto ?? 0)}`),
      onError: avisarError,
    });

  return (
    <Card>
      <h3 className="font-semibold">Cobre: barrido de comisiones</h3>
      <p className="text-xs text-muted-foreground mt-1">
        La comisión e IVA de {brand.name} que se descuenta en cada envío o conversión se queda en la
        cuenta Cobre del comercio. El barrido la mueve a la cuenta de comisiones de {brand.name}.
      </p>
      {config.isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
      ) : config.error ? (
        <p className="mt-2 text-sm text-danger-600">{config.error.message}</p>
      ) : (
        <div className="mt-3 space-y-5 text-sm">
          <section>
            <p className="text-xs font-medium">
              Cuenta de comisiones de {brand.name}{" "}
              <InfoTip>
                Balance en pesos de {brand.name} en Cobre. Recibe con un movimiento interno (sin
                costo de SPEI) las comisiones de los comercios que operan con la cuenta de{" "}
                {brand.name}.
              </InfoTip>
            </p>
            {balance ? (
              <p className="mt-1">
                <span className="font-mono">{balance.cuentaExterna}</span>{" "}
                <Badge tone={balance.conectividad === "connected" ? "success" : "warn"}>
                  {balance.conectividad ?? "sin consultar"}
                </Badge>
              </p>
            ) : (
              <div className="mt-1 flex flex-wrap items-end gap-3">
                <BtnOutline
                  disabled={preparar.isPending}
                  onClick={() =>
                    preparar.mutate(undefined, {
                      onSuccess: () => toast.success("Cuenta de comisiones creada en Cobre"),
                      onError: avisarError,
                    })
                  }
                >
                  {preparar.isPending ? "Creando…" : "Crear cuenta"}
                </BtnOutline>
                <span className="text-xs text-muted-foreground">o usar una existente:</span>
                <input
                  className="h-9 w-48 rounded-md border border-input bg-card px-2 text-sm font-mono"
                  placeholder="acc_…"
                  value={cuentaExistente}
                  onChange={(e) => setCuentaExistente(e.target.value.trim())}
                />
                <BtnOutline
                  disabled={preparar.isPending || !cuentaExistente}
                  onClick={() =>
                    preparar.mutate(cuentaExistente, {
                      onSuccess: () => toast.success("Cuenta de comisiones vinculada"),
                      onError: avisarError,
                    })
                  }
                >
                  Vincular
                </BtnOutline>
              </div>
            )}
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <div className="text-xs md:col-span-3">
              <label htmlFor="barrido-modo">Cuándo barrer</label>
              <select
                id="barrido-modo"
                className="mt-2 block w-full md:w-[34rem] h-9 px-2 rounded-md border border-input bg-card text-sm"
                value={modo}
                onChange={(e) => setModo(e.target.value as ModoBarrido)}
              >
                {(Object.keys(MODOS) as ModoBarrido[]).map((k) => (
                  <option key={k} value={k}>
                    {MODOS[k]}
                  </option>
                ))}
              </select>
            </div>
            <label className="text-xs">
              Monto mínimo (pesos)
              <input
                className={input}
                inputMode="decimal"
                placeholder="0"
                value={minimo}
                onChange={(e) => setMinimo(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Se barre cuando lo acumulado del comercio llega a este monto.
              </span>
            </label>
            <label className="text-xs">
              Hora del barrido diario (México)
              <input
                className={input}
                inputMode="numeric"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                De 0 a 23. Corre una vez al día desde esa hora.
              </span>
            </label>
            <div className="text-xs">
              Barrer también cuentas Cobre propias
              <div className="mt-2 flex items-center gap-2">
                <Toggle
                  label="Cuentas propias"
                  enabled={instancias}
                  onClick={() => setInstancias(!instancias)}
                />
                <span className="text-muted-foreground">{instancias ? "Sí, por SPEI" : "No"}</span>
              </div>
            </div>
            {instancias && (
              <>
                <label className="text-xs">
                  CLABE de comisiones de {brand.name}
                  <input
                    className={input}
                    inputMode="numeric"
                    value={clabe}
                    onChange={(e) => setClabe(e.target.value)}
                  />
                </label>
                <label className="text-xs">
                  Titular
                  <input
                    className={input}
                    value={titular}
                    onChange={(e) => setTitular(e.target.value)}
                  />
                </label>
                <label className="text-xs">
                  RFC del titular
                  <input className={input} value={rfc} onChange={(e) => setRfc(e.target.value)} />
                </label>
                <p className="md:col-span-3 text-[11px] text-muted-foreground">
                  A los comercios con cuenta Cobre propia se les envía un SPEI desde su cuenta a
                  esta CLABE (Cobre puede cobrar el SPEI). Si un rebote deja saldo a favor del
                  comercio, se compensa en el siguiente barrido.
                </p>
              </>
            )}
            <div className="md:col-span-3 flex justify-end">
              <BtnPrimary onClick={onGuardar} disabled={guardar.isPending}>
                {guardar.isPending ? "Guardando…" : "Guardar"}
              </BtnPrimary>
            </div>
          </section>

          <section>
            <p className="text-xs font-medium">
              Por comercio{" "}
              <InfoTip>
                Cobradas: comisión + IVA descontadas y vigentes (sin rebotes). Barrido: lo ya movido
                a {brand.name}. Por barrer: lo que sigue en la cuenta del comercio; negativo = hay
                que devolverle (rebote posterior al barrido). «Barrer ahora» ignora el monto mínimo
                y el modo.
              </InfoTip>
            </p>
            {resumen.isLoading ? (
              <p className="mt-1 text-muted-foreground">Cargando…</p>
            ) : (resumen.data ?? []).length === 0 ? (
              <p className="mt-1 text-muted-foreground">
                Ningún comercio tiene cuenta Cobre activa.
              </p>
            ) : (
              <div className="mt-1 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-1 pr-3 font-medium">Comercio</th>
                      <th className="py-1 pr-3 font-medium text-right">Cobradas</th>
                      <th className="py-1 pr-3 font-medium text-right">Barrido</th>
                      <th className="py-1 pr-3 font-medium text-right">Por barrer</th>
                      <th className="py-1 pr-3 font-medium">Último</th>
                      <th className="py-1" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {resumen.data!.map((r) => (
                      <tr key={`${r.modo}-${r.legajo}`}>
                        <td className="py-1.5 pr-3">
                          {r.nombre}{" "}
                          <span className="text-muted-foreground">
                            · {r.legajo}
                            {r.propia ? " · cuenta propia" : ""}
                            {r.modo !== "produccion" ? ` · ${r.modo}` : ""}
                          </span>
                        </td>
                        <td className="py-1.5 pr-3 text-right">{formatMoney(r.cobradas)}</td>
                        <td className="py-1.5 pr-3 text-right">
                          {formatMoney(r.barrido)}
                          {r.enCurso ? (
                            <span className="text-muted-foreground">
                              {" "}
                              (+{formatMoney(r.enCurso)})
                            </span>
                          ) : null}
                        </td>
                        <td className="py-1.5 pr-3 text-right font-medium">
                          {formatMoney(r.porBarrer)}
                        </td>
                        <td className="py-1.5 pr-3">
                          {r.ultimoAt ? formatDateTime(r.ultimoAt) : "—"}
                        </td>
                        <td className="py-1.5 text-right">
                          <BtnOutline
                            disabled={barrer.isPending || Math.abs(r.porBarrer) < 0.01}
                            onClick={() => onBarrer(r.legajo)}
                          >
                            Barrer ahora
                          </BtnOutline>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <p className="text-xs font-medium">Últimos barridos</p>
            {(historial.data ?? []).length === 0 ? (
              <p className="mt-1 text-muted-foreground">Todavía no hay barridos.</p>
            ) : (
              <ul className="mt-1 divide-y divide-border text-xs">
                {historial.data!.map((b) => {
                  const e = ESTADOS[b.estado] ?? { label: b.estado, tone: "neutral" as const };
                  return (
                    <li key={b.id} className="py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{formatDateTime(b.creadoAt)}</span>
                      <span>{b.legajo}</span>
                      <span className="font-medium">
                        {b.direccion === "a_cliente" ? "−" : ""}
                        {formatMoney(b.monto)}
                      </span>
                      <span className="text-muted-foreground">
                        {b.via === "spei" ? "SPEI" : "interno"} · {b.origen}
                        {b.direccion === "a_cliente" ? " · devolución al comercio" : ""}
                      </span>
                      <Badge tone={e.tone}>{e.label}</Badge>
                      {b.motivo && <span className="text-danger-600">{b.motivo}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </Card>
  );
}
