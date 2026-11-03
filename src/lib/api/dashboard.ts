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

export type PuntoVolumen = { dia: string; monto: number; operaciones: number };
export type EstadoServicio = { nombre: string; ok: boolean; detalle: string; at: string | null };
export type RegistroReciente = {
  legajo: string;
  nombre: string;
  idFiscal: string | null;
  tipoPersona: string;
  estado: string;
  alta: string;
  volumenMes: number;
};
export type AlertaReciente = {
  id: string;
  titulo: string;
  descripcion: string | null;
  cliente: string | null;
  estado: string;
  vencida: boolean;
  at: string;
};
export type CobrosMes = {
  cantidad: number;
  bruto: number;
  comisionProveedor: number;
  neto: number;
  reembolsado: number;
  conciliados: number;
  porMetodo: Record<string, { cantidad: number; monto: number }>;
};
export type DashboardDetalle = {
  moneda: string;
  volumen14d: PuntoVolumen[];
  estadoSistema: EstadoServicio[];
  ultimosRegistros: RegistroReciente[];
  alertasRecientes: AlertaReciente[];
  cobrosMes: CobrosMes;
};

/** Resto del inicio del admin (RPC `dashboard_detalle`, solo backoffice). */
export async function getDashboardDetalle(): Promise<DashboardDetalle> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("dashboard_detalle");
  if (error) throw new DataAccessError(error);
  const r = (data ?? {}) as Record<string, unknown>;
  const lista = (k: string) => (Array.isArray(r[k]) ? (r[k] as Record<string, unknown>[]) : []);
  const c = (r.cobros_mes ?? {}) as Record<string, unknown>;
  return {
    moneda: String(r.moneda ?? "MXN"),
    volumen14d: lista("volumen_14d").map((v) => ({
      dia: String(v.dia),
      monto: Number(v.monto ?? 0),
      operaciones: Number(v.operaciones ?? 0),
    })),
    estadoSistema: lista("estado_sistema").map((e) => ({
      nombre: String(e.nombre),
      ok: e.ok === true,
      detalle: String(e.detalle ?? ""),
      at: (e.at as string | null) ?? null,
    })),
    ultimosRegistros: lista("ultimos_registros").map((u) => ({
      legajo: String(u.legajo),
      nombre: String(u.nombre ?? "—"),
      idFiscal: (u.id_fiscal as string | null) ?? null,
      tipoPersona: String(u.tipo_persona ?? ""),
      estado: String(u.estado ?? ""),
      alta: String(u.alta),
      volumenMes: Number(u.volumen_mes ?? 0),
    })),
    alertasRecientes: lista("alertas_recientes").map((a) => ({
      id: String(a.id),
      titulo: String(a.titulo ?? "Alerta"),
      descripcion: (a.descripcion as string | null) ?? null,
      cliente: (a.cliente as string | null) ?? null,
      estado: String(a.estado),
      vencida: a.vencida === true,
      at: String(a.at),
    })),
    cobrosMes: {
      cantidad: Number(c.cantidad ?? 0),
      bruto: Number(c.bruto ?? 0),
      comisionProveedor: Number(c.comision_proveedor ?? 0),
      neto: Number(c.neto ?? 0),
      reembolsado: Number(c.reembolsado ?? 0),
      conciliados: Number(c.conciliados ?? 0),
      porMetodo: (c.por_metodo ?? {}) as CobrosMes["porMetodo"],
    },
  };
}
