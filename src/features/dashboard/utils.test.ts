import { describe, expect, it } from "vitest";
import type { Movimiento } from "@/lib/api/types";
import { finDeDia, rangoMesActual, resumirComisiones, toISODate } from "./utils";

const mov = (over: Partial<Movimiento>): Movimiento => ({
  id: "1",
  clienteId: "c1",
  legajo: "L1",
  idTxn: "t1",
  tipo: "deposito",
  cvu: null,
  montoOperacion: 0,
  comision: 0,
  impuesto: 0,
  montoCobrado: 0,
  fecha: "2026-10-01",
  createdAt: "2026-10-01",
  estadoId: 1,
  ...over,
});

describe("dashboard: utils", () => {
  it("toISODate y rangoMesActual", () => {
    expect(toISODate(new Date(Date.UTC(2026, 9, 15, 12)))).toBe("2026-10-15");
    const r = rangoMesActual(new Date(2026, 9, 15, 12));
    expect(r.desde.slice(0, 7)).toMatch(/^2026-(09|10)$/);
    expect(r.hasta).toBe(toISODate(new Date(2026, 9, 15, 12)));
  });

  it("finDeDia agrega la hora o devuelve undefined", () => {
    expect(finDeDia("2026-10-15")).toBe("2026-10-15T23:59:59");
    expect(finDeDia("")).toBeUndefined();
  });

  it("resumirComisiones agrupa por legajo y ordena por monto", () => {
    const r = resumirComisiones([
      mov({ legajo: "A", montoOperacion: 100, comision: 5 }),
      mov({ legajo: "B", montoOperacion: 300, comision: 10, cliente: null }),
      mov({
        legajo: "A",
        montoOperacion: 50,
        comision: 2,
        cliente: { nombre: "Ana", correo: "", cuit: "" },
      }),
    ]);
    expect(r.montoTransaccionado).toBe(450);
    expect(r.comisionTotal).toBe(17);
    expect(r.remanente).toBe(433);
    expect(r.porComercio).toEqual([
      { legajo: "B", nombre: "B", monto: 300, comision: 10, count: 1 },
      { legajo: "A", nombre: "A", monto: 150, comision: 7, count: 2 },
    ]);
  });

  it("resumirComisiones sin movimientos", () => {
    expect(resumirComisiones([])).toEqual({
      montoTransaccionado: 0,
      comisionTotal: 0,
      remanente: 0,
      porComercio: [],
    });
  });
});
