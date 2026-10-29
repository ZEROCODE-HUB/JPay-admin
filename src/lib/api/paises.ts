import { requireSupabase } from "@/lib/supabase";
import type { Json } from "@/lib/database.types";
import type { Tables, TablesUpdate } from "@/lib/database.types";
import { toReporteCobros, type ReporteCobros } from "@/shared/reporte-cobros";
import { DataAccessError } from "./errors";
import { errorDeFuncion } from "./edge";

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
  /** Cobre: `simulado`, `prueba` o `produccion`. */
  modo: string | null;
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
    modo: typeof d.modo === "string" ? d.modo : null,
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

/** Prende o apaga un módulo de un país sobre el valor guardado (dos clics seguidos no se pisan). */
export async function setModuloPais(
  codigo: string,
  modulo: string,
  activo: boolean,
): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.rpc("pais_cambiar_modulo", {
    p_codigo: codigo,
    p_modulo: modulo,
    p_activo: activo,
  });
  if (error) throw new DataAccessError(error);
}

/**
 * Marca el país de la instalación (desmarca el actual en la misma transacción). Para la interfaz
 * el país lo fija `country` en brand.json.
 */
export async function setPaisPredeterminado(codigo: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.rpc("pais_predeterminar", { p_codigo: codigo });
  if (error) throw new DataAccessError(error);
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

/** Edge Function que prueba la conexión de cada proveedor (solo admins). */
const FUNCION_SALUD: Record<string, string> = { ecartpay: "ecartpay-salud", cobre: "cobre-salud" };

/**
 * Prueba la conexión de la plataforma con un proveedor. La función guarda el resultado en
 * `proveedores_pago`, así que alcanza con refrescar.
 */
export async function probarConexionProveedor(codigo: string): Promise<{ ok: boolean }> {
  const funcion = FUNCION_SALUD[codigo];
  if (!funcion) throw new DataAccessError(new Error(`Sin prueba de conexión para ${codigo}`));
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<{ ok: boolean }>(funcion, { body: {} });
  if (error) {
    throw await errorDeFuncion(error);
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
    throw await errorDeFuncion(error);
  }
}

export type EventoWebhook = {
  id: string;
  origen: string;
  evento: string | null;
  idExterno: string | null;
  estadoExterno: string | null;
  firmaValida: boolean | null;
  resultado: string | null;
  error: string | null;
  intentos: number;
  recibidoAt: string;
  procesadoAt: string | null;
};

/** Últimos avisos de proveedores (webhooks y notify_url) registrados por `ecartpay-webhook`. */
export async function listEventosWebhook(limite = 50): Promise<EventoWebhook[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("webhook_eventos")
    .select(
      "id, origen, evento, id_externo, estado_externo, firma_valida, resultado, error, intentos, recibido_at, procesado_at",
    )
    .order("recibido_at", { ascending: false })
    .limit(limite);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    origen: r.origen,
    evento: r.evento,
    idExterno: r.id_externo,
    estadoExterno: r.estado_externo,
    firmaValida: r.firma_valida,
    resultado: r.resultado,
    error: r.error,
    intentos: r.intentos,
    recibidoAt: r.recibido_at,
    procesadoAt: r.procesado_at,
  }));
}

export type TareaProgramada = {
  ultimaCorridaAt: string | null;
  resultado: Record<string, unknown>;
};

export async function getTareaProgramada(nombre: string): Promise<TareaProgramada | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("tareas_programadas")
    .select("ultima_corrida_at, resultado")
    .eq("nombre", nombre)
    .maybeSingle();
  if (error) throw new DataAccessError(error);
  if (!data) return null;
  const r = data.resultado;
  return {
    ultimaCorridaAt: data.ultima_corrida_at,
    resultado:
      r && typeof r === "object" && !Array.isArray(r) ? (r as Record<string, unknown>) : {},
  };
}

/** Reprocesa un aviso: vuelve a consultar la orden en Ecart Pay (solo admins). */
export async function reprocesarEventoWebhook(eventoId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.functions.invoke("ecartpay-pendientes", {
    body: { evento_id: eventoId },
  });
  if (error) {
    throw await errorDeFuncion(error);
  }
}

export type PuntoFisico = {
  id: string;
  comercio: string;
  legajo: string;
  nombre: string;
  ciudad: string | null;
  estado: string;
  cajas: number;
  conTerminal: number;
};

/** Sucursales (no eliminadas) de todos los comercios con el conteo de cajas y terminales. */
export async function listPuntosFisicos(): Promise<PuntoFisico[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("sucursales")
    .select(
      "id, nombre, ciudad, estado, comercios(nombre_comercio, legajo), cajas(terminal_id, eliminado_at)",
    )
    .is("eliminado_at", null)
    .order("nombre");
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((s) => {
    const cajas = (s.cajas ?? []).filter((c) => !c.eliminado_at);
    return {
      id: s.id,
      comercio: s.comercios?.nombre_comercio ?? "—",
      legajo: s.comercios?.legajo ?? "—",
      nombre: s.nombre,
      ciudad: s.ciudad,
      estado: s.estado,
      cajas: cajas.length,
      conTerminal: cajas.filter((c) => c.terminal_id).length,
    };
  });
}

export type CorridaConciliacion = {
  id: string;
  origen: string;
  ejecutadaAt: string;
  resumen: Record<string, unknown>;
  error: string | null;
};

export type DiferenciaConciliacion = {
  id: string;
  tipo: string;
  ordenId: string | null;
  transaccionId: string | null;
  pagoId: string | null;
  detalle: Record<string, unknown>;
  createdAt: string;
};

const objeto = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/** Últimas corridas de conciliación con un proveedor. */
export async function listConciliacionesProveedor(
  proveedor: string,
  limite = 5,
): Promise<CorridaConciliacion[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("conciliaciones_proveedor")
    .select("id, origen, ejecutada_at, resumen, error")
    .eq("proveedor", proveedor)
    .order("ejecutada_at", { ascending: false })
    .limit(limite);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((c) => ({
    id: c.id,
    origen: c.origen,
    ejecutadaAt: c.ejecutada_at,
    resumen: objeto(c.resumen),
    error: c.error,
  }));
}

/** Diferencias de conciliación sin resolver de un proveedor. */
export async function listDiferenciasAbiertas(
  proveedor: string,
): Promise<DiferenciaConciliacion[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("conciliacion_proveedor_diferencias")
    .select(
      "id, tipo, orden_id, transaccion_id, pago_id, detalle, created_at, conciliaciones_proveedor!inner(proveedor)",
    )
    .eq("conciliaciones_proveedor.proveedor", proveedor)
    .eq("resuelta", false)
    .order("created_at", { ascending: false });
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((d) => ({
    id: d.id,
    tipo: d.tipo,
    ordenId: d.orden_id,
    transaccionId: d.transaccion_id,
    pagoId: d.pago_id,
    detalle: objeto(d.detalle),
    createdAt: d.created_at,
  }));
}

/** Marca una diferencia como resuelta (RLS: `movimientos: modificar`). */
export async function resolverDiferencia(id: string, nota: string): Promise<void> {
  const sb = requireSupabase();
  const { data: auth } = await sb.auth.getUser();
  const { data, error } = await sb
    .from("conciliacion_proveedor_diferencias")
    .update({
      resuelta: true,
      resuelta_at: new Date().toISOString(),
      resuelta_por: auth.user?.id ?? null,
      nota: nota.trim() || null,
    })
    .eq("id", id)
    .select("id");
  if (error) throw new DataAccessError(error);
  // Sin permiso, RLS no da error: simplemente no actualiza ninguna fila.
  if (!data?.length) {
    throw new DataAccessError(
      new Error("No se pudo marcar la diferencia (sin permiso o ya no existe)"),
    );
  }
}

/** Corre la conciliación ahora (Edge Function `<proveedor>-conciliacion`, solo admins). */
export async function conciliarAhora(proveedor: string): Promise<Record<string, unknown>> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<Record<string, unknown>>(
    `${proveedor}-conciliacion`,
    { body: { manual: true } },
  );
  if (error) {
    throw await errorDeFuncion(error);
  }
  return data ?? {};
}

export type ContracargoProveedor = {
  id: string;
  idExterno: string;
  legajo: string | null;
  ordenId: string | null;
  monto: number | null;
  moneda: string | null;
  motivo: string | null;
  estado: string;
  venceAt: string | null;
  updatedAt: string;
};

/** Contracargos avisados por Ecart Pay (webhooks firmados), los más recientes primero. */
export async function listContracargosProveedor(): Promise<ContracargoProveedor[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("contracargos_proveedor")
    .select(
      "id, id_externo, cliente_legajo, orden_id, monto, moneda, motivo, estado, vence_at, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((c) => ({
    id: c.id,
    idExterno: c.id_externo,
    legajo: c.cliente_legajo,
    ordenId: c.orden_id,
    monto: c.monto != null ? Number(c.monto) : null,
    moneda: c.moneda,
    motivo: c.motivo,
    estado: c.estado,
    venceAt: c.vence_at,
    updatedAt: c.updated_at,
  }));
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

/** Reporte de cobros con Ecart Pay de todos los comercios (o de uno) en un período. */
export async function getReporteCobrosProveedor(
  desde: string,
  hasta: string,
  comercioId?: string,
): Promise<ReporteCobros> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("reporte_cobros_proveedor", {
    p_desde: desde,
    p_hasta: hasta,
    p_comercio_id: comercioId,
  });
  if (error) throw new DataAccessError(error);
  return toReporteCobros(data);
}

export type PlanMsi = {
  meses: number;
  activo: boolean;
  /** true = cuotas con interés que paga el cliente; false = sin intereses (las absorbe el comercio). */
  cuotasFijas: boolean;
  minimo: number | null;
  maximo: number | null;
  /** Comisión de Ecart Pay por el plazo (%), si la informa. */
  tasa: number | null;
};

export type ConfigMsi = { habilitado: boolean; planes: PlanMsi[]; amexCuotasFijas: boolean };

async function invocarMsi(body: Record<string, unknown>): Promise<ConfigMsi> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<ConfigMsi>("ecartpay-msi", { body });
  if (error) {
    throw await errorDeFuncion(error);
  }
  if (!data) throw new DataAccessError(new Error("Respuesta vacía de Ecart Pay"));
  return data;
}

/** Meses sin intereses del comercio en su cuenta Ecart Pay (Edge Function `ecartpay-msi`). */
export const getMsiComercio = (comercioId: string) =>
  invocarMsi({ accion: "leer", comercio_id: comercioId });

export const guardarMsiComercio = (comercioId: string, c: ConfigMsi) =>
  invocarMsi({
    accion: "guardar",
    comercio_id: comercioId,
    amex_cuotas_fijas: c.amexCuotasFijas,
    planes: c.planes.map((p) => ({
      meses: p.meses,
      activo: p.activo,
      cuotas_fijas: p.cuotasFijas,
      minimo: p.minimo,
      maximo: p.maximo,
    })),
  });

export type AlertaProveedor = {
  codigo: string;
  nivel: "critica" | "aviso";
  cantidad: number;
  detalle: string;
};

/** Alertas operativas de un proveedor calculadas en el momento (RPC solo para backoffice). */
export async function listAlertasProveedor(proveedor: string): Promise<AlertaProveedor[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc("alertas_proveedor_pagos", { p_proveedor: proveedor });
  if (error) throw new DataAccessError(error);
  const alertas = (data as { alertas?: unknown } | null)?.alertas;
  return Array.isArray(alertas) ? (alertas as AlertaProveedor[]) : [];
}
