import { describe, expect, it } from "vitest";
import { saludIconClass, saludMeta } from "./estados";
import { buildIntegracionUI } from "./utils";

describe("configuracion: utils", () => {
  it("buildIntegracionUI usa los mocks conocidos", () => {
    expect(
      buildIntegracionUI({
        id: "pct:coelsa_debin",
        nombre: "DEBIN",
        proveedor: "Coelsa",
        createdAt: "",
      }),
    ).toEqual({
      id: "pct:coelsa_debin",
      nombre: "DEBIN",
      proveedor: "Coelsa",
      salud: "error",
      ultimaEjecucion: "11/08/2026 07:45",
      proximaEjecucion: "11/08/2026 08:10",
      ejecuciones: 18954,
    });
  });

  it("buildIntegracionUI cae a valores por defecto", () => {
    const ui = buildIntegracionUI({ id: "x", nombre: "X", proveedor: "P", createdAt: "" });
    expect(ui.salud).toBe("ok");
    expect(ui.ultimaEjecucion).toBe("—");
    expect(ui.proximaEjecucion).toBe("—");
    expect(ui.ejecuciones).toBe(0);
  });

  it("salud → tono e ícono", () => {
    expect(saludMeta.ok.tone).toBe("success");
    expect(saludMeta.warning.tone).toBe("warn");
    expect(saludMeta.error.tone).toBe("danger");
    expect(saludIconClass("ok")).toBe("text-emerald-500 shrink-0");
    expect(saludIconClass("warning")).toBe("text-amber-500 shrink-0");
    expect(saludIconClass("error")).toBe("text-danger-500 shrink-0");
  });
});
