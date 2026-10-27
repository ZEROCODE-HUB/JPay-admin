import { describe, expect, it } from "vitest";
import type { ApiUsuario } from "@/lib/api/types";
import { estadoUsuarioApiTone } from "./estados";
import { usuarioFormAInput, usuarioFormInicial, usuarioFormValido } from "./utils";

const usuario: ApiUsuario = {
  id: "u1",
  codigoUsuarioApi: "1001",
  usuario: "afip@example.com",
  nombreCompleto: "Integración AFIP",
  estado: "Producción",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("apis externas: usuarios", () => {
  it("usuarioFormInicial vacío para alta y con datos para edición", () => {
    expect(usuarioFormInicial(null)).toEqual({
      codigoUsuarioApi: "",
      usuario: "",
      nombreCompleto: "",
      estado: "Pendiente Validación",
    });
    expect(usuarioFormInicial(usuario)).toEqual({
      codigoUsuarioApi: "1001",
      usuario: "afip@example.com",
      nombreCompleto: "Integración AFIP",
      estado: "Producción",
    });
  });

  it("usuarioFormValido exige código, usuario y nombre", () => {
    const ok = usuarioFormInicial(usuario);
    expect(usuarioFormValido(ok)).toBe(true);
    expect(usuarioFormValido({ ...ok, codigoUsuarioApi: "  " })).toBe(false);
    expect(usuarioFormValido({ ...ok, usuario: "" })).toBe(false);
    expect(usuarioFormValido({ ...ok, nombreCompleto: " " })).toBe(false);
  });

  it("usuarioFormAInput copia los campos sin recortar", () => {
    const form = { ...usuarioFormInicial(usuario), usuario: " x " };
    expect(usuarioFormAInput(form)).toEqual(form);
  });

  it("estados → tono", () => {
    expect(estadoUsuarioApiTone("Producción")).toBe("success");
    expect(estadoUsuarioApiTone("Suspendido")).toBe("danger");
    expect(estadoUsuarioApiTone("Deshabilitado")).toBe("danger");
    expect(estadoUsuarioApiTone("Homologación")).toBe("warn");
    expect(estadoUsuarioApiTone("Pendiente Validación")).toBe("neutral");
  });
});
