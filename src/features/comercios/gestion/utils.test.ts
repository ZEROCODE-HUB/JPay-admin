import { describe, expect, it } from "vitest";
import { estadoActivoTone, estadoComercioTone } from "./estados";
import { esDecimalEnEdicion, parseDecimal } from "./utils";

describe("gestion de comercios: utils", () => {
  it("esDecimalEnEdicion acepta vacío, enteros y decimales con punto o coma", () => {
    expect(esDecimalEnEdicion("")).toBe(true);
    expect(esDecimalEnEdicion("12")).toBe(true);
    expect(esDecimalEnEdicion("1,5")).toBe(true);
    expect(esDecimalEnEdicion("1.")).toBe(true);
    expect(esDecimalEnEdicion("1.2.3")).toBe(false);
    expect(esDecimalEnEdicion("a")).toBe(false);
  });

  it("parseDecimal normaliza la coma y cae a 0", () => {
    expect(parseDecimal("2,75")).toBe(2.75);
    expect(parseDecimal("3.5")).toBe(3.5);
    expect(parseDecimal("")).toBe(0);
    expect(parseDecimal("x")).toBe(0);
  });

  it("estados → tono", () => {
    expect(estadoComercioTone("Activado")).toBe("success");
    expect(estadoComercioTone("Desactivado")).toBe("neutral");
    expect(estadoComercioTone("Rechazado")).toBe("danger");
    expect(estadoComercioTone("Pendiente de aprobación")).toBe("warn");
    expect(estadoActivoTone("Activo")).toBe("success");
    expect(estadoActivoTone("Inactivo")).toBe("neutral");
  });
});
