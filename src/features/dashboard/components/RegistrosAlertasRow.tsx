import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Clock, ShieldAlert } from "lucide-react";
import { Card, Badge } from "@/components/portal-shell";
import type { DashboardDetalle } from "@/lib/api/dashboard";
import type { EstadoCliente } from "@/lib/api/types";
import { estadoLabel, estadoTone } from "@/features/clientes/detalle/utils";
import { formatDateTime, formatMoney } from "@/shared/format";
import { InfoTip } from "@/shared/ui/info-tip";

type Props = { d?: DashboardDetalle; isLoading: boolean; isError: boolean };

const segmento = (tipo: string) => (tipo === "fisica" ? "Persona física" : "Persona moral");

/** Últimos clientes registrados + alertas sin resolver más recientes. */
export function RegistrosAlertasRow({ d, isLoading, isError }: Props) {
  const aviso = isLoading ? "Cargando…" : isError ? "No se pudo cargar." : null;
  const registros = d?.ultimosRegistros ?? [];
  const alertas = d?.alertasRecientes ?? [];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Building2 size={16} className="text-secondary" /> Últimos registros
            <InfoTip>
              Los 6 clientes dados de alta más recientemente (sin contar eliminados). «Volumen del
              mes» suma sus operaciones contabilizadas en MXN desde el día 1 del mes (hora de
              México).
            </InfoTip>
          </h3>
          <Link
            to="/admin/general/usuarios/juridicas"
            className="text-xs text-primary-ink font-semibold"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                <th className="text-left font-display font-semibold py-2 px-5">Razón social</th>
                <th className="text-left font-display font-semibold py-2">RFC</th>
                <th className="text-left font-display font-semibold py-2">Segmento</th>
                <th className="text-left font-display font-semibold py-2">Estado</th>
                <th className="text-right font-display font-semibold py-2 px-5">Volumen del mes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {aviso || registros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 px-5 text-center text-sm text-muted-foreground">
                    {aviso ?? "Sin registros."}
                  </td>
                </tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.legajo}>
                    <td className="py-2.5 px-5 font-semibold">
                      <Link
                        to="/admin/general/usuarios/$legajo"
                        params={{ legajo: r.legajo }}
                        className="hover:underline"
                      >
                        {r.nombre}
                      </Link>
                    </td>
                    <td className="text-xs text-muted-foreground font-mono tabular-nums">
                      {r.idFiscal ?? "—"}
                    </td>
                    <td className="text-xs">{segmento(r.tipoPersona)}</td>
                    <td>
                      <Badge tone={estadoTone[r.estado as EstadoCliente] ?? "neutral"}>
                        {estadoLabel[r.estado as EstadoCliente] ?? r.estado}
                      </Badge>
                    </td>
                    <td className="text-right px-5 font-semibold font-mono tabular-nums">
                      {formatMoney(r.volumenMes, { moneda: d?.moneda })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <ShieldAlert size={16} className="text-primary-ink" /> Alertas recientes
            <InfoTip align="right">
              Las 5 alertas de monitoreo sin resolver (pendientes o en revisión) más nuevas. Es
              «Vencida» si ya pasó su plazo de atención.
            </InfoTip>
          </h3>
          <Link to="/admin/general/alertas" className="text-xs text-primary-ink font-semibold">
            Ver alertas →
          </Link>
        </div>
        {aviso || alertas.length === 0 ? (
          <p className="py-2.5 text-sm text-muted-foreground">
            {aviso ?? "Sin alertas pendientes."}
          </p>
        ) : (
          <div className="divide-y">
            {alertas.map((a) => (
              <div key={a.id} className="py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold">{a.titulo}</div>
                  <Badge tone={a.vencida ? "danger" : "warn"}>
                    {a.vencida ? "Vencida" : a.estado === "in_review" ? "En revisión" : "Pendiente"}
                  </Badge>
                </div>
                {a.cliente && <div className="text-xs mt-0.5">{a.cliente}</div>}
                {a.descripcion && (
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {a.descripcion}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-1">
                  <Clock size={11} /> {formatDateTime(a.at)}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          to="/admin/general/movimientos"
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary-ink font-semibold"
        >
          Ver movimientos en tiempo real <ArrowUpRight size={12} />
        </Link>
      </Card>
    </div>
  );
}
