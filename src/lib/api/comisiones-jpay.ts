import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/**
 * Calculadora de comisiones de JPay (RPC `comisiones_jpay`). JPay no toca dinero: Ecart Pay le
 * paga la suma de sus comisiones y, con Cobre, se calcula y se le pide el pago a cada empresa
 * (o se descuenta del saldo, según el modo de Cobre).
 */
export type FilaComision = {
  proveedor: "ecartpay" | "cobre";
  producto: string;
  legajo: string;
  nombre: string;
  operaciones: number;
  base: number;
  comision: number;
  iva: number;
  /** "por_cobrar": hay que pedirla; "descontada": ya salió del saldo del comercio (Cobre). */
  forma: "por_cobrar" | "descontada";
  /** Moneda de la base y la comisión (MXN o USD: no se suman entre sí). */
  moneda: "MXN" | "USD";
};

export type PagoComisiones = {
  id: string;
  proveedor: "ecartpay" | "cobre";
  legajo: string | null;
  desde: string;
  hasta: string;
  monto: number;
  fechaPago: string;
  referencia: string | null;
  nota: string | null;
};

export async function getComisionesJpay(desde: string, hasta: string): Promise<FilaComision[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("comisiones_jpay", { p_desde: desde, p_hasta: hasta });
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    proveedor: r.proveedor as FilaComision["proveedor"],
    producto: r.producto,
    legajo: r.cliente_legajo,
    nombre: r.cliente_nombre ?? r.cliente_legajo,
    operaciones: Number(r.operaciones),
    base: Number(r.base),
    comision: Number(r.comision),
    iva: Number(r.iva),
    forma: r.forma as FilaComision["forma"],
    moneda: r.moneda === "USD" ? "USD" : "MXN",
  }));
}

/** Pagos recibidos cuyo período se cruza con [desde, hasta]. */
export async function listPagosComisiones(desde: string, hasta: string): Promise<PagoComisiones[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("pagos_comisiones_jpay")
    .select(
      "id, proveedor, cliente_legajo, periodo_desde, periodo_hasta, monto, fecha_pago, referencia, nota",
    )
    .lte("periodo_desde", hasta)
    .gte("periodo_hasta", desde)
    .order("fecha_pago", { ascending: false });
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    proveedor: r.proveedor as PagoComisiones["proveedor"],
    legajo: r.cliente_legajo,
    desde: r.periodo_desde,
    hasta: r.periodo_hasta,
    monto: Number(r.monto),
    fechaPago: r.fecha_pago,
    referencia: r.referencia,
    nota: r.nota,
  }));
}

export async function registrarPagoComisiones(p: {
  proveedor: "ecartpay" | "cobre";
  legajo: string | null;
  desde: string;
  hasta: string;
  monto: number;
  fechaPago: string;
  referencia: string;
  nota: string;
}): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.rpc("registrar_pago_comisiones", {
    p_proveedor: p.proveedor,
    p_cliente_legajo: p.legajo ?? "",
    p_desde: p.desde,
    p_hasta: p.hasta,
    p_monto: p.monto,
    p_fecha_pago: p.fechaPago,
    p_referencia: p.referencia,
    p_nota: p.nota,
  });
  if (error) throw new DataAccessError(error);
}
