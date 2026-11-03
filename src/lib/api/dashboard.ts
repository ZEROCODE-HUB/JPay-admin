import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/** Indicadores del inicio del admin (RPC `dashboard_kpis`, solo backoffice). */
export type DashboardKpis = {
  clientesActivos: number;
  clientesTotal: number;
  /** Transacciones contabilizadas hoy (zona horaria del país de la instalación). */
  volumenDia: number;
  operacionesDia: number;
  moneda: string;
  alertasPendientes: number;
  alertasVencidas: number;
  /** Clientes registrados o preactivados: esperan revisión del backoffice. */
  altasRevision: number;
  altasSinEmail: number;
};

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("dashboard_kpis");
  if (error) throw new DataAccessError(error);
  const r = (data ?? {}) as Record<string, unknown>;
  const n = (k: string) => Number(r[k] ?? 0);
  return {
    clientesActivos: n("clientes_activos"),
    clientesTotal: n("clientes_total"),
    volumenDia: n("volumen_dia"),
    operacionesDia: n("operaciones_dia"),
    moneda: String(r.moneda ?? "MXN"),
    alertasPendientes: n("alertas_pendientes"),
    alertasVencidas: n("alertas_vencidas"),
    altasRevision: n("altas_revision"),
    altasSinEmail: n("altas_sin_email"),
  };
}
