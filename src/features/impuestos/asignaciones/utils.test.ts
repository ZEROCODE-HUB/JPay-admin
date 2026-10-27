import { describe, expect, it } from "vitest";
import type { ImpuestoAsignacion } from "@/lib/api/types";
import {
  aplicarImpuesto,
  asignacionCreatePayload,
  asignacionUpdatePayload,
  esAsignacionValida,
  esErrorFk,
  esMontoValido,
  formInicial,
  legajoDesdeBusqueda,
  type AsignacionForm,
} from "./utils";

const form = (over: Partial<AsignacionForm> = {}): AsignacionForm => ({
  ...formInicial(null),
  clienteLegajo: "LPF-20111111111",
  impuestoId: "imp-1",
  ...over,
});

describe("asignaciones de impuestos: utils", () => {
  it("el monto es obligatorio y se precarga en 0", () => {
    expect(formInicial(null).monto).toBe("0");
    expect(formInicial({ monto: null } as ImpuestoAsignacion).monto).toBe("0");
    expect(formInicial({ monto: 2.5 } as ImpuestoAsignacion).monto).toBe("2.5");
    expect(esMontoValido("0")).toBe(true);
    expect(esMontoValido("")).toBe(false);
    expect(esMontoValido("abc")).toBe(false);
    expect(esMontoValido("-1")).toBe(false);
  });

  it("validación: legajo con formato solo en el alta", () => {
    expect(esAsignacionValida(form(), false)).toBe(true);
    expect(esAsignacionValida(form({ clienteLegajo: "xx" }), false)).toBe(false);
    expect(esAsignacionValida(form({ clienteLegajo: "xx" }), true)).toBe(true);
    expect(esAsignacionValida(form({ impuestoId: "" }), false)).toBe(false);
    expect(esAsignacionValida(form({ monto: "" }), false)).toBe(false);
  });

  it("legajo tipeado en el buscador", () => {
    expect(legajoDesdeBusqueda("lpf-20111111111")).toBe("LPF-20111111111");
    expect(legajoDesdeBusqueda("  ")).toBe("");
    expect(legajoDesdeBusqueda("juan@")).toBeNull();
  });

  it("elegir impuesto precarga monto (0 si no tiene) y tipo", () => {
    const f = form({ monto: "9" });
    expect(aplicarImpuesto(f, "x", { monto: null, tipo: "Fijo" })).toMatchObject({
      impuestoId: "x",
      monto: "0",
      tipo: "Fijo",
    });
    expect(aplicarImpuesto(f, "", undefined)).toMatchObject({ impuestoId: "", monto: "9" });
  });

  it("payloads de alta y edición", () => {
    expect(asignacionCreatePayload(form({ clienteLegajo: " LPF-20111111111 " }))).toEqual({
      cliente_legajo: "LPF-20111111111",
      impuesto_id: "imp-1",
      tipo: "Porcentaje",
      monto: 0,
      estado: "Activo",
      tipo_operacion: null,
    });
    expect(asignacionUpdatePayload(form({ tipoOperacion: "Retiro", monto: "3" }))).toMatchObject({
      monto: 3,
      tipo_operacion: "Retiro",
    });
  });

  it("detecta el error de legajo inexistente", () => {
    expect(esErrorFk({ code: "23503", message: "" })).toBe(true);
    expect(esErrorFk({ message: "violates foreign key constraint" })).toBe(true);
    expect(esErrorFk({ code: "23505", message: "dup" })).toBe(false);
  });
});
