import { describe, expect, it } from "vitest";
import type { ApiRestriccion } from "@/lib/api/types";
import { estadoOpuesto, estadoRestriccionTone } from "./estados";
import { restriccionFormInicial, restriccionFormValido } from "./utils";

describe("restricciones", () => {
  it("tono y estado opuesto", () => {
    expect(estadoRestriccionTone("Restringiendo")).toBe("danger");
    expect(estadoRestriccionTone("No restringiendo")).toBe("neutral");
    expect(estadoOpuesto("Restringiendo")).toBe("No restringiendo");
    expect(estadoOpuesto("No restringiendo")).toBe("Restringiendo");
  });

  it("formulario inicial para alta y edición", () => {
    expect(restriccionFormInicial(null)).toEqual({
      apiUsuarioId: "",
      estado: "Restringiendo",
      fechaExpiracion: "",
    });
    const r = {
      apiUsuarioId: "u1",
      estado: "No restringiendo",
      fechaExpiracion: "2026-12-31",
    } as ApiRestriccion;
    expect(restriccionFormInicial(r)).toEqual({
      apiUsuarioId: "u1",
      estado: "No restringiendo",
      fechaExpiracion: "2026-12-31",
    });
  });

  it("requiere usuario y fecha de expiración", () => {
    expect(
      restriccionFormValido({ apiUsuarioId: "u1", estado: "Restringiendo", fechaExpiracion: "" }),
    ).toBe(false);
    expect(
      restriccionFormValido({
        apiUsuarioId: "u1",
        estado: "Restringiendo",
        fechaExpiracion: "2026-01-01",
      }),
    ).toBe(true);
  });
});
