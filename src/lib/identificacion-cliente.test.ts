import { describe, expect, it } from "vitest";
import { idFiscalCliente, regimenFiscalCliente } from "./identificacion-cliente";

describe("idFiscalCliente", () => {
  it("usa el RFC y nunca el número interno", () => {
    expect(
      idFiscalCliente({
        pais: "MX",
        taxId: "GODE561231GR8",
        taxIdTipo: "RFC",
      }),
    ).toEqual({ etiqueta: "RFC", valor: "GODE561231GR8" });
    expect(idFiscalCliente({ pais: "MX" })).toEqual({
      etiqueta: "RFC",
      valor: "—",
    });
    expect(idFiscalCliente({}).etiqueta).toBe("RFC");
  });
});

describe("regimenFiscalCliente", () => {
  it("muestra código y nombre del catálogo del país", () => {
    expect(regimenFiscalCliente({ pais: "MX", regimenFiscal: "626" })).toBe(
      "626 · Régimen Simplificado de Confianza",
    );
    expect(regimenFiscalCliente({ pais: "MX", regimenFiscal: null })).toBe("—");
    expect(regimenFiscalCliente({ pais: "XX", regimenFiscal: "999" })).toBe("999");
  });
});
