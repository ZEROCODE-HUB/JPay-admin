import { describe, expect, it } from "vitest";
import type { Impuesto } from "@/lib/api/types";
import {
  contarPorAmbito,
  esErrorDuplicado,
  esImpuestoFormValido,
  filtrarPorAmbito,
  formInicial,
  impuestoPayload,
  montoNegativo,
  type ImpuestoForm,
} from "./utils";

function impuesto(over: Partial<Impuesto> = {}): Impuesto {
  return {
    id: "i1",
    codigo: "IIBB",
    nombre: "Ingresos Brutos",
    descripcion: null,
    tipo: "Porcentaje",
    monto: 3.5,
    estado: "Activo",
    ambito: "Externo",
    alicuotas: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...over,
  };
}

const form = (over: Partial<ImpuestoForm> = {}): ImpuestoForm => ({
  ...formInicial(null),
  codigo: "IVA",
  nombre: "IVA",
  monto: "21",
  ...over,
});

describe("catálogo de impuestos: utils", () => {
  it("filtra y cuenta por ámbito (sin ámbito = Externo)", () => {
    const rows = [
      impuesto({ id: "a" }),
      impuesto({ id: "b", ambito: "Interno" }),
      impuesto({ id: "c", ambito: null as unknown as Impuesto["ambito"] }),
    ];
    expect(filtrarPorAmbito(rows, "externos").map((r) => r.id)).toEqual(["a", "c"]);
    expect(filtrarPorAmbito(rows, "internos").map((r) => r.id)).toEqual(["b"]);
    expect(contarPorAmbito(rows)).toEqual({ externos: 2, internos: 1 });
  });

  it("formInicial vacío y desde un impuesto", () => {
    expect(formInicial(null)).toMatchObject({
      tipo: "Porcentaje",
      monto: "",
      estado: "Activo",
      ambito: "Externo",
    });
    expect(formInicial(impuesto({ monto: null })).monto).toBe("");
    expect(formInicial(impuesto({ monto: 0 })).monto).toBe("0");
  });

  it("validación: código, nombre y monto ≥ 0 salvo tipo Otro", () => {
    expect(esImpuestoFormValido(form())).toBe(true);
    expect(esImpuestoFormValido(form({ codigo: " " }))).toBe(false);
    expect(esImpuestoFormValido(form({ monto: "" }))).toBe(false);
    expect(esImpuestoFormValido(form({ monto: "-1" }))).toBe(false);
    expect(esImpuestoFormValido(form({ tipo: "Otro", monto: "" }))).toBe(true);
    expect(montoNegativo("-1")).toBe(true);
    expect(montoNegativo("")).toBe(false);
  });

  it("payload: descripción vacía → null y Otro sin monto", () => {
    expect(impuestoPayload(form())).toMatchObject({ descripcion: null, monto: 21 });
    expect(impuestoPayload(form({ tipo: "Otro", monto: "5" })).monto).toBeNull();
  });

  it("detecta el error de código duplicado", () => {
    expect(esErrorDuplicado({ code: "23505", message: "" })).toBe(true);
    expect(esErrorDuplicado({ code: null, message: "duplicate key value" })).toBe(true);
    expect(esErrorDuplicado({ code: "42501", message: "permission denied" })).toBe(false);
  });
});
