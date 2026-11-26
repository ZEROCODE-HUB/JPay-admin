import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";
import { errorDeFuncion } from "./edge";

/**
 * Conexiones de un cliente con los proveedores, hechas por un administrador desde su ficha
 * (pestaña Conexiones). El cliente no carga claves ni ve los nombres de los proveedores en su
 * portal: pide la activación y el equipo la hace aquí.
 * - Cobros con tarjeta (Ecart Pay): una conexión OAuth por COMERCIO del cliente.
 * - Cuenta SPEI (Cobre): una cuenta por CLIENTE (alta como Subcliente o su cuenta Cobre propia).
 */

async function invocar<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<T>(fn, { body });
  if (error) throw await errorDeFuncion(error);
  return data as T;
}

// ── Cobros con tarjeta (Ecart Pay), por comercio ─────────────────────────────

export type ConexionTarjeta = {
  estado: string;
  entorno: string;
  cuentaExternaId: string | null;
  conectadoAt: string | null;
  revocadoAt: string | null;
  ultimoError: string | null;
};

export type ComercioConexion = {
  comercioId: string;
  nombre: string;
  estadoComercio: string | null;
  /** La conexión vigente (la conectada o, si no hay, la más reciente). */
  conexion: ConexionTarjeta | null;
};

/** Comercios del cliente con el estado de su conexión de cobros con tarjeta. */
export async function listConexionesTarjeta(legajo: string): Promise<ComercioConexion[]> {
  const sb = requireSupabase();
  const { data: comercios, error } = await sb
    .from("comercios")
    .select("id, nombre_comercio, estado, created_at")
    .eq("legajo", legajo)
    .order("created_at");
  if (error) throw new DataAccessError(error);
  const ids = (comercios ?? []).map((c) => c.id);
  if (ids.length === 0) return [];
  const { data: conexiones, error: e2 } = await sb
    .from("comercio_proveedores")
    .select(
      "comercio_id, estado, entorno, cuenta_externa_id, conectado_at, revocado_at, ultimo_error, updated_at",
    )
    .eq("proveedor", "ecartpay")
    .in("comercio_id", ids)
    .order("updated_at", { ascending: false });
  if (e2) throw new DataAccessError(e2);
  return (comercios ?? []).map((c, i) => {
    const suyas = (conexiones ?? []).filter((x) => x.comercio_id === c.id);
    const x = suyas.find((s) => s.estado === "conectado") ?? suyas[0];
    return {
      comercioId: c.id,
      nombre: c.nombre_comercio || `Comercio ${i + 1}`,
      estadoComercio: c.estado,
      conexion: x
        ? {
            estado: x.estado,
            entorno: x.entorno,
            cuentaExternaId: x.cuenta_externa_id,
            conectadoAt: x.conectado_at,
            revocadoAt: x.revocado_at,
            ultimoError: x.ultimo_error,
          }
        : null,
    };
  });
}

/**
 * Inicia la vinculación (OAuth) de un comercio: devuelve la página de Ecart Pay a la que hay que
 * ir. Ahí se inicia sesión con la cuenta de ESE comercio y, al autorizar, se vuelve a `volverA`.
 */
export async function iniciarVinculacionTarjeta(
  comercioId: string,
  volverA: string,
): Promise<string> {
  const r = await invocar<{ url?: string }>("ecartpay-oauth-inicio", {
    comercio_id: comercioId,
    volver_a: volverA,
  });
  if (!r?.url)
    throw new DataAccessError(new Error("El servidor no devolvió la página de conexión"));
  return r.url;
}

export async function desvincularTarjeta(comercioId: string): Promise<void> {
  await invocar("ecartpay-oauth-desconectar", { comercio_id: comercioId });
}

// ── Cuenta Cobre propia del cliente, en un paso ──────────────────────────────

export type ConexionCobreCliente = {
  conectada: boolean;
  modo: "simulado" | "prueba" | "produccion";
  user_id?: string;
  avisos?: boolean;
  conectada_at?: string;
  cuenta?: { cuenta_externa_id: string; clabe: string | null; conectividad: string | null } | null;
  /** Solo al conectar: pasos que no se pudieron completar. */
  faltantes?: string[];
};

export const getConexionCobreCliente = (legajo: string) =>
  invocar<ConexionCobreCliente>("cobre-instancias", { accion: "conexion_cliente", legajo });

/** Valida las claves con Cobre, las guarda en Vault, vincula su Balance y suscribe los avisos. */
export const conectarCobreCliente = (v: { legajo: string; userId: string; secret: string }) =>
  invocar<ConexionCobreCliente>("cobre-instancias", {
    accion: "conectar_cliente",
    legajo: v.legajo,
    user_id: v.userId,
    secret: v.secret,
  });

export const desconectarCobreCliente = (legajo: string) =>
  invocar<ConexionCobreCliente>("cobre-instancias", { accion: "desconectar_cliente", legajo });
