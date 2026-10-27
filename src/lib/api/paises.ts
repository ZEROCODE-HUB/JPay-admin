import { requireSupabase } from "@/lib/supabase";
import type { Tables, TablesUpdate } from "@/lib/database.types";
import { DataAccessError } from "./errors";

/**
 * Configuración por país y por proveedor de pagos (migración 1015): países, feriados,
 * proveedores y valores por defecto de cobro (modelo de fondos y comisión de la plataforma).
 */

export type ModeloFondos = "directo" | "centralizado";
export type CobroComision = "split_proveedor" | "descuento_liquidacion" | "cobro_aparte";

export type Pais = {
  codigo: string;
  nombre: string;
  locale: string;
  moneda: string;
  timezone: string;
  prefijoTelefono: string;
  taxIdTipos: string[];
  cuentaBancariaTipo: string;
  modulos: Record<string, boolean>;
  activo: boolean;
  predeterminado: boolean;
};

export type ProveedorPago = {
  codigo: string;
  nombre: string;
  pais: string;
  tipos: string[];
  activo: boolean;
  sandbox: boolean;
};

export type ConfiguracionPagos = {
  pais: string;
  proveedor: string;
  modeloFondos: ModeloFondos;
  cobroComision: CobroComision;
  comisionPct: number;
  comisionFija: number;
  ivaComisionPct: number;
  updatedAt: string;
};

export type Feriado = { pais: string; fecha: string; descripcion: string };

function toPais(r: Tables<"paises">): Pais {
  const modulos =
    r.modulos && typeof r.modulos === "object" && !Array.isArray(r.modulos)
      ? Object.fromEntries(Object.entries(r.modulos).map(([k, v]) => [k, v === true]))
      : {};
  return {
    codigo: r.codigo,
    nombre: r.nombre,
    locale: r.locale,
    moneda: r.moneda,
    timezone: r.timezone,
    prefijoTelefono: r.prefijo_telefono,
    taxIdTipos: r.tax_id_tipos ?? [],
    cuentaBancariaTipo: r.cuenta_bancaria_tipo,
    modulos,
    activo: r.activo,
    predeterminado: r.predeterminado,
  };
}

function toProveedor(r: Tables<"proveedores_pago">): ProveedorPago {
  return {
    codigo: r.codigo,
    nombre: r.nombre,
    pais: r.pais,
    tipos: r.tipos ?? [],
    activo: r.activo,
    sandbox: r.sandbox,
  };
}

function toConfiguracion(r: Tables<"configuracion_pagos">): ConfiguracionPagos {
  return {
    pais: r.pais,
    proveedor: r.proveedor,
    modeloFondos: r.modelo_fondos as ModeloFondos,
    cobroComision: r.cobro_comision as CobroComision,
    comisionPct: Number(r.comision_pct),
    comisionFija: Number(r.comision_fija),
    ivaComisionPct: Number(r.iva_comision_pct),
    updatedAt: r.updated_at,
  };
}

export async function listPaises(): Promise<Pais[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("paises")
    .select("*")
    .order("predeterminado", { ascending: false })
    .order("nombre");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map(toPais);
}

export async function updatePais(
  codigo: string,
  input: Partial<Pick<Pais, "activo" | "modulos">>,
): Promise<void> {
  const sb = requireSupabase();
  const payload: TablesUpdate<"paises"> = {};
  if (input.activo !== undefined) payload.activo = input.activo;
  if (input.modulos !== undefined) payload.modulos = input.modulos;
  const { error } = await sb.from("paises").update(payload).eq("codigo", codigo);
  if (error) throw new DataAccessError(error);
}

/**
 * Marca el país de la instalación. Hay un índice único sobre `predeterminado`, así que primero
 * se desmarca el actual. Para la interfaz el país lo fija `country` en brand.json.
 */
export async function setPaisPredeterminado(codigo: string): Promise<void> {
  const sb = requireSupabase();
  const { error: e1 } = await sb
    .from("paises")
    .update({ predeterminado: false })
    .eq("predeterminado", true)
    .neq("codigo", codigo);
  if (e1) throw new DataAccessError(e1);
  const { error: e2 } = await sb
    .from("paises")
    .update({ predeterminado: true, activo: true })
    .eq("codigo", codigo);
  if (e2) throw new DataAccessError(e2);
}

export async function listProveedoresPago(): Promise<ProveedorPago[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("proveedores_pago").select("*").order("nombre");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map(toProveedor);
}

export async function updateProveedorPago(
  codigo: string,
  input: Partial<Pick<ProveedorPago, "activo" | "sandbox">>,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("proveedores_pago").update(input).eq("codigo", codigo);
  if (error) throw new DataAccessError(error);
}

export async function listConfiguracionPagos(): Promise<ConfiguracionPagos[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("configuracion_pagos").select("*").order("pais");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map(toConfiguracion);
}

export async function updateConfiguracionPagos(
  pais: string,
  proveedor: string,
  input: Omit<ConfiguracionPagos, "pais" | "proveedor" | "updatedAt">,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("configuracion_pagos")
    .update({
      modelo_fondos: input.modeloFondos,
      cobro_comision: input.cobroComision,
      comision_pct: input.comisionPct,
      comision_fija: input.comisionFija,
      iva_comision_pct: input.ivaComisionPct,
    })
    .eq("pais", pais)
    .eq("proveedor", proveedor);
  if (error) throw new DataAccessError(error);
}

/** Feriados del país desde `desde` (fecha ISO), ordenados. */
export async function listFeriados(pais: string, desde: string): Promise<Feriado[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("feriados")
    .select("pais, fecha, descripcion")
    .eq("pais", pais)
    .gte("fecha", desde)
    .order("fecha");
  if (error) throw new DataAccessError(error);
  return data ?? [];
}
