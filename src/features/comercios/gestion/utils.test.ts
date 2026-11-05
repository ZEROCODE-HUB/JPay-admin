import { describe, expect, it } from "vitest";
import { estadoComercioTone } from "./estados";

describe("gestion de comercios: utils", () => {
  it("estados → tono", () => {
    expect(estadoComercioTone("Activado")).toBe("success");
    expect(estadoComercioTone("Desactivado")).toBe("neutral");
    expect(estadoComercioTone("Rechazado")).toBe("danger");
    expect(estadoComercioTone("Pendiente de aprobación")).toBe("warn");
  });
});
