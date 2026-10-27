import { describe, expect, it } from "vitest";
import type { Adelanto } from "@/lib/api/types";
import { CUPO_POOL_BAJO, nivelCupoPool, toneAdelanto } from "./estados";
import {
  esTasaTipeable,
  interesAdelanto,
  netoAdelanto,
  parseTasa,
  poolInsuficiente,
  shortId,
  tnaDesdeTem,
  toAdelantoUI,
  totalesPorEstado,
  validarTasa,
} from "./utils";

describe("tasas", () => {
  it("parseTasa acepta coma o punto y devuelve null si está vacío o no es número", () => {
    expect(parseTasa("4,5")).toBe(4.5);
    expect(parseTasa("4.5")).toBe(4.5);
    expect(parseTasa("  ")).toBeNull();
    expect(parseTasa(".")).toBeNull();
  });
  it("esTasaTipeable solo deja dígitos y un separador", () => {
    expect(esTasaTipeable("")).toBe(true);
    expect(esTasaTipeable("4,")).toBe(true);
    expect(esTasaTipeable("4.55")).toBe(true);
    expect(esTasaTipeable("4.5.")).toBe(false);
    expect(esTasaTipeable("-1")).toBe(false);
    expect(esTasaTipeable("abc")).toBe(false);
  });
  it("validarTasa exige 0-100", () => {
    expect(validarTasa(null)).toMatch(/Cargá la tasa/);
    expect(validarTasa(-1)).toMatch(/fuera de rango/);
    expect(validarTasa(100.1)).toMatch(/fuera de rango/);
    expect(validarTasa(0)).toBeNull();
    expect(validarTasa(100)).toBeNull();
  });
  it("TNA = TEM × 12", () => {
    expect(tnaDesdeTem(4.5)).toBe(54);
  });
});

describe("montos", () => {
  it("interés = importe × TEM / 100 redondeado a centavos", () => {
    expect(interesAdelanto(10000, 4.5)).toBe(450);
    expect(interesAdelanto(333.33, 3.333)).toBe(11.11);
    expect(interesAdelanto(10000, null)).toBe(0);
  });
  it("neto nunca es negativo", () => {
    expect(netoAdelanto(10000, 450)).toBe(9550);
    expect(netoAdelanto(100, 150)).toBe(0);
  });
});

describe("tope del pool", () => {
  it("poolInsuficiente solo aplica a Aprobado", () => {
    expect(poolInsuficiente("Aprobado", 5000, 10000)).toBe(true);
    expect(poolInsuficiente("Aprobado", 10000, 10000)).toBe(false);
    expect(poolInsuficiente("Aprobado", undefined, 1)).toBe(true);
    expect(poolInsuficiente("Pendiente", 0, 10000)).toBe(false);
  });
  it("nivelCupoPool", () => {
    expect(nivelCupoPool(0)).toBe("sin-liquidez");
    expect(nivelCupoPool(-5)).toBe("sin-liquidez");
    expect(nivelCupoPool(CUPO_POOL_BAJO - 1)).toBe("bajo");
    expect(nivelCupoPool(CUPO_POOL_BAJO)).toBe("ok");
  });
});

describe("totalesPorEstado", () => {
  it("cuenta y suma por estado", () => {
    const t = totalesPorEstado([
      { estado: "Pendiente", montoSolicitado: 1000 },
      { estado: "Pendiente", montoSolicitado: 500 },
      { estado: "Acreditado", montoSolicitado: 200 },
    ]);
    expect(t.Pendiente).toEqual({ cantidad: 2, monto: 1500 });
    expect(t.Acreditado).toEqual({ cantidad: 1, monto: 200 });
    expect(t.Rechazado).toEqual({ cantidad: 0, monto: 0 });
  });
});

describe("toAdelantoUI", () => {
  const base = {
    id: "abcdef12-3456",
    comercioId: "c-uuid",
    fechaSolicitud: "2026-10-01",
    montoSolicitado: 10000,
    plazoAdelantadoDias: 5,
    plazoOriginalDias: 30,
    tasaInteresPct: 4,
    estado: "Pendiente",
    motivo: null,
    fechaAcreditacion: null,
    montoPorAcreditar: null,
    fechaResolucion: null,
  } as unknown as Adelanto;

  it("usa nombre y legajo del comercio si están", () => {
    const r = toAdelantoUI(base, { id: "c-uuid", nombre: "Kiosco", legajo: "L1" });
    expect(r.id).toBe(shortId(base.id));
    expect(r.id).toBe("ABCDEF12");
    expect(r.comercio).toBe("Kiosco");
    expect(r.legajo).toBe("L1");
    expect(r.comercioId).toBe("c-uuid");
    expect(r.plazoSolicitado).toBe("5 días");
    expect(r.comision).toBe("4%");
    expect(r.tasaEfectiva).toMatch(/^TNA 48/);
  });
  it("cae al UUID y 'Pendiente' si falta info", () => {
    const r = toAdelantoUI({ ...base, tasaInteresPct: null } as Adelanto, undefined);
    expect(r.comercio).toBe("c-uuid");
    expect(r.legajo).toBe("—");
    expect(r.comision).toBe("Pendiente");
    expect(r.tasaEfectiva).toBeUndefined();
  });
});

describe("toneAdelanto", () => {
  it("mapea estados", () => {
    expect(toneAdelanto("Pendiente")).toBe("warn");
    expect(toneAdelanto("Aprobado")).toBe("neutral");
    expect(toneAdelanto("Acreditado")).toBe("success");
    expect(toneAdelanto("Cancelado")).toBe("neutral");
    expect(toneAdelanto("Rechazado")).toBe("danger");
  });
});
