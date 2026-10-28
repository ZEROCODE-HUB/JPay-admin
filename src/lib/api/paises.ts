import { requireSupabase } from "@/lib/supabase";
import type { Json } from "@/lib/database.types";
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
  conexion: ConexionProveedor;
};

export type EstadoConexion = "sin_probar" | "ok" | "error";
export type PasoConexion = { paso: string; ok: boolean; detalle: string; ms?: number };

/** Última prueba de conexión del proveedor (la escribe la Edge Function `ecartpay-salud`). */
export type ConexionProveedor = {
  estado: EstadoConexion;
  verificadaAt: string | null;
  entorno: string | null;
  baseUrl: string | null;
  latenciaMs: number | null;
  pasos: PasoConexion[];
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
    conexion: toConexion(r.conexion_estado, r.conexion_verificada_at, r.conexion_detalle),
  };
}

export function toConexion(
  estado: string,
  verificadaAt: string | null,
  detalle: Json,
): ConexionProveedor {
  const d =
    detalle && typeof detalle === "object" && !Array.isArray(detalle)
      ? (detalle as Record<string, unknown>)
      : {};
  const pasos = Array.isArray(d.pasos)
    ? d.pasos.filter(
        (p): p is PasoConexion =>
          !!p && typeof p === "object" && typeof (p as PasoConexion).paso === "string",
      )
    : [];
  return {
    estado: (["ok", "error"].includes(estado) ? estado : "sin_probar") as EstadoConexion,
    verificadaAt,
    entorno: typeof d.entorno === "string" ? d.entorno : null,
    baseUrl: typeof d.baseUrl === "string" ? d.baseUrl : null,
    latenciaMs: typeof d.latenciaMs === "number" ? d.latenciaMs : null,
    pasos,
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

/**
 * Prueba la conexión de la plataforma con Ecart Pay (Edge Function `ecartpay-salud`, solo
 * admins). La función guarda el resultado en `proveedores_pago`, así que alcanza con refrescar.
 */
export async function probarConexionEcartPay(): Promise<{ ok: boolean }> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<{ ok: boolean }>("ecartpay-salud", {
    body: {},
  });
  if (error) {
    // En errores HTTP el mensaje útil viene en el cuerpo ({ error }) de la respuesta.
    const ctx = (error as { context?: Response }).context;
    const cuerpo = ctx ? await ctx.json().catch(() => null) : null;
    throw new DataAccessError(cuerpo?.error ? new Error(cuerpo.error) : error);
  }
  return { ok: data?.ok === true };
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

export type ConexionComercio = {
  id: string;
  comercioId: string;
  comercio: string;
  legajo: string;
  proveedor: string;
  estado: string;
  entorno: string;
  cuentaExternaId: string | null;
  scopes: number;
  conectadoAt: string | null;
  revocadoAt: string | null;
  ultimoError: string | null;
};

/** Conexiones de comercios con proveedores (OAuth), las más recientes primero. */
export async function listConexionesComercios(): Promise<ConexionComercio[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("comercio_proveedores")
    .select(
      "id, comercio_id, proveedor, estado, entorno, cuenta_externa_id, scopes, conectado_at, revocado_at, ultimo_error, comercios(nombre_comercio, legajo)",
    )
    .order("updated_at", { ascending: false });
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    comercioId: r.comercio_id,
    comercio: r.comercios?.nombre_comercio ?? "—",
    legajo: r.comercios?.legajo ?? "—",
    proveedor: r.proveedor,
    estado: r.estado,
    entorno: r.entorno,
    cuentaExternaId: r.cuenta_externa_id,
    scopes: r.scopes?.length ?? 0,
    conectadoAt: r.conectado_at,
    revocadoAt: r.revocado_at,
    ultimoError: r.ultimo_error,
  }));
}

/** Desconecta la cuenta Ecart Pay de un comercio (Edge Function `ecartpay-oauth-desconectar`). */
export async function desconectarComercioEcartPay(comercioId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.functions.invoke("ecartpay-oauth-desconectar", {
    body: { comercio_id: comercioId },
  });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const cuerpo = ctx ? await ctx.json().catch(() => null) : null;
    throw new DataAccessError(cuerpo?.error ? new Error(cuerpo.error) : error);
  }
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
