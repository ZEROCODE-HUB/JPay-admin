import { describe, expect, it } from "vitest";
import { ESTADO_LABEL, ESTADO_OPTIONS_UI, toneContra } from "./estados";
import { contarPorEstado, diasHabilesRestantes, parseImporte, tamanoKb } from "./utils";

describe("diasHabilesRestantes", () => {
  // 2026-10-21 es miércoles.
  const hoy = new Date(2026, 9, 21, 15, 30);

  it("devuelve 0 si vence hoy (ignora la hora)", () => {
    expect(diasHabilesRestantes("2026-10-21T23:59:00", hoy)).toBe(0);
  });
  it("cuenta solo lunes a viernes hacia adelante", () => {
    expect(diasHabilesRestantes("2026-10-23T12:00:00", hoy)).toBe(2); // vie
    expect(diasHabilesRestantes("2026-10-26T12:00:00", hoy)).toBe(3); // lun (salta finde)
    expect(diasHabilesRestantes("2026-10-25T12:00:00", hoy)).toBe(2); // dom
  });
  it("devuelve negativo cuando el plazo ya pasó", () => {
    expect(diasHabilesRestantes("2026-10-20T12:00:00", hoy)).toBe(-1);
    expect(diasHabilesRestantes("2026-10-16T12:00:00", hoy)).toBe(-3); // vie anterior
  });
});

describe("contarPorEstado", () => {
  it("cuenta por estado y deja en 0 los que no aparecen", () => {
    const k = contarPorEstado([
      { estado: "Abierto" },
      { estado: "Abierto" },
      { estado: "Cerrado_retenido" },
    ]);
    expect(k.Abierto).toBe(2);
    expect(k.Cerrado_retenido).toBe(1);
    expect(k.Simulado).toBe(0);
  });
  it("cuenta la variante sin tilde aparte (no la suma a 'En_mediación')", () => {
    const k = contarPorEstado([{ estado: "En_mediacion" }]);
    expect(k.En_mediacion).toBe(1);
    expect(k["En_mediación"]).toBe(0);
  });
});

describe("parseImporte", () => {
  it("acepta coma o punto decimal", () => {
    expect(parseImporte("15000,50")).toBe(15000.5);
    expect(parseImporte("15000.50")).toBe(15000.5);
  });
  it("devuelve NaN si no es número", () => {
    expect(parseImporte("abc")).toBeNaN();
  });
});

describe("tamanoKb", () => {
  it("formatea bytes a KB con un decimal", () => {
    expect(tamanoKb(2048)).toBe("2.0");
    expect(tamanoKb(1536)).toBe("1.5");
  });
});

describe("estados", () => {
  it("mapea tono por estado", () => {
    expect(toneContra("Simulado")).toBe("neutral");
    expect(toneContra("Abierto")).toBe("warn");
    expect(toneContra("En_mediacion")).toBe("neutral");
    expect(toneContra("Cerrado_acreditado")).toBe("success");
    expect(toneContra("Cerrado_retenido")).toBe("danger");
  });
  it("todas las opciones de UI tienen label", () => {
    for (const s of ESTADO_OPTIONS_UI) expect(ESTADO_LABEL[s]).toBeTruthy();
  });
});
