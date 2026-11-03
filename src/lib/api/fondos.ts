import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/** Saldo de cada subcuenta de los clientes (Administración → Registros → Fondos por usuario). */
export type FondoSubcuenta = {
  id: string;
  legajo: string;
  email: string;
  nombre: string;
  subcuenta: string;
  /** CLABE (México) o CBU/CVU (Argentina); null si todavía no tiene. */
  cuenta: string | null;
  alias: string | null;
  moneda: string;
  disponible: number;
  retenido: number;
  /** Subcuenta habilitada (Activa) o no. */
  activa: boolean;
};

type Fila = {
  id: string;
  cliente_legajo: string;
  nombre: string | null;
  tipo: string | null;
  cbu: string | null;
  moneda: string | null;
  estado: string | null;
  clientes: {
    correo: string | null;
    nombre: string | null;
    alias: string | null;
    pais: string | null;
  } | null;
  subaccount_balances:
    | { saldo_disponible: number | null; saldo_retenido: number | null }
    | { saldo_disponible: number | null; saldo_retenido: number | null }[]
    | null;
};

const MONEDA_PAIS: Record<string, string> = { MX: "MXN", AR: "ARS" };

export async function listFondosPorUsuario(): Promise<FondoSubcuenta[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("subaccounts")
    .select(
      "id, cliente_legajo, nombre, tipo, cbu, moneda, estado, clientes(correo, nombre, alias, pais), subaccount_balances(saldo_disponible, saldo_retenido)",
    )
    .order("cliente_legajo")
    .order("created_at");
  if (error) throw new DataAccessError(error);
  return ((data ?? []) as unknown as Fila[]).map((r) => {
    const b = Array.isArray(r.subaccount_balances)
      ? r.subaccount_balances[0]
      : r.subaccount_balances;
    return {
      id: r.id,
      legajo: r.cliente_legajo,
      email: r.clientes?.correo ?? "—",
      nombre: r.clientes?.nombre ?? "—",
      subcuenta: r.nombre || r.tipo || "Principal",
      cuenta: r.cbu,
      alias: r.clientes?.alias ?? null,
      moneda: r.moneda ?? MONEDA_PAIS[r.clientes?.pais ?? ""] ?? "ARS",
      disponible: Number(b?.saldo_disponible ?? 0),
      retenido: Number(b?.saldo_retenido ?? 0),
      activa: r.estado === "Activa",
    };
  });
}
