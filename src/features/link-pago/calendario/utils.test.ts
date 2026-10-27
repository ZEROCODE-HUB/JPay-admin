import { describe, expect, it } from "vitest";
import type { CalendarioAcreditacion } from "@/lib/api/calendario-acreditaciones";
import { colorEstado, ESTADO_COLORS } from "./estados";
import {
  claveFecha,
  nombresBanderas,
  adelantosComprometidos,
  agruparPorFecha,
  comisionCierrePct,
  diasDelMes,
  mesAnterior,
  mesSiguiente,
  netoDespuesAdelantos,
  nombreArchivoSeguro,
  parseDateLocal,
  resumenCelda,
  tieneAdelantoActivo,
  totalesDia,
} from "./utils";

function item(over: Partial<CalendarioAcreditacion> = {}): CalendarioAcreditacion {
  return {
    id: "l1",
    codigo: "L-001",
    comercioId: "c1",
    comercioNombre: "Kiosco",
    comercioLegajo: "LEG1",
    bandera: "Visa",
    fechaVenta: "2026-10-01",
    fechaAcreditacion: "2026-10-05",
    diasHabilesAplicados: 2,
    cantidadOperaciones: 3,
    importeBruto: 10000,
    impuestos: 100,
    tasaPaywayPct: 3,
    tasaPaywayMonto: 300,
    tasaPropiaPct: 2,
    tasaPropiaMonto: 200,
    comisionCierreLoteMonto: 45,
    contracargoMonto: 0,
    importeNeto: 9355,
    estadoLote: "Programado",
    estadoCalculado: "programado",
    adelantosReservadosTotal: 0,
    adelantosAplicadosDia: 0,
    ...over,
  };
}

describe("totalesDia", () => {
  it("suma bruto, neto, adelantos reservados y operaciones", () => {
    const t = totalesDia([
      item({ adelantosReservadosTotal: 500 }),
      item({ importeBruto: 5000, importeNeto: 4000, cantidadOperaciones: 2 }),
    ]);
    expect(t).toEqual({ bruto: 15000, neto: 13355, adelantosReservados: 500, operaciones: 5 });
  });
  it("con lista vacía devuelve ceros", () => {
    expect(totalesDia([])).toEqual({ bruto: 0, neto: 0, adelantosReservados: 0, operaciones: 0 });
  });
});

describe("resumenCelda", () => {
  it("descuenta los adelantos aplicados del neto", () => {
    const r = resumenCelda([item({ adelantosAplicadosDia: 9000 })], 100);
    expect(r.totalBruto).toBe(10000);
    expect(r.totalAdelantos).toBe(9000);
    expect(r.netoDespuesAdelantos).toBe(355);
    expect(r.tieneAdelanto).toBe(true);
    expect(r.cupoAgotado).toBe(false);
  });
  it("marca cupo agotado si el remanente queda bajo el mínimo", () => {
    const r = resumenCelda([item({ adelantosAplicadosDia: 9300 })], 100);
    expect(r.netoDespuesAdelantos).toBe(55);
    expect(r.cupoAgotado).toBe(true);
  });
  it("no marca cupo agotado si no hay adelanto", () => {
    const r = resumenCelda([item({ importeNeto: 10 })], 100);
    expect(r.tieneAdelanto).toBe(false);
    expect(r.cupoAgotado).toBe(false);
  });
  it("el neto libre nunca es negativo", () => {
    expect(resumenCelda([item({ adelantosAplicadosDia: 99999 })], 100).netoDespuesAdelantos).toBe(
      0,
    );
  });
});

describe("netoDespuesAdelantos / comisionCierrePct", () => {
  it("neto menos adelanto, piso 0", () => {
    expect(netoDespuesAdelantos(item({ adelantosAplicadosDia: 355 }))).toBe(9000);
    expect(netoDespuesAdelantos(item({ adelantosAplicadosDia: 20000 }))).toBe(0);
  });
  it("% de cierre sobre el bruto, 0 si no hay bruto", () => {
    expect(comisionCierrePct(item())).toBeCloseTo(0.45);
    expect(comisionCierrePct(item({ importeBruto: 0 }))).toBe(0);
  });
});

describe("adelantos", () => {
  it("tieneAdelantoActivo solo con Pendiente o Aprobado", () => {
    expect(tieneAdelantoActivo([{ estado: "Acreditado" }])).toBe(false);
    expect(tieneAdelantoActivo([{ estado: "Rechazado" }, { estado: "Pendiente" }])).toBe(true);
  });
  it("adelantosComprometidos excluye cerrados", () => {
    const r = adelantosComprometidos([
      { estado: "Aprobado" as const },
      { estado: "Acreditado" as const },
      { estado: "Cancelado" as const },
      { estado: "Pendiente" as const },
    ]);
    expect(r.map((a) => a.estado)).toEqual(["Aprobado", "Pendiente"]);
  });
});

describe("diasDelMes", () => {
  it("arma semanas completas empezando en lunes", () => {
    // Octubre 2026: el 1 es jueves → 3 días de relleno (lun-mié de septiembre).
    const dias = diasDelMes(10, 2026, new Date(2026, 9, 15));
    expect(dias.length % 7).toBe(0);
    expect(dias.slice(0, 3).every((d) => d.esOtroMes)).toBe(true);
    expect(dias[3].fecha.getDate()).toBe(1);
    expect(dias.filter((d) => !d.esOtroMes)).toHaveLength(31);
    const hoy = dias.find((d) => d.esActual);
    expect(hoy?.fecha.getDate()).toBe(15);
    expect(dias[3].esPasado).toBe(true);
  });
});

describe("navegación de meses", () => {
  it("cruza el año", () => {
    expect(mesAnterior({ mes: 1, anio: 2026 })).toEqual({ mes: 12, anio: 2025 });
    expect(mesSiguiente({ mes: 12, anio: 2026 })).toEqual({ mes: 1, anio: 2027 });
    expect(mesSiguiente({ mes: 5, anio: 2026 })).toEqual({ mes: 6, anio: 2026 });
  });
});

describe("helpers", () => {
  it("parseDateLocal no corre el día por zona horaria", () => {
    const d = parseDateLocal("2026-10-05");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 5]);
  });
  it("agruparPorFecha indexa por fecha de acreditación", () => {
    const m = agruparPorFecha([
      item({ id: "a" }),
      item({ id: "b" }),
      item({ id: "c", fechaAcreditacion: "2026-10-06" }),
    ]);
    expect(m.get("2026-10-05")?.map((i) => i.id)).toEqual(["a", "b"]);
    expect(m.get("2026-10-06")).toHaveLength(1);
  });
  it("nombreArchivoSeguro reemplaza caracteres raros", () => {
    expect(nombreArchivoSeguro("lunes, 5 de octubre")).toBe("lunes__5_de_octubre");
  });
  it("colorEstado cae a pendiente si el estado es desconocido", () => {
    expect(colorEstado("acreditado")).toBe(ESTADO_COLORS.acreditado);
    expect(colorEstado("raro" as never)).toBe(ESTADO_COLORS.pendiente);
  });
});

describe("claveFecha", () => {
  it("usa la fecha local, no UTC (no corre el día a la noche ni a la madrugada)", () => {
    expect(claveFecha(new Date(2026, 9, 5, 23, 30))).toBe("2026-10-05");
    expect(claveFecha(new Date(2026, 9, 5, 0, 0))).toBe("2026-10-05");
    expect(claveFecha(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
  it("coincide con las claves de agruparPorFecha para cada día del mes", () => {
    const dias = diasDelMes(10, 2026, new Date(2026, 9, 15));
    const claves = dias.filter((d) => !d.esOtroMes).map((d) => claveFecha(d.fecha));
    expect(claves[0]).toBe("2026-10-01");
    expect(claves[claves.length - 1]).toBe("2026-10-31");
  });
});

describe("nombresBanderas", () => {
  it("toma los nombres del catálogo, sin repetidos ni vacíos, ordenados", () => {
    expect(
      nombresBanderas([
        { nombre: "Visa" },
        { nombre: "Naranja X" },
        { nombre: " " },
        { nombre: "Visa" },
      ]),
    ).toEqual(["Naranja X", "Visa"]);
  });
  it("devuelve vacío si no hay catálogo", () => {
    expect(nombresBanderas([])).toEqual([]);
  });
});
