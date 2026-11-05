import { describe, expect, it } from "vitest";
import { columnaVisible, pctSobreOperacion } from "./utils";

describe("subruta de movimientos", () => {
  it("pctSobreOperacion", () => {
    expect(pctSobreOperacion(5, 100)).toBe(5);
    expect(pctSobreOperacion(5, 0)).toBe(0);
  });

  it("columnaVisible", () => {
    const base = { soloConComision: false };
    expect(columnaVisible("tipo", base)).toBe(false);
    expect(columnaVisible("tipo", { ...base, tipoCode: "transferencia" })).toBe(true);
    expect(columnaVisible("iva", base)).toBe(false);
    expect(columnaVisible("iva", { ...base, soloConComision: true })).toBe(true);
    expect(columnaVisible("monto", base)).toBe(true);
  });
});
