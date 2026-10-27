import { describe, expect, it } from "vitest";
import { columnaVisible, comisionPayway, insertarDespues, pctSobreOperacion } from "./utils";

describe("subruta de movimientos", () => {
  it("pctSobreOperacion", () => {
    expect(pctSobreOperacion(5, 100)).toBe(5);
    expect(pctSobreOperacion(5, 0)).toBe(0);
  });

  it("comisionPayway prefiere el snapshot del lote", () => {
    const r = { _dbId: "m1", _comercioId: "c1", _bandera: "VISA", _montoOperacion: 200 };
    const lookup = new Map([["c1::VISA", 2]]);
    expect(comisionPayway(r, new Map([["m1", { pct: 3 }]]), lookup)).toEqual({ pct: 3, monto: 6 });
    expect(comisionPayway(r, undefined, lookup)).toEqual({ pct: 2, monto: 4 });
    expect(comisionPayway({ ...r, _bandera: "MC" }, undefined, lookup)).toEqual({
      pct: 0,
      monto: 0,
    });
  });

  it("columnaVisible", () => {
    const base = { soloConComision: false, isTarjeta: false };
    expect(columnaVisible("tipo", base)).toBe(false);
    expect(columnaVisible("tipo", { ...base, tipoCode: "retiro" })).toBe(true);
    expect(columnaVisible("iva", base)).toBe(false);
    expect(columnaVisible("iva", { ...base, soloConComision: true })).toBe(true);
    expect(columnaVisible("payway", { ...base, tipoCode: "tarjeta" })).toBe(false);
    expect(columnaVisible("payway", { ...base, tipoCode: "tarjeta", isTarjeta: true })).toBe(true);
    expect(columnaVisible("monto", base)).toBe(true);
  });

  it("insertarDespues", () => {
    const cols = [{ key: "a" }, { key: "b" }];
    expect(insertarDespues(cols, "a", { key: "x" }).map((c) => c.key)).toEqual(["a", "x", "b"]);
    expect(insertarDespues(cols, "z", { key: "x" }).map((c) => c.key)).toEqual(["a", "b", "x"]);
  });
});
