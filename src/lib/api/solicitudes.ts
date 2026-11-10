import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/**
 * Solicitudes de contacto que dejan los comercios desde el portal (tabla `solicitudes_contacto`):
 * servicios que activa un ejecutivo de JPay, como Domiciliación.
 */
export type EstadoSolicitud = "nueva" | "contactado" | "descartada";

export type Solicitud = {
  id: string;
  legajo: string;
  cliente: string;
  servicio: string;
  nombre: string;
  telefono: string;
  correo: string;
  mensaje: string | null;
  estado: EstadoSolicitud;
  nota: string | null;
  atendidaPor: string | null;
  atendidaAt: string | null;
  createdAt: string;
};

export async function listSolicitudes(estado: EstadoSolicitud | "todas"): Promise<Solicitud[]> {
  const sb = requireSupabase();
  let q = sb
    .from("solicitudes_contacto")
    .select(
      "id, cliente_legajo, servicio, nombre, telefono, correo, mensaje, estado, nota, atendida_por, atendida_at, created_at, clientes(nombre, nombre_fantasia)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (estado !== "todas") q = q.eq("estado", estado);
  const { data, error } = await q;
  if (error) throw new DataAccessError(error);
  return (data ?? []).map((r) => {
    const c = (Array.isArray(r.clientes) ? r.clientes[0] : r.clientes) as {
      nombre: string | null;
      nombre_fantasia: string | null;
    } | null;
    return {
      id: r.id,
      legajo: r.cliente_legajo,
      cliente: c?.nombre_fantasia || c?.nombre || r.cliente_legajo,
      servicio: r.servicio,
      nombre: r.nombre,
      telefono: r.telefono,
      correo: r.correo,
      mensaje: r.mensaje,
      estado: r.estado as EstadoSolicitud,
      nota: r.nota,
      atendidaPor: r.atendida_por,
      atendidaAt: r.atendida_at,
      createdAt: r.created_at,
    };
  });
}

/** Cantidad de solicitudes nuevas (para el contador del menú). */
export async function contarSolicitudesNuevas(): Promise<number> {
  const sb = requireSupabase();
  const { count, error } = await sb
    .from("solicitudes_contacto")
    .select("id", { count: "exact", head: true })
    .eq("estado", "nueva");
  if (error) throw new DataAccessError(error);
  return count ?? 0;
}

export async function atenderSolicitud(id: string, estado: EstadoSolicitud, nota: string) {
  const sb = requireSupabase();
  const { error } = await sb.rpc("atender_solicitud_contacto", {
    p_id: id,
    p_estado: estado,
    p_nota: nota,
  });
  if (error) throw new DataAccessError(error);
}
