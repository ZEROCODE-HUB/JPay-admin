import { requireSupabase } from "@/lib/supabase";
import { errorDeFuncion } from "./edge";

/**
 * Correo saliente de la plataforma por Resend (Edge Function `correo-config`, solo admins):
 * verificación de correo al registrarse, código de las transferencias y avisos al buzón de
 * soporte cuando un cliente pide la activación de un servicio. La clave de Resend se guarda en
 * Vault y nunca vuelve al navegador (solo sus últimos 4 caracteres).
 */
export type EstadoCorreo = {
  /** Hay clave de Resend (si no, el correo está en modo demo: no se envía nada). */
  configurado: boolean;
  /** `entorno` = secreto RESEND_API_KEY de las funciones; `panel` = cargada aquí. */
  origen_clave: "entorno" | "panel" | null;
  pista: string | null;
  remitente: string;
  /** Sin remitente propio: se usa el de pruebas de Resend (solo le escribe al dueño de la cuenta). */
  remitente_de_prueba: boolean;
  /** Buzón que recibe las solicitudes de los clientes (null = sin configurar). */
  destino: string | null;
  probado: { at: string; ok: boolean; detalle: string | null } | null;
  actualizado: { at: string; por: string | null } | null;
  remitente_fijo: boolean;
  destino_fijo: boolean;
  /** Solo al guardar una clave: dominios verificados en la cuenta de Resend. */
  dominios_verificados?: string[];
  /** Solo al probar. */
  prueba?: { ok: boolean; detalle: string };
};

async function accion(body: Record<string, unknown>): Promise<EstadoCorreo> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke<EstadoCorreo>("correo-config", { body });
  if (error) throw await errorDeFuncion(error);
  return data as EstadoCorreo;
}

export const getEstadoCorreo = () => accion({ accion: "estado" });

/** Campo ausente = no cambia; cadena vacía en remitente o destino = se borra. */
export const guardarCorreo = (v: { clave?: string; remitente?: string; destino?: string }) =>
  accion({ accion: "guardar", ...v });

export const quitarClaveCorreo = () => accion({ accion: "quitar_clave" });

export const probarCorreo = (para?: string) => accion({ accion: "probar", para });
