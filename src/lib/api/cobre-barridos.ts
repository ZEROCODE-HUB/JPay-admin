import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";
import { errorDeFuncion } from "./edge";

/**
 * Barrido de comisiones de Cobre (migración 1073): la comisión + IVA que se descuenta a cada
 * comercio se mueve de su Cobre Balance al Balance de comisiones de la plataforma (o, en cuentas
 * propias, por SPEI a la CLABE de la plataforma).
 */

export type ModoBarrido = "desactivado" | "por_envio" | "diario";

export type ConfiguracionBarrido = {
  modo: ModoBarrido;
  montoMinimo: number;
  hora: number;
  instancias: boolean;
  clabe: string | null;
  titular: string | null;
  rfc: string | null;
};

export type BalanceComisiones = {
  id: string;
  cuentaExterna: string;
  conectividad: string | null;
} | null;

export type ResumenBarrido = {
  legajo: string;
  nombre: string;
  modo: string;
  propia: boolean;
  cobradas: number;
  barrido: number;
  enCurso: number;
  porBarrer: number;
  ultimoAt: string | null;
};

export type Barrido = {
  id: string;
  legajo: string;
  via: "interno" | "spei";
  direccion: "a_plataforma" | "a_cliente";
  monto: number;
  estado: string;
  motivo: string | null;
  origen: string;
  creadoAt: string;
};

export async function getConfiguracionBarrido(): Promise<{
  config: ConfiguracionBarrido;
  balance: BalanceComisiones;
}> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_configuracion")
    .select(
      "barrido_modo, barrido_monto_minimo, barrido_hora, barrido_instancias, barrido_clabe, barrido_titular, barrido_rfc, cobre_cuentas!cobre_configuracion_cuenta_plataforma_id_fkey(id, cuenta_externa_id, conectividad)",
    )
    .eq("id", 1)
    .single();
  if (error) throw new DataAccessError(error);
  const cta = data.cobre_cuentas as unknown as {
    id: string;
    cuenta_externa_id: string;
    conectividad: string | null;
  } | null;
  return {
    config: {
      modo: (data.barrido_modo as ModoBarrido) ?? "desactivado",
      montoMinimo: Number(data.barrido_monto_minimo ?? 0),
      hora: Number(data.barrido_hora ?? 9),
      instancias: data.barrido_instancias === true,
      clabe: data.barrido_clabe,
      titular: data.barrido_titular,
      rfc: data.barrido_rfc,
    },
    balance: cta
      ? { id: cta.id, cuentaExterna: cta.cuenta_externa_id, conectividad: cta.conectividad }
      : null,
  };
}

export async function guardarConfiguracionBarrido(c: ConfiguracionBarrido): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("cobre_configuracion")
    .update({
      barrido_modo: c.modo,
      barrido_monto_minimo: c.montoMinimo,
      barrido_hora: c.hora,
      barrido_instancias: c.instancias,
      barrido_clabe: c.clabe,
      barrido_titular: c.titular,
      barrido_rfc: c.rfc,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new DataAccessError(error);
}

export async function listResumenBarrido(): Promise<ResumenBarrido[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("cobre_barrido_resumen");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    legajo: r.cliente_legajo,
    nombre: r.nombre,
    modo: r.modo,
    propia: r.propia,
    cobradas: Number(r.cobradas),
    barrido: Number(r.barrido),
    enCurso: Number(r.en_curso),
    porBarrer: Number(r.por_barrer),
    ultimoAt: r.ultimo_at,
  }));
}

export async function listBarridos(): Promise<Barrido[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_barridos")
    .select("id, cliente_legajo, via, direccion, monto, estado, motivo, origen, created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    legajo: r.cliente_legajo,
    via: r.via as Barrido["via"],
    direccion: r.direccion as Barrido["direccion"],
    monto: Number(r.monto),
    estado: r.estado,
    motivo: r.motivo,
    origen: r.origen,
    creadoAt: r.created_at,
  }));
}

async function invocar<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await requireSupabase().functions.invoke<T>("cobre-cuentas", { body });
  if (error) throw await errorDeFuncion(error);
  return data as T;
}

/** Crea el Balance de comisiones o, con `cuenta`, vincula uno que ya existe (acc_…). */
export const prepararBalanceComisiones = (cuenta?: string) =>
  invocar(
    cuenta
      ? { accion: "vincular_balance_comisiones", cuenta_externa: cuenta }
      : { accion: "balance_comisiones" },
  );

export const barrerAhora = (legajo: string) =>
  invocar<{ estado: string; monto?: number; motivo?: string }>({ accion: "barrer", legajo });
