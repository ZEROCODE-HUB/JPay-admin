import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/**
 * Reembolso "en verificación": se pidió a Ecart Pay, no hubo respuesta clara y no se sabe si se
 * hizo. Sigue descontando del disponible del pago hasta que el backoffice lo resuelve.
 */
export type ReembolsoEnVerificacion = {
  id: string;
  pagoId: string;
  monto: number;
  motivo: string;
  nota: string | null;
  origen: string;
  error: string | null;
  creadoAt: string;
  legajo: string | null;
  ordenId: string | null;
  montoPago: number;
  metodo: string | null;
};

export async function listReembolsosEnVerificacion(): Promise<ReembolsoEnVerificacion[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("reembolsos_en_verificacion");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    pagoId: r.pago_id,
    monto: Number(r.monto),
    motivo: r.motivo,
    nota: r.nota,
    origen: r.origen,
    error: r.error,
    creadoAt: r.created_at,
    legajo: r.cliente_legajo,
    ordenId: r.proveedor_orden_id,
    montoPago: Number(r.monto_pago),
    metodo: r.metodo,
  }));
}

/** `hecho`: el reembolso figura en el panel de Ecart Pay (descuenta del pago); si no, se libera. */
export async function resolverReembolso(id: string, hecho: boolean, nota: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.rpc("resolver_reembolso", { p_id: id, p_ok: hecho, p_nota: nota });
  if (error) throw new DataAccessError(error);
}
