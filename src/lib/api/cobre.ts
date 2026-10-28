import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/** Cobre (México) desde el backoffice: configuración, cuenta de JPay, aprobaciones y depósitos. */

export type ModeloFondosCobre = "centralizado" | "por_comercio";

export type ConfiguracionCobre = {
  modeloDefault: ModeloFondosCobre;
  montoAprobacion: number | null;
  exigirOtp: boolean;
  cuentaPlataforma: { id: string; clabe: string | null; modo: string } | null;
};

export type TransferenciaCobre = {
  id: string;
  idTxn: string;
  legajo: string;
  monto: number;
  concepto: string | null;
  estado: string;
  motivo: string | null;
  destinatario: string | null;
  creadaAt: string;
};

export type DepositoCobre = {
  id: string;
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
    const ctx = (error as { context?: Response }).context;
    const cuerpo = ctx ? await ctx.json().catch(() => null) : null;
    throw new DataAccessError(cuerpo?.error ? new Error(cuerpo.error) : error);
  }
  return data as T;
}

export async function getConfiguracionCobre(): Promise<ConfiguracionCobre> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_configuracion")
    .select("modelo_default, monto_aprobacion, exigir_otp, cobre_cuentas(id, clabe, modo)")
    .eq("id", 1)
    .single();
  if (error) throw new DataAccessError(error);
  const c = data.cobre_cuentas as unknown as {
    id: string;
    clabe: string | null;
    modo: string;
  } | null;
  return {
    modeloDefault: data.modelo_default as ModeloFondosCobre,
    montoAprobacion: data.monto_aprobacion != null ? Number(data.monto_aprobacion) : null,
    exigirOtp: data.exigir_otp,
    cuentaPlataforma: c,
  };
}

export async function guardarConfiguracionCobre(
  c: Pick<ConfiguracionCobre, "modeloDefault" | "montoAprobacion" | "exigirOtp">,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("cobre_configuracion")
    .update({
      modelo_default: c.modeloDefault,
      monto_aprobacion: c.montoAprobacion,
      exigir_otp: c.exigirOtp,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new DataAccessError(error);
}

export const crearCuentaPlataformaCobre = () =>
  invocar<{ clabe: string | null }>("cobre-cuentas", { accion: "cuenta_plataforma" });

export async function listTransferenciasCobre(estados: string[]): Promise<TransferenciaCobre[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_transferencias")
    .select(
      "id, id_txn, cliente_legajo, monto, concepto, estado, motivo, created_at, cobre_contrapartes(titular, numero)",
    )
    .in("estado", estados)
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
      concepto: r.concepto,
      estado: r.estado,
      motivo: r.motivo,
      destinatario: cp ? `${cp.titular} · ${cp.numero}` : null,
      creadaAt: r.created_at,
    };
  });
}

export const decidirTransferenciaCobre = (v: { id: string; aprobar: boolean; nota: string }) =>
  invocar("cobre-transferencias", {
    accion: "decidir",
    transferencia_id: v.id,
    aprobar: v.aprobar,
    nota: v.nota,
  });

export async function listDepositosSinAsignar(): Promise<DepositoCobre[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("cobre_depositos")
    .select("id, monto, clabe, remitente, clave_rastreo, recibido_at")
    .eq("estado", "sin_asignar")
    .order("recibido_at", { ascending: false })
    .limit(50);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    monto: Number(r.monto),
    clabe: r.clabe,
    remitente: r.remitente,
    claveRastreo: r.clave_rastreo,
    recibidoAt: r.recibido_at,
  }));
}

/** Solo en modo simulado: transferencia SPEI entrante a una CLABE. */
export const simularDepositoCobre = (v: { clabe: string; monto: number; remitente?: string }) =>
  invocar("cobre-simulador", { accion: "deposito", ...v });
