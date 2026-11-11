import { requireSupabase } from "@/lib/supabase";
import { getPais } from "@/shared/pais";
import { DataAccessError } from "./errors";

/** Saldo de cada subcuenta de los clientes (Administración → Registros → Fondos por usuario). */
export type FondoSubcuenta = {
  id: string;
  legajo: string;
  email: string;
  nombre: string;
  subcuenta: string;
  /** CLABE (columna `cbu`); null si todavía no tiene. */
  cuenta: string | null;
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
    pais: string | null;
  } | null;
  subaccount_balances:
    | { saldo_disponible: number | null; saldo_retenido: number | null }
    | { saldo_disponible: number | null; saldo_retenido: number | null }[]
    | null;
};

/** Filas por pedido: PostgREST corta cada respuesta en 1000. */
const LOTE = 1000;

/** Todas las subcuentas con su saldo (se piden en lotes de 1000 hasta traer todas). */
export async function listFondosPorUsuario(): Promise<FondoSubcuenta[]> {
  const sb = requireSupabase();
  const filas: Fila[] = [];
  for (;;) {
    const { data, error } = await sb
      .from("subaccounts")
      .select(
        "id, cliente_legajo, nombre, tipo, cbu, moneda, estado, clientes(correo, nombre, pais), subaccount_balances(saldo_disponible, saldo_retenido)",
      )
      .order("cliente_legajo")
      .order("created_at")
      .order("id")
      .range(filas.length, filas.length + LOTE - 1);
    if (error) throw new DataAccessError(error);
    const lote = (data ?? []) as unknown as Fila[];
    if (lote.length === 0) break;
    filas.push(...lote);
  }
  return filas.map((r) => {
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
      moneda: r.moneda ?? getPais().moneda,
      disponible: Number(b?.saldo_disponible ?? 0),
      retenido: Number(b?.saldo_retenido ?? 0),
      activa: r.estado === "Activa",
    };
  });
}
