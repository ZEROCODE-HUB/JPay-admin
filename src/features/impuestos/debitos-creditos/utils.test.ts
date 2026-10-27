import { describe, expect, it } from "vitest";
import {
  altaBase,
  altaVacia,
  esAltaValida,
  esErrorCheck,
  mensajeAltaCreada,
  type AltaForm,
} from "./utils";

const alta = (over: Partial<AltaForm> = {}): AltaForm => ({
  ...altaVacia(new Date("2026-10-27T12:00:00Z")),
  email: "a@b.com",
  cuit: "20-11111111-1",
  motivo: "Convenio",
  ...over,
});

describe("débitos y créditos: utils", () => {
  it("alta vacía: dirección Ambos y vigencia desde hoy", () => {
    const v = altaVacia(new Date("2026-10-27T12:00:00Z"));
    expect(v.direccion).toBe("Ambos");
    expect(v.desde).toBe("2026-10-27");
  });

  it("la vigencia desde es la fecha local (no UTC) del momento en que se arma", () => {
    // 23:30 local: en UTC puede ser el día siguiente, pero el default es el día local.
    expect(altaVacia(new Date(2026, 9, 27, 23, 30)).desde).toBe("2026-10-27");
    expect(altaVacia(new Date(2026, 9, 28, 0, 15)).desde).toBe("2026-10-28");
  });

  it("validación de email, CUIT de 11 dígitos, motivo y fecha", () => {
    expect(esAltaValida(alta())).toBe(true);
    expect(esAltaValida(alta({ email: "sin-arroba" }))).toBe(false);
    expect(esAltaValida(alta({ cuit: "2011" }))).toBe(false);
    expect(esAltaValida(alta({ motivo: "  " }))).toBe(false);
    expect(esAltaValida(alta({ desde: "" }))).toBe(false);
  });

  it("altaBase: tipo Alta manual y opcionales vacíos en null", () => {
    expect(altaBase(alta())).toEqual({
      email: "a@b.com",
      cuit: "20-11111111-1",
      tipo: "Alta manual",
      motivo: "Convenio",
      vigencia_desde: "2026-10-27",
      vigencia_hasta: null,
      autorizacion_codigo: null,
      impuesto_id: null,
      archivo_certificado: null,
    });
  });

  it("mensajes y errores", () => {
    expect(mensajeAltaCreada(2)).toContain("2 registros");
    expect(mensajeAltaCreada(1)).toBe("Excepción creada correctamente.");
    expect(esErrorCheck({ code: "23514" })).toBe(true);
    expect(esErrorCheck(new Error("x"))).toBe(false);
    expect(esErrorCheck(null)).toBe(false);
  });
});
