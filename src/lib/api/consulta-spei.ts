import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/** Resultado de buscar una operación SPEI de Cobre por clave de rastreo, TXID o ID de Cobre. */
export type OperacionSpei = {
  tipo: "Depósito" | "Transferencia";
  id: string;
  legajo: string | null;
  monto: number;
  moneda: string;
  estado: string;
  fecha: string;
  claveRastreo: string | null;
  cep: string | null;
  /** Remitente (depósito) o identificador interno (TXID de la transferencia). */
  referencia: string | null;
  idCobre: string | null;
  motivo: string | null;
};

/** Busca en los registros de JPay (no consulta a Cobre). Coincidencia exacta. */
export async function buscarOperacionSpei(texto: string): Promise<OperacionSpei[]> {
  const v = texto.trim().replace(/[^\w-]/g, "");
  if (!v) return [];
  const sb = requireSupabase();
  const [dep, tra] = await Promise.all([
    sb
      .from("cobre_depositos")
      .select(
        "id, cliente_legajo, monto, estado, recibido_at, clave_rastreo, cep, remitente, transaccion_externa_id, devolucion_estado",
      )
      .or(`clave_rastreo.eq.${v},transaccion_externa_id.eq.${v}`)
      .limit(20),
    sb
      .from("cobre_transferencias")
      .select(
        "id, cliente_legajo, monto, moneda, estado, created_at, clave_rastreo, cep, id_txn, mm_id, motivo",
      )
      .or(`clave_rastreo.eq.${v},id_txn.eq.${v},mm_id.eq.${v}`)
      .limit(20),
  ]);
  if (dep.error) throw new DataAccessError(dep.error);
  if (tra.error) throw new DataAccessError(tra.error);
  return [
    ...(dep.data ?? []).map((d): OperacionSpei => ({
      tipo: "Depósito",
      id: d.id,
      legajo: d.cliente_legajo,
      monto: Number(d.monto),
      moneda: "MXN",
      estado: d.devolucion_estado ? `${d.estado} · devolución ${d.devolucion_estado}` : d.estado,
      fecha: d.recibido_at,
      claveRastreo: d.clave_rastreo,
      cep: d.cep,
      referencia: d.remitente,
      idCobre: d.transaccion_externa_id,
      motivo: null,
    })),
    ...(tra.data ?? []).map((t): OperacionSpei => ({
      tipo: "Transferencia",
      id: t.id,
      legajo: t.cliente_legajo,
      monto: Number(t.monto),
      moneda: t.moneda ?? "MXN",
      estado: t.estado,
      fecha: t.created_at,
      claveRastreo: t.clave_rastreo,
      cep: t.cep,
      referencia: t.id_txn,
      idCobre: t.mm_id,
      motivo: t.motivo,
    })),
  ];
}
