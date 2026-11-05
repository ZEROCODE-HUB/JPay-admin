import { describe, expect, it } from "vitest";
import { conModulos, getPais } from "@/shared/pais";
import { etiquetaTipoComision } from "@/features/clientes/comisiones/utils";
import { cuentaDelPais } from "./cuenta-pais";

describe("cuentaDelPais", () => {
  it("la cuenta de los clientes es la CLABE", () => {
    expect(cuentaDelPais()).toBe("CLABE");
  });
});

describe("etiquetaTipoComision", () => {
  it("usa los nombres de los productos de Cobre", () => {
    expect(etiquetaTipoComision("Depósito")).toMatch(/^Pay-in/);
    expect(etiquetaTipoComision("Retiro")).toMatch(/^Pay-out/);
    expect(etiquetaTipoComision("Conversión")).toBe("Conversión a dólares");
  });
});

describe("módulos de México", () => {
  it("monitoreo automático y Cobre prendidos por defecto", () => {
    const mx = conModulos(getPais(), null);
    expect(mx.modulos.monitoreo_automatico).toBe(true);
    expect(mx.modulos.transferencias_cobre).toBe(true);
  });
  it("lo guardado en la base manda sobre el valor por defecto", () => {
    expect(conModulos(getPais(), { pos: false }).modulos.pos).toBe(false);
  });
});
