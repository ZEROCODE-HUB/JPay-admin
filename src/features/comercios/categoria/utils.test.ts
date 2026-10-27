import { describe, expect, it } from "vitest";
import { DataAccessError } from "@/lib/api/errors";
import type { CodigoCategoria } from "@/lib/api/types";
import { estadoCategoriaTone } from "./estados";
import { categoriaFormInicial, categoriaFormValido, mensajeErrorGuardado } from "./utils";

describe("categorías de comercio", () => {
  it("formulario inicial y validación", () => {
    expect(categoriaFormInicial(null)).toEqual({ codigo: "", nombre: "", descripcion: "" });
    const c = { codigo: "CAT-1", nombre: "Uno", descripcion: "d" } as CodigoCategoria;
    expect(categoriaFormInicial(c)).toEqual({ codigo: "CAT-1", nombre: "Uno", descripcion: "d" });
    expect(categoriaFormValido({ codigo: " ", nombre: "x", descripcion: "" })).toBe(false);
    expect(categoriaFormValido({ codigo: "A", nombre: "x", descripcion: "" })).toBe(true);
  });

  it("mensaje de error: duplicado solo si es DataAccessError de unicidad", () => {
    const dup = new DataAccessError({ code: "23505", message: "duplicate key" });
    expect(mensajeErrorGuardado(dup, " CAT-1 ")).toBe(
      'Ya existe otra categoría con el código "CAT-1". El código debe ser único.',
    );
    expect(mensajeErrorGuardado(new Error("duplicate"), "X")).toBe("duplicate");
  });

  it("tono del estado", () => {
    expect(estadoCategoriaTone("activo")).toBe("success");
    expect(estadoCategoriaTone("inactivo")).toBe("neutral");
  });
});
