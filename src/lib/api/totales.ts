import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/**
 * Totales que calcula la base (migración 1058): por moneda, solo lo contabilizado y sin tope de
 * filas. Nunca se suman pesos con dólares.
 */
export type Moneda = "MXN" | "USD";

export type ComisionesMoneda = {
  monto: number;
  comision: number;
  iva: number;
  operaciones: number;
  remanente: number;
  por_cliente: {
    legajo: string;
    nombre: string;
    monto: number;
    comision: number;
    iva: number;
    operaciones: number;
  }[];
};

/** Depósitos, envíos y conversiones del período con su comisión (tarjeta del Dashboard). */
export async function getComisionesDashboard(
  desde: string,
  hasta: string,
): Promise<Partial<Record<Moneda, ComisionesMoneda>>> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("admin_comisiones_dashboard", {
    p_desde: desde,
    p_hasta: hasta,
  });
  if (error) throw new DataAccessError(error);
  return (data ?? {}) as unknown as Partial<Record<Moneda, ComisionesMoneda>>;
}

export type ResumenCliente = {
  saldos: Partial<
    Record<Moneda, { disponible: number; retenido: number; total: number; subcuentas: number }>
  >;
  subcuentas: number;
  movimientos: number;
  movimientos_por_tipo: Record<string, number>;
  comisiones: number;
  alertas: number;
  bloqueos: number;
};

/** Cifras del detalle del cliente: saldo por moneda, movimientos por tipo y conteos reales. */
export async function getResumenCliente(
  legajo: string,
  desde?: string,
  hasta?: string,
): Promise<ResumenCliente> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("admin_resumen_cliente", {
    p_legajo: legajo,
    p_desde: desde,
    p_hasta: hasta,
  });
  if (error) throw new DataAccessError(error);
  return data as unknown as ResumenCliente;
}

export type FondosMoneda = {
  disponible: number;
  retenido: number;
  total: number;
  subcuentas: number;
  clientes: number;
};

/** Total de «Fondos por usuario» por moneda. */
export async function getFondosTotales(): Promise<Partial<Record<Moneda, FondosMoneda>>> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("admin_fondos_totales");
  if (error) throw new DataAccessError(error);
  return (data ?? {}) as unknown as Partial<Record<Moneda, FondosMoneda>>;
}
