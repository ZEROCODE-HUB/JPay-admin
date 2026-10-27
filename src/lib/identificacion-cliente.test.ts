import { describe, expect, it } from "vitest";
import { idFiscalCliente, regimenFiscalCliente } from "./identificacion-cliente";

describe("idFiscalCliente", () => {
  it("Argentina (o sin país) usa el CUIT con guiones", () => {
    expect(idFiscalCliente({ cuit: "20123456786", pais: "AR" })).toEqual({
      etiqueta: "CUIT",
      valor: "20-12345678-6",
    });
    expect(idFiscalCliente({ cuit: "20123456786" }).etiqueta).toBe("CUIT");
  });
  it("México usa el RFC y nunca el número interno", () => {
    expect(
      idFiscalCliente({
        cuit: "99123456789",
        pais: "MX",
        taxId: "GODE561231GR8",
        taxIdTipo: "RFC",
      }),
    ).toEqual({ etiqueta: "RFC", valor: "GODE561231GR8" });
    expect(idFiscalCliente({ cuit: "99123456789", pais: "MX" })).toEqual({
      etiqueta: "RFC",
      valor: "—",
    });
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
