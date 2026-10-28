import { describe, expect, it } from "vitest";
import { toConexion } from "./paises";

describe("toConexion", () => {
  it("lee el detalle guardado por ecartpay-salud", () => {
    const c = toConexion("ok", "2026-10-27T20:00:00Z", {
      entorno: "sandbox",
      baseUrl: "https://sandbox.ecartpay.com",
      latenciaMs: 420,
      pasos: [{ paso: "token", ok: true, detalle: "Token generado", ms: 200 }, { basura: 1 }],
    });
    expect(c).toEqual({
      estado: "ok",
      verificadaAt: "2026-10-27T20:00:00Z",
      entorno: "sandbox",
      baseUrl: "https://sandbox.ecartpay.com",
      latenciaMs: 420,
      pasos: [{ paso: "token", ok: true, detalle: "Token generado", ms: 200 }],
    });
  });

  it("tolera detalle vacío y estados desconocidos", () => {
    expect(toConexion("raro", null, {})).toMatchObject({
      estado: "sin_probar",
      entorno: null,
      pasos: [],
    });
  });
});
