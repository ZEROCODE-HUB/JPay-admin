import { Activity, Pencil, ShieldAlert } from "lucide-react";
import { formatDate, formatMoney } from "@/shared/format";
import { DataTable } from "@/shared/ui/data-table";
import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { ALERTA_PARAM_DEF, BLOQUEO_PARAM_DEF, type AlertaView, type BloqueoView } from "../utils";
import { bloqueosColumns, riesgoColumns } from "./columns";
import { ParametrosResumen } from "./ParametrosResumen";
import { SectionCard } from "./SectionCard";

export function RiesgoTab({
  cliente,
  data,
  ui,
}: {
  cliente: Cliente;
  data: ClienteDetalleData;
  ui: ClienteDetalleUi;
}) {
  const {
    riesgoVigente,
    evaluacionesAnteriores,
    paramAlertasQuery,
    paramBloqueosQuery,
    alertasQuery,
    bloqueosQuery,
  } = data;
  const {
    gestiones,
    riesgoSub,
    setRiesgoSub,
    setEditRiesgoOpen,
    setEditPerfilOpen,
    setEditAlertasOpen,
    setEditBloqueosOpen,
    setGestionTarget,
  } = ui;

  const alertasVisibles: AlertaView[] = (alertasQuery.data ?? []).map((a) => {
    const g = gestiones[a.id];
    return { ...a, estado: g ? "Resuelto" : a.estado, fechaAceptacion: g?.fecha };
  });
  const bloqueosVisibles: BloqueoView[] = (bloqueosQuery.data ?? []).map((b) => {
    const g = gestiones[b.id];
    return { ...b, estado: g ? "Desbloqueado" : b.estado, fechaAceptacion: g?.fecha };
  });

  return (
    <SectionCard title="Riesgo y monitoreo">
      {/* === PLAFT: Nivel de Riesgo + Perfil Transaccional === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Tarjeta 1: Nivel de Riesgo PLAFT */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert size={13} /> Nivel de riesgo PLAFT
            </div>
            <button
              type="button"
              onClick={() => setEditRiesgoOpen(true)}
              className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              <Pencil size={12} /> {riesgoVigente ? "Reevaluar" : "Asignar"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={
                riesgoVigente?.nivel === "bajo"
                  ? "px-2.5 py-1 rounded-md border text-sm font-semibold bg-emerald-100 text-emerald-800 border-emerald-200"
                  : riesgoVigente?.nivel === "medio"
                    ? "px-2.5 py-1 rounded-md border text-sm font-semibold bg-amber-100 text-amber-800 border-amber-200"
                    : riesgoVigente?.nivel === "alto"
                      ? "px-2.5 py-1 rounded-md border text-sm font-semibold bg-orange-100 text-orange-800 border-orange-200"
                      : riesgoVigente?.nivel === "critico"
                        ? "px-2.5 py-1 rounded-md border text-sm font-semibold bg-danger-100 text-danger-800 border-danger-200"
                        : "px-2.5 py-1 rounded-md border text-sm font-semibold bg-muted text-muted-foreground border-border"
              }
            >
              {riesgoVigente ? riesgoVigente.nivel.toUpperCase() : "Sin evaluar"}
            </div>
            <div className="text-xs text-muted-foreground">
              Vigente desde: {riesgoVigente ? formatDate(riesgoVigente.vigente_desde) : "—"}
            </div>
          </div>
          <p className="mt-3 text-xs text-foreground">
            {riesgoVigente?.motivo ??
              "El cliente no tiene evaluación de riesgo vigente. Completá una evaluación inicial."}
          </p>
          {evaluacionesAnteriores.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Historial ({evaluacionesAnteriores.length} evaluación(es) anterior(es))
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {evaluacionesAnteriores.slice(0, 5).map((e) => (
                  <li key={e.id}>
                    <span className="font-medium text-foreground">{e.nivel.toUpperCase()}</span>
                    {" · "}
                    {formatDate(e.created_at)}
                    {" — "}
                    {e.motivo.length > 60 ? `${e.motivo.slice(0, 60)}…` : e.motivo}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {/* Tarjeta 2: Perfil Transaccional */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Activity size={13} /> Perfil transaccional
            </div>
            <button
              type="button"
              onClick={() => setEditPerfilOpen(true)}
              className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              <Pencil size={12} /> Editar
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">
                Monto máx. transferencia
              </div>
              <div className="text-sm font-semibold tabular-nums">
                {formatMoney(cliente.limiteTransferencia, { decimals: 0 })}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Ops. diarias máx.</div>
              <div className="text-sm font-semibold tabular-nums">
                {cliente.limiteOpsDiarias ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Monto diario máx.</div>
              <div className="text-sm font-semibold tabular-nums">
                {formatMoney(cliente.limiteMontoDiario, { decimals: 0 })}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Editar este perfil sólo lo debería hacer Compliance. Cualquier cambio queda registrado
            en la ficha del cliente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Parámetros de alertas
            </div>
            <button
              type="button"
              onClick={() => setEditAlertasOpen(true)}
              className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              <Pencil size={12} /> Editar
            </button>
          </div>
          {paramAlertasQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Cargando…</p>
          ) : (
            <ParametrosResumen defs={ALERTA_PARAM_DEF} stored={paramAlertasQuery.data ?? []} />
          )}
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert size={13} /> Parámetros de bloqueo
            </div>
            <button
              type="button"
              onClick={() => setEditBloqueosOpen(true)}
              className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              <Pencil size={12} /> Editar
            </button>
          </div>
          {paramBloqueosQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Cargando…</p>
          ) : (
            <ParametrosResumen defs={BLOQUEO_PARAM_DEF} stored={paramBloqueosQuery.data ?? []} />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border mb-4">
        <button
          type="button"
          onClick={() => setRiesgoSub("alertas")}
          className={`px-3 py-2 text-xs font-semibold rounded-t-md ${
            riesgoSub === "alertas"
              ? "bg-primary/10 text-primary-ink border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Ver alertas
        </button>
        <button
          type="button"
          onClick={() => setRiesgoSub("bloqueos")}
          className={`px-3 py-2 text-xs font-semibold rounded-t-md ${
            riesgoSub === "bloqueos"
              ? "bg-primary/10 text-primary-ink border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          Ver bloqueos
        </button>
      </div>
      {riesgoSub === "alertas" ? (
        <div className="space-y-3">
          {alertasQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : alertasQuery.isError ? (
            <p className="text-sm text-danger-600">{(alertasQuery.error as Error).message}</p>
          ) : (
            <DataTable
              columns={riesgoColumns}
              data={alertasVisibles}
              keyExtractor={(r) => r.id}
              emptyMessage="Sin alertas para este cliente"
              actions={(r) => (
                <button
                  type="button"
                  onClick={() =>
                    setGestionTarget({ id: r.id, resumen: `${r.tipo} · ${cliente.nombre}` })
                  }
                  className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Gestionar
                </button>
              )}
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bloqueosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : bloqueosQuery.isError ? (
            <p className="text-sm text-danger-600">{(bloqueosQuery.error as Error).message}</p>
          ) : (
            <DataTable
              columns={bloqueosColumns}
              data={bloqueosVisibles}
              keyExtractor={(r) => r.id}
              emptyMessage="Sin bloqueos para este cliente"
              actions={(r) => (
                <button
                  type="button"
                  onClick={() =>
                    setGestionTarget({
                      id: r.id,
                      resumen: `${r.parametro} · ${cliente.nombre}`,
                    })
                  }
                  className="inline-flex items-center gap-1 h-8 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
                >
                  Gestionar
                </button>
              )}
            />
          )}
        </div>
      )}
    </SectionCard>
  );
}
