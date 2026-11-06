import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";
import { errorDeFuncion } from "./edge";

export type ComercioConEcartPay = {
  id: string;
  nombre: string;
  legajo: string;
  entorno: string;
};

/** Comercios con su cuenta de Ecart Pay conectada (los únicos que pueden tener POS). */
export async function listComerciosConEcartPay(): Promise<ComercioConEcartPay[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("comercio_proveedores")
    .select("comercio_id, entorno, comercios(nombre_comercio, legajo)")
    .eq("proveedor", "ecartpay")
    .eq("estado", "conectado");
  if (error) throw new DataAccessError(error);
  type Fila = {
    comercio_id: string;
    entorno: string;
    comercios: { nombre_comercio: string | null; legajo: string } | null;
  };
  return ((data ?? []) as unknown as Fila[])
    .map((r) => ({
      id: r.comercio_id,
      nombre: r.comercios?.nombre_comercio || r.comercios?.legajo || r.comercio_id,
      legajo: r.comercios?.legajo ?? "—",
      entorno: r.entorno,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export type CobroEcartPay = {
  id: string;
  comercio: string;
  creadoAt: string;
  pagadoAt: string | null;
  metodo: string | null;
  estado: string;
  monto: number;
  moneda: string;
  reembolsado: number;
  comision: number | null;
  pagador: string | null;
};

/** Últimos cobros con Ecart Pay de los comercios de un cliente. */
export async function listCobrosEcartPayCliente(
  legajo: string,
  limite = 20,
): Promise<CobroEcartPay[]> {
  const sb = requireSupabase();
  const { data: comercios, error: e1 } = await sb
    .from("comercios")
    .select("id, nombre_comercio")
    .eq("legajo", legajo);
  if (e1) throw new DataAccessError(e1);
  const nombres = new Map((comercios ?? []).map((c) => [c.id, c.nombre_comercio ?? legajo]));
  if (nombres.size === 0) return [];
  const { data, error } = await sb
    .from("pagos")
    .select(
      "id, comercio_id, created_at, pagado_at, metodo, estado, monto, moneda, monto_reembolsado, comision_proveedor, pagador_nombre, pagador_email",
    )
    .eq("proveedor", "ecartpay")
    .in("comercio_id", [...nombres.keys()])
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((p) => ({
    id: p.id,
    comercio: (p.comercio_id && nombres.get(p.comercio_id)) || "—",
    creadoAt: p.created_at,
    pagadoAt: p.pagado_at,
    metodo: p.metodo,
    estado: p.estado,
    monto: Number(p.monto),
    moneda: p.moneda,
    reembolsado: Number(p.monto_reembolsado ?? 0),
    comision: p.comision_proveedor != null ? Number(p.comision_proveedor) : null,
    pagador: p.pagador_nombre ?? p.pagador_email,
  }));
}

export type RetiroEcartPay = {
  id: string;
  transaccionId: string | null;
  estado: string;
  monto: number;
  comision: number;
  moneda: string | null;
  enRevision: boolean;
  creadoAt: string | null;
};

export type RetirosEcartPay = {
  retiros: RetiroEcartPay[];
  total: number;
  saldo: { moneda: string; cobrado: number; cargos: number; disponible: number } | null;
  /** Partes que Ecart Pay no pudo devolver (el resto se muestra igual). */
  errores: string[];
};

/** Saldo e historial de retiros de un comercio en Ecart Pay (Edge Function `ecartpay-retiros`). */
export async function getRetirosEcartPayComercio(comercioId: string): Promise<RetirosEcartPay> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<RetirosEcartPay>("ecartpay-retiros", {
    body: { comercio_id: comercioId, pagina: 1 },
  });
  if (error) throw await errorDeFuncion(error);
  if (!data) throw new Error("Respuesta vacía de Ecart Pay");
  return data;
}
