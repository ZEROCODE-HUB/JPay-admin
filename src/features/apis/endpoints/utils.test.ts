import { describe, expect, it } from "vitest";
import type { ApiEndpoint } from "@/lib/api/types";
import { estadoEndpointTone, metodoTone } from "./estados";
import { endpointFormInicial, endpointFormValido } from "./utils";

const endpoint: ApiEndpoint = {
  id: "e1",
  nombre: "Crear link",
  path: "/v1/links",
  metodo: "POST",
  descripcion: null,
  grupo: "Enlaces de pago",
  estado: "Deshabilitado",
  rec: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("apis externas: endpoints", () => {
  it("endpointFormInicial usa defaults en alta y los datos en edición", () => {
    expect(endpointFormInicial(null)).toEqual({
      nombre: "",
      path: "",
      metodo: "GET",
      descripcion: "",
      grupo: "Autenticación",
      estado: "Habilitado",
      rec: false,
    });
    expect(endpointFormInicial(endpoint)).toEqual({
      nombre: "Crear link",
      path: "/v1/links",
      metodo: "POST",
      descripcion: "",
      grupo: "Enlaces de pago",
      estado: "Deshabilitado",
      rec: true,
    });
  });

  it("endpointFormValido exige nombre y path", () => {
    const ok = endpointFormInicial(endpoint);
    expect(endpointFormValido(ok)).toBe(true);
    expect(endpointFormValido({ ...ok, nombre: " " })).toBe(false);
    expect(endpointFormValido({ ...ok, path: "" })).toBe(false);
  });

  it("estados y métodos → tono", () => {
    expect(estadoEndpointTone("Habilitado")).toBe("success");
    expect(estadoEndpointTone("Deshabilitado")).toBe("neutral");
    expect(metodoTone("GET")).toBe("success");
    expect(metodoTone("POST")).toBe("warn");
    expect(metodoTone("DELETE")).toBe("danger");
    expect(metodoTone("PUT")).toBe("neutral");
    expect(metodoTone("PATCH")).toBe("neutral");
  });
});
