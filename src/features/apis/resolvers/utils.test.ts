import { describe, expect, it } from "vitest";
import type { Resolver } from "@/lib/api/types";
import { estadoResolverTone } from "./estados";
import { esCuitValido, formInicialResolver, normalizarCuit, resolverFormToInput } from "./utils";

describe("resolvers: utils", () => {
  it("normalizarCuit saca espacios y guiones", () => {
    expect(normalizarCuit("30-12345678-0")).toBe("30123456780");
    expect(normalizarCuit(" 30 123 ")).toBe("30123");
  });

  it("esCuitValido exige 11 dígitos", () => {
    expect(esCuitValido("30123456780")).toBe(true);
    expect(esCuitValido("30-12345678-0")).toBe(true);
    expect(esCuitValido("3012345678")).toBe(false);
    expect(esCuitValido("3012345678a")).toBe(false);
    expect(esCuitValido("")).toBe(false);
  });

  it("formInicialResolver arranca vacío o con los datos del resolver", () => {
    expect(formInicialResolver(null)).toEqual({
      nombre: "",
      cuit: "",
      nombreReverso: "",
      formatoWeb: "",
      pcpId: "",
      idPcp: "",
      url: "",
      token: "",
      asHeader: false,
      soa: false,
    });
    const r = {
      nombre: "R",
      cuit: "30123456780",
      nombreReverso: "com.r",
      formatoWeb: "w",
      pcpId: "P",
      idPcp: "1",
      url: "u",
      token: "t",
      asHeader: true,
      soa: true,
    } as Resolver;
    const form = formInicialResolver(r);
    expect(form.nombre).toBe("R");
    expect(form.asHeader).toBe(true);
    expect(resolverFormToInput(form)).toEqual(form);
  });

  it("estado → tono", () => {
    expect(estadoResolverTone("Activo")).toBe("success");
    expect(estadoResolverTone("Inactivo")).toBe("neutral");
  });
});
