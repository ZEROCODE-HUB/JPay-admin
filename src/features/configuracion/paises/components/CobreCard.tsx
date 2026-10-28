import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card } from "@/components/portal-shell";
import { Toggle } from "@/features/alertas/parametros-alertas/components/Toggle";
import { useCobreAdmin, useCobreAdminMutaciones } from "@/hooks/useCobre";
import type { ModeloFondosCobre } from "@/lib/api/cobre";
import { formatDateTime, formatMoney, parseMonto } from "@/shared/format";
import { avisarError } from "../utils";

const MODELOS: Record<ModeloFondosCobre, { label: string; detalle: string }> = {
  centralizado: {
    label: "Centralizado",
    detalle: "Cada subcuenta tiene una CLABE virtual sobre la cuenta de JPay en Cobre.",
  },
  por_comercio: {
    label: "Por comercio",
    detalle: "Cada cliente tiene su propia cuenta en Cobre; sus CLABEs cuelgan de esa cuenta.",
  },
};

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

/**
 * Cobre (México): modelo de fondos, monto de aprobación y OTP, cuenta de JPay, transferencias
 * pendientes de aprobación, depósitos sin asignar y, en modo simulado, depósitos de prueba.
 */
export function CobreCard({ simulado }: { simulado: boolean }) {
  const { configuracion, aprobaciones, sinAsignar, modelos } = useCobreAdmin();
  const m = useCobreAdminMutaciones();
  const c = configuracion.data;
  const [modelo, setModelo] = useState<ModeloFondosCobre>("centralizado");
  const [monto, setMonto] = useState("");
  const [otp, setOtp] = useState(false);
  const [dep, setDep] = useState({ clabe: "", monto: "" });
  const [cli, setCli] = useState<{ legajo: string; modelo: ModeloFondosCobre }>({
    legajo: "",
    modelo: "por_comercio",
  });

  useEffect(() => {
    if (!c) return;
    setModelo(c.modeloDefault);
    setMonto(c.montoAprobacion != null ? String(c.montoAprobacion) : "");
    setOtp(c.exigirOtp);
  }, [c]);

  const guardar = () => {
    const importe = monto.trim() ? parseMonto(monto) : null;
    if (importe !== null && !(importe > 0)) return toast.error("Monto de aprobación inválido");
    m.guardar.mutate(
      { modeloDefault: modelo, montoAprobacion: importe, exigirOtp: otp },
      { onSuccess: () => toast.success("Configuración de Cobre guardada"), onError: avisarError },
    );
  };

  const decidir = (id: string, aprobar: boolean) =>
    m.decidir.mutate(
      {
        id,
        aprobar,
        nota: aprobar ? "Aprobada desde el backoffice" : "Rechazada desde el backoffice",
      },
      {
        onSuccess: () =>
          toast.success(aprobar ? "Transferencia aprobada" : "Transferencia rechazada"),
        onError: avisarError,
      },
    );

  return (
    <Card>
      <h3 className="font-semibold">Cobre: cuentas y transferencias SPEI</h3>
      {configuracion.isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
      ) : configuracion.error ? (
        <p className="mt-2 text-sm text-danger-600">{configuracion.error.message}</p>
      ) : (
        <div className="mt-3 space-y-5 text-sm">
          <section>
            <p className="text-xs font-medium">Cuenta de JPay en Cobre (modelo centralizado)</p>
            {c?.cuentaPlataforma ? (
              <p className="mt-1">
                CLABE <span className="font-mono">{c.cuentaPlataforma.clabe ?? "—"}</span>{" "}
                <Badge tone="neutral">{c.cuentaPlataforma.modo}</Badge>
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-3">
                <span className="text-muted-foreground">Todavía no se creó.</span>
                <BtnOutline
                  disabled={m.crearCuenta.isPending}
                  onClick={() =>
                    m.crearCuenta.mutate(undefined, {
                      onSuccess: () => toast.success("Cuenta de JPay creada en Cobre"),
                      onError: avisarError,
                    })
                  }
                >
                  {m.crearCuenta.isPending ? "Creando…" : "Crear cuenta"}
                </BtnOutline>
              </div>
            )}
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <label className="text-xs">
              Modelo de fondos por defecto
              <select
                className="mt-1 block w-full h-9 rounded-md border border-input bg-card px-2 text-sm"
                value={modelo}
                onChange={(e) => setModelo(e.target.value as ModeloFondosCobre)}
              >
                {Object.entries(MODELOS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {MODELOS[modelo].detalle}
              </span>
            </label>
            <label className="text-xs">
              Aprobación desde (monto)
              <input
                className="mt-1 block w-full h-9 rounded-md border border-input bg-card px-2 text-sm"
                inputMode="decimal"
                placeholder="Sin aprobación"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Desde este monto la transferencia espera la aprobación de un admin.
              </span>
            </label>
            <div className="text-xs">
              Exigir código OTP al transferir
              <div className="mt-2 flex items-center gap-2">
                <Toggle label="Exigir OTP" enabled={otp} onClick={() => setOtp(!otp)} />
                <span className="text-muted-foreground">{otp ? "Sí" : "No"}</span>
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <BtnPrimary onClick={guardar} disabled={m.guardar.isPending}>
                {m.guardar.isPending ? "Guardando…" : "Guardar"}
              </BtnPrimary>
            </div>
          </section>

          <section>
            <p className="text-xs font-medium">Transferencias esperando aprobación</p>
            {(aprobaciones.data ?? []).length === 0 ? (
              <p className="mt-1 text-muted-foreground">No hay transferencias pendientes.</p>
            ) : (
              <ul className="mt-1 divide-y divide-border">
                {aprobaciones.data!.map((t) => (
                  <li key={t.id} className="py-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium tabular-nums">
                        {formatMoney(t.monto)} · {t.legajo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        A {t.destinatario ?? "—"} · {t.concepto ?? ""} ·{" "}
                        {formatDateTime(t.creadaAt)} · {t.idTxn}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <BtnOutline
                        disabled={m.decidir.isPending}
                        onClick={() => decidir(t.id, false)}
                      >
                        Rechazar
                      </BtnOutline>
                      <BtnPrimary
                        disabled={m.decidir.isPending}
                        onClick={() => decidir(t.id, true)}
                      >
                        Aprobar
                      </BtnPrimary>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="text-xs font-medium">Depósitos sin asignar</p>
            {(sinAsignar.data ?? []).length === 0 ? (
              <p className="mt-1 text-muted-foreground">Todos los depósitos tienen dueño.</p>
            ) : (
              <ul className="mt-1 divide-y divide-border">
                {sinAsignar.data!.map((d) => (
                  <li key={d.id} className="py-2 flex flex-wrap justify-between gap-2">
                    <span>
                      {d.remitente ?? "Sin remitente"} · CLABE{" "}
                      <span className="font-mono">{d.clabe ?? "—"}</span>
                    </span>
                    <span className="flex items-center gap-3 tabular-nums">
                      {d.devolucion &&
                      !["rechazada", "fallida", "cancelada"].includes(d.devolucion) ? (
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
            <p className="mt-1 text-[11px] text-muted-foreground">
              Llegaron a una CLABE que no es de ninguna subcuenta: no se acreditaron a nadie. Se
              pueden devolver al remitente (el monto completo, una sola vez).
            </p>
          </section>

          <section>
            <p className="text-xs font-medium">Modelo de fondos por cliente</p>
            {(modelos.data ?? []).length === 0 ? (
              <p className="mt-1 text-muted-foreground">
                Todos los clientes usan el modelo por defecto.
              </p>
            ) : (
              <ul className="mt-1 divide-y divide-border">
                {modelos.data!.map((x) => (
                  <li key={x.legajo} className="py-1.5 flex items-center justify-between gap-3">
                    <span>
                      {x.nombre ?? x.legajo}{" "}
                      <span className="text-xs text-muted-foreground">{x.legajo}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Badge tone="neutral">{MODELOS[x.modelo].label}</Badge>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:underline"
                        onClick={() =>
                          m.guardarModelo.mutate(
                            { legajo: x.legajo, modelo: null },
                            { onError: avisarError },
                          )
                        }
                      >
                        Quitar
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <input
                className="h-9 w-48 rounded-md border border-input bg-card px-2 text-sm"
                placeholder="Legajo del cliente"
                value={cli.legajo}
                onChange={(e) => setCli({ ...cli, legajo: e.target.value.trim().toUpperCase() })}
              />
              <select
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                value={cli.modelo}
                onChange={(e) => setCli({ ...cli, modelo: e.target.value as ModeloFondosCobre })}
              >
                {Object.entries(MODELOS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <BtnOutline
                disabled={!cli.legajo || m.guardarModelo.isPending}
                onClick={() =>
                  m.guardarModelo.mutate(cli, {
                    onSuccess: () => {
                      toast.success("Modelo del cliente guardado");
                      setCli({ ...cli, legajo: "" });
                    },
                    onError: avisarError,
                  })
                }
              >
                Asignar
              </BtnOutline>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Aplica a las CLABEs nuevas del cliente; las que ya tiene siguen en su cuenta actual.
            </p>
          </section>

          {simulado && (
            <section className="rounded-md border border-dashed border-border p-3">
              <p className="text-xs font-medium">Simulador: depósito SPEI de prueba</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <input
                  className="h-9 w-56 rounded-md border border-input bg-card px-2 text-sm font-mono"
                  placeholder="CLABE de la subcuenta"
                  value={dep.clabe}
                  onChange={(e) => setDep({ ...dep, clabe: e.target.value.replace(/\D/g, "") })}
                />
                <input
                  className="h-9 w-32 rounded-md border border-input bg-card px-2 text-sm"
                  placeholder="Monto"
                  inputMode="decimal"
                  value={dep.monto}
                  onChange={(e) => setDep({ ...dep, monto: e.target.value })}
                />
                <BtnOutline
                  disabled={m.simularDeposito.isPending}
                  onClick={() =>
                    m.simularDeposito.mutate(
                      { clabe: dep.clabe, monto: parseMonto(dep.monto) },
                      {
                        onSuccess: () => toast.success("Depósito simulado enviado"),
                        onError: avisarError,
                      },
                    )
                  }
                >
                  {m.simularDeposito.isPending ? "Enviando…" : "Simular depósito"}
                </BtnOutline>
              </div>
            </section>
          )}
        </div>
      )}
    </Card>
  );
}
