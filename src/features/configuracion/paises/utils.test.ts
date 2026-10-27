import { describe, expect, it } from "vitest";
import type { ConfiguracionPagos } from "@/lib/api/paises";
import { calcularComision, validarConfiguracion } from "./utils";

const base: ConfiguracionPagos = {
  pais: "MX",
  proveedor: "ecartpay",
  modeloFondos: "directo",
  cobroComision: "cobro_aparte",
  comisionPct: 2.5,
  comisionFija: 3,
  ivaComisionPct: 16,
  updatedAt: "",
};

describe("validarConfiguracion", () => {
  it("acepta una configuración válida", () => {
    expect(validarConfiguracion(base)).toEqual({});
  });
  it("el descuento al liquidar exige el modelo centralizado", () => {
    expect(
      validarConfiguracion({ ...base, cobroComision: "descuento_liquidacion" }),
    ).toHaveProperty("cobroComision");
    expect(
      validarConfiguracion({
        ...base,
        modeloFondos: "centralizado",
        cobroComision: "descuento_liquidacion",
      }),
    ).toEqual({});
  });
  it("rechaza porcentajes fuera de rango y montos negativos", () => {
    const e = validarConfiguracion({
      ...base,
      comisionPct: 100,
      comisionFija: -1,
      ivaComisionPct: Number.NaN,
    });
    expect(Object.keys(e).sort()).toEqual(["comisionFija", "comisionPct", "ivaComisionPct"]);
  });
});

describe("calcularComision", () => {
  it("porcentaje + fijo, con IVA sobre la comisión", () => {
    expect(calcularComision(base, 1000)).toEqual({ comision: 28, iva: 4.48, total: 32.48 });
  });
  it("sin comisión no hay IVA", () => {
    expect(calcularComision({ comisionPct: 0, comisionFija: 0, ivaComisionPct: 16 }, 500)).toEqual({
      comision: 0,
      iva: 0,
      total: 0,
    });
  });
});
