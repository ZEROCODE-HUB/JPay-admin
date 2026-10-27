import { Eye } from "lucide-react";
import { Badge } from "@/components/portal-shell";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import type { Subcuenta } from "@/lib/api/subcuentas";
import type { ImpuestoAsignacion } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { KpiCard } from "./KpiCard";
import { MiniDashboard } from "./MiniDashboard";

export function ContextoTab({ data, ui }: { data: ClienteDetalleData; ui: ClienteDetalleUi }) {
  const {
    subcuentasQuery,
    comisionesRealesQuery,
    impuestosQuery,
    alertasQuery,
    bloqueosQuery,
    modulosQuery,
    modulosData,
  } = data;
  const { comisionDetail, setComisionDetail } = ui;

  return (
    <section className="mt-6">
      <h2 className="font-display text-base font-semibold text-foreground mb-3">
        Contexto operativo
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="CVUs"
          value={
            subcuentasQuery.isError ? "Por definir" : String(subcuentasQuery.data?.length ?? 0)
          }
        />
        <KpiCard
          label="Comisiones"
          value={
            comisionesRealesQuery.isError
              ? "Por definir"
              : String(
                  (comisionesRealesQuery.data?.rows ?? []).filter(
                    (c) => c.tipo === "Depósito" || c.tipo === "Retiro",
                  ).length,
                )
          }
        />
        <KpiCard
          label="Impuestos"
          value={impuestosQuery.isError ? "Por definir" : String(impuestosQuery.rows.length)}
        />
        <KpiCard
          label="Alertas"
          value={alertasQuery.isError ? "Por definir" : String(alertasQuery.data?.length ?? 0)}
        />
        <KpiCard
          label="Bloqueos"
          value={bloqueosQuery.isError ? "Por definir" : String(bloqueosQuery.data?.length ?? 0)}
        />
        <KpiCard
          label="Módulos inferidos"
          value={modulosQuery.isError ? "Por definir" : String(modulosData.length)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <MiniDashboard
          titulo="CVUs recientes"
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
          titulo="Impuestos recientes"
          columnas={[
            {
              label: "Impuesto",
              render: (a: ImpuestoAsignacion) => a.impuesto?.nombre ?? a.impuestoId,
            },
            { label: "Estado", render: (a: ImpuestoAsignacion) => a.estado },
            { label: "Fecha", render: () => "—" },
          ]}
          datos={impuestosQuery.rows.slice(0, 10)}
        />
        {/* Pendiente de conectar a la base: sin datos de ejemplo. */}
        <MiniDashboard titulo="Impuestos por cobrar" columnas={[]} datos={[]} />
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
