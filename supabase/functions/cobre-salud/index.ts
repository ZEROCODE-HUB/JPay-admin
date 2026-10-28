// Edge Function: prueba de conexión de la plataforma con Cobre (solo admins).
// Pasos: modo y credenciales → token → lectura de cuentas → clave de webhooks. Guarda el
// resultado en `proveedores_pago.conexion_*` y lo devuelve. En modo `simulado` prueba contra el
// simulador. Nunca incluye credenciales en la respuesta ni en la base.

import { CobreError, credencialesCobre, modoCobre } from "../_shared/cobre.ts";
import { claveWebhookCobre, conexionCobre } from "../_shared/cobre-servidor.ts";
import { handler, HttpError, json, serviceClient, userClient } from "../_shared/http.ts";

type Paso = { paso: string; ok: boolean; detalle: string; ms?: number };

Deno.serve(
  handler(async (req) => {
    const { data: esAdmin, error: errAdmin } = await userClient(req).rpc("is_admin");
    if (errAdmin || esAdmin !== true) throw new HttpError(403, "Solo para administradores");

    const sb = serviceClient();
    const modo = modoCobre();
    const pasos: Paso[] = [];
    const inicio = Date.now();

    const credOk = modo === "simulado" || !!credencialesCobre();
    pasos.push({
      paso: "claves",
      ok: credOk,
      detalle:
        modo === "simulado"
          ? "Modo simulado: no usa credenciales de Cobre"
          : credOk
            ? "COBRE_USER_ID y COBRE_SECRET configuradas"
            : "Faltan COBRE_USER_ID o COBRE_SECRET en los secretos",
    });

    let cuentas: number | null = null;
    if (credOk) {
      let cliente;
      try {
        cliente = conexionCobre(sb).cliente;
      } catch (e) {
        pasos.push({ paso: "token", ok: false, detalle: (e as Error).message });
      }
      if (cliente) {
        const c = cliente;
        const ok = await medir(pasos, "token", async () => {
          await c.token(true);
          return "Token generado";
        });
        if (ok) {
          await medir(pasos, "api", async () => {
            const r = await c.get<{ total_items?: number }>("/accounts", { page_size: 1 });
            cuentas = typeof r?.total_items === "number" ? r.total_items : null;
            return `GET /accounts respondió (${cuentas ?? "?"} cuentas)`;
          });
        }
      }
    }

    const clave = await claveWebhookCobre(modo);
    pasos.push({
      paso: "webhook",
      ok: !!clave,
      detalle:
        modo === "simulado"
          ? "Avisos firmados por el simulador"
          : clave
            ? "Clave de firma de avisos configurada"
            : "Falta COBRE_WEBHOOK_KEY (la event_signature_key de la suscripción)",
    });

    const ok = pasos.every((p) => p.ok);
    const detalle = { modo, cuentas, latenciaMs: Date.now() - inicio, pasos };
    const verificadaAt = new Date().toISOString();
    const { error } = await sb
      .from("proveedores_pago")
      .update({
        conexion_estado: ok ? "ok" : "error",
        conexion_verificada_at: verificadaAt,
        conexion_detalle: detalle,
        sandbox: modo !== "produccion",
      })
      .eq("codigo", "cobre");
    if (error) throw new HttpError(500, error.message);

    return json({ ok, verificadaAt, ...detalle });
  }),
);

/** Ejecuta un paso, registra su resultado y duración; devuelve si salió bien. */
async function medir(pasos: Paso[], paso: string, fn: () => Promise<string>): Promise<boolean> {
  const t = Date.now();
  try {
    pasos.push({ paso, ok: true, detalle: await fn(), ms: Date.now() - t });
    return true;
  } catch (e) {
    const detalle =
      e instanceof CobreError ? `${e.message} (HTTP ${e.status})` : (e as Error).message;
    pasos.push({ paso, ok: false, detalle, ms: Date.now() - t });
    return false;
  }
}
