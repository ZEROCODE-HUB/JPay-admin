// Edge Function: prueba de conexión de la plataforma con Ecart Pay (solo admins).
// Pasos: claves configuradas → token → lectura de transacciones; además informa si están los
// secretos de OAuth y de webhooks. Guarda el resultado en `proveedores_pago.conexion_*`
// (migración 1016) y lo devuelve. Siempre responde 200 con `ok` para que el panel muestre el
// detalle; nunca incluye credenciales en la respuesta ni en la base.

import {
  baseUrlEcartPay,
  credencialesPlataforma,
  EcartPayCliente,
  EcartPayError,
} from "../_shared/ecartpay.ts";
import { handler, HttpError, json, serviceClient, userClient } from "../_shared/http.ts";

type Paso = { paso: string; ok: boolean; detalle: string; ms?: number };

Deno.serve(
  handler(async (req) => {
    const { data: esAdmin, error: errAdmin } = await userClient(req).rpc("is_admin");
    if (errAdmin || esAdmin !== true) throw new HttpError(403, "Solo para administradores");

    const sb = serviceClient();
    const { data: proveedor, error } = await sb
      .from("proveedores_pago")
      .select("codigo, sandbox, activo")
      .eq("codigo", "ecartpay")
      .maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!proveedor) throw new HttpError(404, "Ecart Pay no está dado de alta en proveedores_pago");

    const baseUrl = baseUrlEcartPay(proveedor.sandbox);
    const pasos: Paso[] = [];
    const inicio = Date.now();

    const cred = credencialesPlataforma();
    pasos.push({
      paso: "claves",
      ok: !!cred,
      detalle: cred
        ? "ECARTPAY_PUBLIC_KEY y ECARTPAY_PRIVATE_KEY configuradas"
        : "Faltan ECARTPAY_PUBLIC_KEY o ECARTPAY_PRIVATE_KEY en los secretos",
    });

    let modoAutorizacion: string | null = null;
    if (cred) {
      const cliente = new EcartPayCliente({ baseUrl, credenciales: cred });
      const ok = await medir(pasos, "token", async () => {
        await cliente.token(true);
        return "Token generado";
      });
      if (ok) {
        await medir(pasos, "api", async () => {
          const r = await cliente.get<unknown>("/api/transactions");
          modoAutorizacion = cliente.modoAutorizacion;
          return `GET /api/transactions respondió (${resumen(r)})`;
        });
      }
    }

    const oauth = !!(
      Deno.env.get("ECARTPAY_OAUTH_CLIENT_ID") && Deno.env.get("ECARTPAY_OAUTH_CLIENT_SECRET")
    );
    pasos.push({
      paso: "oauth",
      ok: oauth,
      detalle: oauth
        ? "Aplicación OAuth configurada"
        : "Faltan ECARTPAY_OAUTH_CLIENT_ID o ECARTPAY_OAUTH_CLIENT_SECRET",
    });
    const webhook = !!Deno.env.get("ECARTPAY_WEBHOOK_SECRET");
    pasos.push({
      paso: "webhook",
      ok: webhook,
      detalle: webhook ? "Secreto de webhooks configurado" : "Falta ECARTPAY_WEBHOOK_SECRET",
    });

    const ok = pasos.every((p) => p.ok);
    const detalle = {
      entorno: proveedor.sandbox ? "sandbox" : "produccion",
      baseUrl,
      modoAutorizacion,
      latenciaMs: Date.now() - inicio,
      pasos,
    };
    const verificadaAt = new Date().toISOString();
    const { error: errUpd } = await sb
      .from("proveedores_pago")
      .update({
        conexion_estado: ok ? "ok" : "error",
        conexion_verificada_at: verificadaAt,
        conexion_detalle: detalle,
      })
      .eq("codigo", "ecartpay");
    if (errUpd) throw new HttpError(500, errUpd.message);

    return json({ ok, verificadaAt, ...detalle });
  }),
);

/** Ejecuta un paso, registra su resultado y duración; devuelve si salió bien. */
async function medir(pasos: Paso[], paso: string, fn: () => Promise<string>): Promise<boolean> {
  const t = Date.now();
  try {
    const detalle = await fn();
    pasos.push({ paso, ok: true, detalle, ms: Date.now() - t });
    return true;
  } catch (e) {
    const detalle =
      e instanceof EcartPayError
        ? `${e.message} (HTTP ${e.status})`
        : e instanceof Error
          ? e.message
          : String(e);
    pasos.push({ paso, ok: false, detalle, ms: Date.now() - t });
    return false;
  }
}

/** Descripción corta de la respuesta, sin volcar datos de transacciones. */
function resumen(r: unknown): string {
  if (Array.isArray(r)) return `${r.length} registros`;
  if (r && typeof r === "object") {
    const o = r as Record<string, unknown>;
    for (const k of ["docs", "data", "transactions", "results"]) {
      if (Array.isArray(o[k])) return `${(o[k] as unknown[]).length} registros`;
    }
    return `campos: ${Object.keys(o).slice(0, 6).join(", ")}`;
  }
  return typeof r;
}
