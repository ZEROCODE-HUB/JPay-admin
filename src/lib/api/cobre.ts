import { requireSupabase } from "@/lib/supabase";
import type { PersonaKyb } from "@/shared/cobre-kyb";
import type { EmpresaKyb } from "@/shared/ui/kyb-cobre";
import { DataAccessError } from "./errors";
import { errorDeFuncion } from "./edge";

/**
 * Cobre (México) desde el backoffice, según el Solution Design de JPAY: configuración, Balances
 * Global y USA de JPay, suscripción de avisos, aprobaciones, depósitos sin asignar, alta de cada
 * comercio como Subcliente (KYB) e instancias Cobre propias de comercios.
 */

export type ConfiguracionCobre = {
  montoAprobacion: number | null;
  montoAprobacionUsd: number | null;
  exigirOtp: boolean;
  /** Si las conversiones a dólares pasan por las reglas de prevención (como un retiro). */
  conversionEvaluaReglas: boolean;
};

export type BalanceMatriz = {
  id: string;
  tipo: "global" | "usa";
  cuentaExterna: string;
  conectividad: string | null;
};

export type SuscripcionCobre = { id: string; url: string; eventos: number; creadaAt: string };

export type TransferenciaCobre = {
  id: string;
  idTxn: string;
  legajo: string;
  monto: number;
  moneda: "MXN" | "USD";
  tipo: string;
  concepto: string | null;
  estado: string;
  motivo: string | null;
  destinatario: string | null;
  creadaAt: string;
};

export type LoteCobre = {
  id: string;
  legajo: string;
  cantidad: number;
  total: number;
  creadoAt: string;
};

export type DepositoCobre = {
  id: string;
  /** Estado de la devolución al remitente (null = no se pidió). */
  devolucion: string | null;
  devolucionMotivo: string | null;
  monto: number;
  clabe: string | null;
  remitente: string | null;
  claveRastreo: string | null;
  recibidoAt: string;
};

async function invocar<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<T>(fn, { body });
  if (error) {
    throw await errorDeFuncion(error);
  }
  return data as T;
}

// ── Configuración y tesorería de JPay ────────────────────────────────────────

export async function getConfiguracionCobre(): Promise<ConfiguracionCobre> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_configuracion")
    .select("monto_aprobacion, monto_aprobacion_usd, exigir_otp, conversion_evalua_reglas")
    .eq("id", 1)
    .single();
  if (error) throw new DataAccessError(error);
  return {
    montoAprobacion: data.monto_aprobacion != null ? Number(data.monto_aprobacion) : null,
    montoAprobacionUsd:
      data.monto_aprobacion_usd != null ? Number(data.monto_aprobacion_usd) : null,
    exigirOtp: data.exigir_otp,
    conversionEvaluaReglas: data.conversion_evalua_reglas,
  };
}

export async function guardarConfiguracionCobre(c: ConfiguracionCobre): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("cobre_configuracion")
    .update({
      monto_aprobacion: c.montoAprobacion,
      monto_aprobacion_usd: c.montoAprobacionUsd,
      exigir_otp: c.exigirOtp,
      conversion_evalua_reglas: c.conversionEvaluaReglas,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new DataAccessError(error);
}

export async function listBalancesMatriz(): Promise<BalanceMatriz[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_cuentas")
    .select("id, tipo, cuenta_externa_id, conectividad")
    .in("tipo", ["global", "usa"])
    .eq("estado", "activa");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    tipo: r.tipo as BalanceMatriz["tipo"],
    cuentaExterna: r.cuenta_externa_id,
    conectividad: r.conectividad,
  }));
}

export const crearBalancesMatriz = () => invocar("cobre-cuentas", { accion: "balances_matriz" });

export const consultarBalanceCobre = (cuentaId: string) =>
  invocar<{ saldo: number; moneda: string | null; conectividad: string | null }>("cobre-cuentas", {
    accion: "consultar_balance",
    cuenta_id: cuentaId,
  });

export async function getSuscripcionMatriz(): Promise<SuscripcionCobre | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_suscripciones")
    .select("suscripcion_externa_id, url, eventos, created_at")
    .is("instancia_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new DataAccessError(error);
  return data
    ? {
        id: data.suscripcion_externa_id,
        url: data.url,
        eventos: data.eventos.length,
        creadaAt: data.created_at,
      }
    : null;
}

/** Registra (o reusa) la suscripción de avisos en la matriz o en la instancia de un comercio. */
export const suscribirAvisosCobre = (instanciaId?: string) =>
  invocar<{ suscripcion: string; eventos: number; faltan: string[] }>("cobre-instancias", {
    accion: "suscribir",
    instancia_id: instanciaId,
  });

// ── Aprobaciones y depósitos ─────────────────────────────────────────────────

export async function listTransferenciasCobre(estados: string[]): Promise<TransferenciaCobre[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_transferencias")
    .select(
      "id, id_txn, cliente_legajo, monto, moneda, tipo, concepto, estado, motivo, lote_id, created_at, cobre_contrapartes(titular, numero)",
    )
    .in("estado", estados)
    .is("lote_id", null)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => {
    const cp = r.cobre_contrapartes as unknown as { titular: string; numero: string } | null;
    return {
      id: r.id,
      idTxn: r.id_txn,
      legajo: r.cliente_legajo,
      monto: Number(r.monto),
      moneda: r.moneda === "USD" ? "USD" : "MXN",
      tipo: r.tipo,
      concepto: r.concepto,
      estado: r.estado,
      motivo: r.motivo,
      destinatario: cp ? `${cp.titular} · ${cp.numero}` : null,
      creadaAt: r.created_at,
    };
  });
}

export async function listLotesPorAprobar(): Promise<LoteCobre[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_lotes")
    .select("id, cliente_legajo, cantidad, total, created_at")
    .eq("estado", "preparando")
    .eq("requiere_aprobacion", true)
    .is("decidida_at", null)
    .order("created_at");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    legajo: r.cliente_legajo,
    cantidad: r.cantidad,
    total: Number(r.total),
    creadoAt: r.created_at,
  }));
}

export const decidirTransferenciaCobre = (v: {
  id: string;
  aprobar: boolean;
  nota: string;
  lote?: boolean;
}) =>
  invocar("cobre-transferencias", {
    accion: "decidir",
    ...(v.lote ? { lote_id: v.id } : { transferencia_id: v.id }),
    aprobar: v.aprobar,
    nota: v.nota,
  });

export async function listDepositosSinAsignar(): Promise<DepositoCobre[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_depositos")
    .select(
      "id, monto, clabe, remitente, clave_rastreo, recibido_at, devolucion_estado, devolucion_motivo",
    )
    .eq("estado", "sin_asignar")
    .order("recibido_at", { ascending: false })
    .limit(50);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    devolucion: r.devolucion_estado,
    devolucionMotivo: r.devolucion_motivo,
    monto: Number(r.monto),
    clabe: r.clabe,
    remitente: r.remitente,
    claveRastreo: r.clave_rastreo,
    recibidoAt: r.recibido_at,
  }));
}

/** Devuelve al remitente un depósito sin asignar (Edge Function `cobre-cuentas`). */
export const devolverDepositoCobre = (depositoId: string) =>
  invocar("cobre-cuentas", { accion: "devolver_deposito", deposito_id: depositoId });

/** Solo en modo simulado: transferencia SPEI entrante a una CLABE. */
export const simularDepositoCobre = (v: { clabe: string; monto: number; remitente?: string }) =>
  invocar("cobre-simulador", { accion: "deposito", ...v });

/** Solo en modo simulado: el pagador paga un cobro R2P (CLABE dinámica). */
export const simularPagoR2p = (clabe: string) =>
  invocar("cobre-simulador", { accion: "pagar_r2p", clabe });

// ── Alta del comercio (Subcliente) e instancia propia ────────────────────────

export type AltaCobre = {
  modo: string;
  instanciaPropia: boolean;
  faltan: string[];
  alta: {
    estado: string;
    motivo: string | null;
    subcliente_externo_id: string | null;
    created_at: string;
    updated_at: string;
    /** Cobre lo rechazó después de aprobarlo (revisión de cumplimiento); el Balance sigue. */
    revocado_at: string | null;
    revocado_motivo: string | null;
    revocado_revisado: boolean;
  } | null;
  cuenta: {
    id: string;
    cuenta_externa_id: string;
    clabe: string | null;
    conectividad: string | null;
  } | null;
};

export const getAltaCobre = (legajo: string) =>
  invocar<AltaCobre>("cobre-subclientes", { accion: "estado", legajo });
export const enviarAltaCobre = (legajo: string) =>
  invocar<AltaCobre & { resultado: string }>("cobre-subclientes", { accion: "enviar", legajo });
export const marcarRevocadoRevisado = (legajo: string) =>
  invocar<{ ok: boolean }>("cobre-subclientes", { accion: "revocado_revisado", legajo });

export const consultarAltaCobre = (legajo: string) =>
  invocar<AltaCobre & { resultado: string }>("cobre-subclientes", { accion: "consultar", legajo });

export type DatosKyb = { empresa: EmpresaKyb; personas: PersonaKyb[] };

export async function getDatosKyb(legajo: string): Promise<DatosKyb> {
  const sb = requireSupabase();
  const [{ data: c, error }, { data: personas, error: e2 }] = await Promise.all([
    sb
      .from("clientes")
      .select("telefono, sitio_web, industria_cobre, pais_constitucion, pais_operacion")
      .eq("legajo", legajo)
      .single(),
    sb.from("cliente_personas_kyb").select("*").eq("cliente_legajo", legajo).order("created_at"),
  ]);
  if (error) throw new DataAccessError(error);
  if (e2) throw new DataAccessError(e2);
  return {
    empresa: {
      telefono: c.telefono ?? "",
      sitioWeb: c.sitio_web ?? "",
      industria: c.industria_cobre ?? "",
      paisConstitucion: c.pais_constitucion ?? "MEX",
      paisOperacion: c.pais_operacion ?? "MEX",
    },
    personas: (personas ?? []).map((r) => ({
      id: r.id,
      rol: r.rol === "beneficiario" ? "beneficiario" : "representante",
      nombre: r.nombre,
      apellido: r.apellido,
      idTipo: r.id_tipo === "curp" ? "curp" : "rfc",
      idNumero: r.id_numero,
      nacionalidades: r.nacionalidades,
      fechaNacimiento: r.fecha_nacimiento,
      porcentaje: r.porcentaje == null ? null : Number(r.porcentaje),
    })),
  };
}

export async function guardarEmpresaKyb(legajo: string, e: EmpresaKyb): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("clientes")
    .update({
      telefono: e.telefono,
      sitio_web: e.sitioWeb,
      industria_cobre: e.industria,
      pais_constitucion: e.paisConstitucion,
      pais_operacion: e.paisOperacion,
    })
    .eq("legajo", legajo);
  if (error) throw new DataAccessError(error);
}

export async function guardarPersonaKyb(legajo: string, p: PersonaKyb): Promise<void> {
  const sb = requireSupabase();
  const fila = {
    cliente_legajo: legajo,
    rol: p.rol,
    nombre: p.nombre.trim(),
    apellido: p.apellido.trim(),
    id_tipo: p.idTipo,
    id_numero: p.idNumero.trim().toUpperCase(),
    nacionalidades: p.nacionalidades,
    fecha_nacimiento: p.fechaNacimiento,
    porcentaje: p.porcentaje,
    updated_at: new Date().toISOString(),
  };
  const { error } = p.id
    ? await sb.from("cliente_personas_kyb").update(fila).eq("id", p.id)
    : await sb.from("cliente_personas_kyb").insert(fila);
  if (error) throw new DataAccessError(error);
}

export async function borrarPersonaKyb(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("cliente_personas_kyb").delete().eq("id", id);
  if (error) throw new DataAccessError(error);
}

export type InstanciaCobre = {
  id: string;
  userId: string;
  baseUrl: string | null;
  suscripcionId: string | null;
  actualizadaAt: string;
};

export async function getInstanciaCobre(legajo: string): Promise<InstanciaCobre | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_instancias")
    .select("id, user_id, base_url, suscripcion_id, updated_at")
    .eq("cliente_legajo", legajo)
    .eq("estado", "activa")
    .maybeSingle();
  if (error) throw new DataAccessError(error);
  return data
    ? {
        id: data.id,
        userId: data.user_id,
        baseUrl: data.base_url,
        suscripcionId: data.suscripcion_id,
        actualizadaAt: data.updated_at,
      }
    : null;
}

export const guardarInstanciaCobre = (v: {
  legajo: string;
  userId: string;
  secret?: string;
  claveWebhook?: string;
  baseUrl?: string;
}) =>
  invocar<{ id: string; url_avisos: string }>("cobre-instancias", {
    accion: "guardar",
    legajo: v.legajo,
    user_id: v.userId,
    secret: v.secret || undefined,
    clave_webhook: v.claveWebhook || undefined,
    base_url: v.baseUrl || undefined,
  });

export const desactivarInstanciaCobre = (id: string) =>
  invocar("cobre-instancias", { accion: "desactivar", instancia_id: id });

export const vincularBalanceInstancia = (id: string, cuentaExterna?: string) =>
  invocar("cobre-instancias", {
    accion: "vincular_balance",
    instancia_id: id,
    cuenta_externa_id: cuentaExterna || undefined,
  });
