// Edge Function: cambio manual de estado de un movimiento.
// Delega la operación atómica a la RPC `cambiar_estado_movimiento` (supabase/migrations/0002).
// Usa el JWT del usuario que llama para que la RPC valide que es un admin activo.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return json({ error: "Falta el token de sesión" }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) {
    return json({ error: "Falta configuración del servidor" }, 500);
  }

  let body: { movimiento_id?: string; nuevo_estado_id?: number; observaciones?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido" }, 400);
  }

  const sb = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await sb.rpc("cambiar_estado_movimiento", {
    p_movimiento_id: body.movimiento_id,
    p_nuevo_estado_id: body.nuevo_estado_id,
    p_comentario: body.observaciones ?? null,
  });

  if (error) {
    const status = /42501/.test(error.code ?? "") || /permiso/i.test(error.message) ? 403 : 400;
    return json({ error: error.message }, status);
  }

  return json(data);
});
