import { Eye, Globe, Inbox, Landmark, Link2, RefreshCw } from "lucide-react";
import { formatMoney } from "@/shared/format";
import { Badge } from "@/components/portal-shell";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { ApiUsuariosInline } from "./ApiUsuariosInline";
import { SectionCard } from "./SectionCard";

export function ModulosTab({
  legajo,
  data,
  ui,
}: {
  legajo: string;
  data: ClienteDetalleData;
  ui: ClienteDetalleUi;
}) {
  const { modulosQuery, clienteApiUsuariosQuery, comerciosPst, linksPago, apiCantidadReal } = data;
  const { modulosSub, setModulosSub, setPstOpen, setLinksOpen, setApiDetalleId } = ui;

  return (
    <SectionCard
      title="Módulos y productos"
      actions={
        <button
          type="button"
          onClick={() => {
            modulosQuery.refetch();
            clienteApiUsuariosQuery.refetch();
          }}
          className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
        >
          <RefreshCw size={13} /> Recargar
        </button>
      }
    >
      {modulosQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : modulosQuery.isError ? (
        <p className="text-sm text-danger-600">{(modulosQuery.error as Error).message}</p>
      ) : (
        <div>
          {/* Sub-tabs */}
          <div className="flex gap-1 border-b border-border mb-4">
            {[
              { key: "pct" as const, label: "PCT", icon: Landmark },
              { key: "links" as const, label: "Links de pago", icon: Link2 },
              { key: "api" as const, label: "API externa", icon: Globe },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setModulosSub(st.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  modulosSub === st.key
                    ? "border-primary text-primary-ink"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <st.icon size={14} />
                {st.label}
              </button>
            ))}
          </div>

          {/* PCT sub-tab */}
          {modulosSub === "pct" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Comercios vinculados
                </div>
                <div className="text-2xl font-semibold tabular-nums">{comerciosPst.length}</div>
                {comerciosPst.length === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    No se encontró comercio PCT asociado por email o legajo.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comerciosPst.length} comercio(s) PCT vinculado(s) a este cliente.
                  </p>
                )}
              </div>
              {comerciosPst.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Comercio</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Legajo</th>
                        <th className="px-4 py-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comerciosPst.map((c) => (
                        <tr key={c.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-medium">{c.nombre}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {c.legajo_comercio ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setPstOpen(true)}
                              className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
                            >
                              <Eye size={13} /> Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground">
                  <Inbox size={22} />
                  <p>No se encontró comercio PCT asociado por email o legajo.</p>
                </div>
              )}
            </div>
          )}

          {/* Links de pago sub-tab */}
          {modulosSub === "links" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Comercios vinculados
                </div>
                <div className="text-2xl font-semibold tabular-nums">{linksPago.length}</div>
                {linksPago.length === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sin comercios vinculados con links de pago.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {linksPago.length} comercio(s) con links de pago activos.
                  </p>
                )}
                {linksPago.some((l) => l.estado === "Pendiente") && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    {linksPago.filter((l) => l.estado === "Pendiente").length} comercio(s)
                    pendiente(s) de aprobación.
                  </p>
                )}
              </div>
              {linksPago.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Comercio</th>
                        <th className="px-4 py-3 font-medium">URL</th>
                        <th className="px-4 py-3 font-medium text-right">Monto</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linksPago.map((l) => (
                        <tr key={l.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-medium">{l.comercio_nombre}</td>
                          <td className="px-4 py-3">
                            {l.url ? (
                              <a
                                href={l.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-primary-ink break-all hover:underline"
                              >
                                {l.url.length > 40 ? l.url.slice(0, 40) + "…" : l.url}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {l.monto != null ? formatMoney(l.monto) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              tone={
                                l.estado === "Activo"
                                  ? "success"
                                  : l.estado === "Pendiente"
                                    ? "warn"
                                    : "neutral"
                              }
                            >
                              {l.estado ?? "—"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setLinksOpen(true)}
                              className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
                            >
                              <Eye size={13} /> Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground">
                  <Inbox size={22} />
                  <p>Sin links de pago vinculados.</p>
                </div>
              )}
            </div>
          )}

          {/* API externa sub-tab */}
          {modulosSub === "api" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Usuarios asociados
                </div>
                <div className="text-2xl font-semibold tabular-nums">{apiCantidadReal}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {apiCantidadReal === 0
                    ? "Sin vínculos de API externa para este cliente."
                    : `${apiCantidadReal} usuario(s) API vinculado(s) a este cliente.`}
                </p>
                {clienteApiUsuariosQuery.isError && (
                  <p className="mt-1 text-xs text-amber-700">
                    No se pudo cargar desde Supabase (fallback a cliente_modulos).
                  </p>
                )}
              </div>
              <ApiUsuariosInline legajo={legajo} onVerDetalle={(id) => setApiDetalleId(id)} />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
