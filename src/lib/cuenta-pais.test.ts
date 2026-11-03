import { afterEach, describe, expect, it } from "vitest";
import { conModulos, getPais, PAIS_INSTALACION, setPaisActivo } from "@/shared/pais";
import { etiquetaTipoComision } from "@/features/clientes/comisiones/utils";
import { cuentaDelPais } from "./cuenta-pais";

afterEach(() => setPaisActivo(PAIS_INSTALACION));

describe("cuentaDelPais", () => {
  it("CVU en Argentina y CLABE en México", () => {
    setPaisActivo("AR");
    expect(cuentaDelPais()).toBe("CVU");
    setPaisActivo("MX");
    expect(cuentaDelPais()).toBe("CLABE");
  });
});

describe("etiquetaTipoComision", () => {
  it("México usa los nombres de los productos; Argentina deja el tipo tal cual", () => {
    setPaisActivo("MX");
    expect(etiquetaTipoComision("Depósito")).toMatch(/^Pay-in/);
    expect(etiquetaTipoComision("Retiro")).toMatch(/^Pay-out/);
    expect(etiquetaTipoComision("Conversión")).toBe("Conversión a dólares");
    setPaisActivo("AR");
    expect(etiquetaTipoComision("Depósito")).toBe("Depósito");
  });
});

describe("módulos de México", () => {
  it("QR apagado, monitoreo automático prendido; Argentina con QR", () => {
    setPaisActivo("MX");
    const mx = conModulos(getPais(), null);
    expect(mx.modulos.qr).toBe(false);
    expect(mx.modulos.monitoreo_automatico).toBe(true);
    setPaisActivo("AR");
    expect(conModulos(getPais(), null).modulos.qr).toBe(true);
  });
  it("lo guardado en la base manda sobre el valor por defecto", () => {
    setPaisActivo("MX");
    expect(conModulos(getPais(), { qr: true }).modulos.qr).toBe(true);
  });
});
