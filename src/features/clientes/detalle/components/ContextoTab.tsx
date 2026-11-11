import { Eye } from "lucide-react";
import { Badge } from "@/components/portal-shell";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import type { Subcuenta } from "@/lib/api/subcuentas";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { KpiCard } from "./KpiCard";
import { MiniDashboard } from "./MiniDashboard";
import { brand } from "@/brand/brand";

export function ContextoTab({ data, ui }: { data: ClienteDetalleData; ui: ClienteDetalleUi }) {
  const {
    subcuentasQuery,
    comisionesRealesQuery,
    alertasQuery,
    bloqueosQuery,
    modulosQuery,
    modulosData,
    resumenClienteQuery,
  } = data;
  const conteo = (k: "comisiones" | "alertas" | "bloqueos") =>
    resumenClienteQuery.isError ? "No se pudo cargar" : String(resumenClienteQuery.data?.[k] ?? 0);
  const { comisionDetail, setComisionDetail } = ui;

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-semibold text-foreground mb-3">
        Contexto operativo
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          loading={subcuentasQuery.isLoading}
          label="Subcuentas"
          info="Todas las subcuentas (CLABE) dadas de alta para este cliente, activas o pausadas."
          value={
            subcuentasQuery.isError
              ? "No se pudo cargar"
              : String(subcuentasQuery.data?.length ?? 0)
          }
        />
        <KpiCard
          loading={resumenClienteQuery.isLoading}
          label="Comisiones"
          info="Reglas de comisión configuradas para este cliente (depósitos, envíos y conversiones), en cualquier estado. No son comisiones cobradas."
          value={conteo("comisiones")}
        />
        <KpiCard
          loading={resumenClienteQuery.isLoading}
          label="Alertas"
          info="Alertas de monitoreo generadas para este cliente en cualquier estado (pendientes, en revisión, resueltas o descartadas)."
          value={conteo("alertas")}
        />
        <KpiCard
          loading={resumenClienteQuery.isLoading}
          label="Bloqueos"
          info="Bloqueos aplicados a la cuenta o a sus subcuentas, vigentes o ya levantados."
          value={conteo("bloqueos")}
        />
        <KpiCard
          loading={modulosQuery.isLoading}
          label="Módulos inferidos"
          info={`Módulos que el cliente tiene registrados en ${brand.name} (por ejemplo API externa, links de pago o subcuentas). Es la cantidad de módulos, no de usos.`}
          value={modulosQuery.isError ? "No se pudo cargar" : String(modulosData.length)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <MiniDashboard
          titulo="Subcuentas recientes"
          columnas={[
            {
              label: "Nombre",
              render: (s: Subcuenta) => `${s.nombre} ${s.apellido}`.trim(),
            },
            { label: "Email", render: (s: Subcuenta) => s.email },
            { label: "Estado", render: (s: Subcuenta) => s.estado },
          ]}
          datos={(subcuentasQuery.data ?? []).slice(0, 10)}
        />
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Últimas comisiones
          </h4>
          {(() => {
            const comisionesFiltradas = (comisionesRealesQuery.data?.rows ?? []).filter(
              (c) => c.tipo === "Depósito" || c.tipo === "Retiro",
            );
            return comisionesFiltradas.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin comisiones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left uppercase tracking-wide text-muted-foreground">
                      <th className="px-2 py-1.5">Operación</th>
                      <th className="px-2 py-1.5">Tipo</th>
                      <th className="px-2 py-1.5">Estado</th>
                      <th className="px-2 py-1.5 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comisionesFiltradas.slice(0, 10).map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-2 py-1.5 font-mono">{c.operacion}</td>
                        <td className="px-2 py-1.5">{c.tipo}</td>
                        <td className="px-2 py-1.5">
                          <Badge tone={c.estado === "Habilitado" ? "success" : "neutral"}>
                            {c.estado}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <button
                            onClick={() => setComisionDetail(c)}
                            className="inline-flex items-center gap-1 h-6 px-2 rounded border text-[11px] hover:bg-accent"
                          >
                            <Eye size={11} /> Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
        <div className="rounded-lg border border-border p-4 mt-3">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Comisiones Link de Pago / E-commerce
          </h4>
          <p className="text-[11px] text-muted-foreground mb-2">Se gestionan separadamente.</p>
          {(() => {
            const comisionesLink = (comisionesRealesQuery.data?.rows ?? []).filter(
              (c) => c.tipo === "Link de pago" || c.tipo === "E-commerce",
            );
            return comisionesLink.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin comisiones de Link de Pago / E-commerce.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left uppercase tracking-wide text-muted-foreground">
                      <th className="px-2 py-1.5">Tipo</th>
                      <th className="px-2 py-1.5">Porcentaje</th>
                      <th className="px-2 py-1.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comisionesLink.slice(0, 10).map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-2 py-1.5">{c.tipo}</td>
                        <td className="px-2 py-1.5 font-mono">
                          {c.porcentaje != null
                            ? c.porcentaje + "%"
                            : c.montoFijo != null
                              ? "$ " + c.montoFijo
                              : "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          <Badge tone={c.estado === "Habilitado" ? "success" : "neutral"}>
                            {c.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
        <MiniDashboard
          titulo="Alertas y bloqueos recientes"
          columnas={[
            {
              label: "Tipo",
              render: (r: { tipo: string; parametro?: string }) => r.tipo || r.parametro || "—",
            },
            {
              label: "Estado",
              render: (r: { estado: string }) => r.estado ?? "—",
            },
            { label: "Fecha", render: (r: { fecha: string }) => r.fecha },
          ]}
          datos={[
            ...(alertasQuery.data ?? []).map((a) => ({
              tipo: a.tipo,
              parametro: undefined as string | undefined,
              estado: a.estado,
              fecha: a.fecha,
            })),
            ...(bloqueosQuery.data ?? []).map((b) => ({
              tipo: b.parametro,
              parametro: b.parametro,
              estado: b.estado ?? "—",
              fecha: "—",
            })),
          ].slice(0, 10)}
        />
      </div>
      {comisionDetail && (
        <ModalDialog
          open={!!comisionDetail}
          onClose={() => setComisionDetail(null)}
          title="Detalle de comisión"
          description={`${comisionDetail.operacion} · ${comisionDetail.tipo}`}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Operación</span>
              <div className="font-mono font-semibold">{comisionDetail.operacion}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo</span>
              <div>{comisionDetail.tipo}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Modalidad</span>
              <div>{comisionDetail.modalidad}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Estado</span>
              <div>
                <Badge tone={comisionDetail.estado === "Habilitado" ? "success" : "neutral"}>
                  {comisionDetail.estado}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Porcentaje</span>
              <div className="font-mono">{comisionDetail.porcentaje ?? "—"}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Monto fijo</span>
              <div className="font-mono">
                {comisionDetail.montoFijo != null ? `$ ${comisionDetail.montoFijo}` : "—"}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Descripción</span>
              <div>{comisionDetail.descripcion ?? "—"}</div>
            </div>
          </div>
        </ModalDialog>
      )}
    </section>
  );
}
