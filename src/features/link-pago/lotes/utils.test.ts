import { describe, expect, it } from "vitest";
import type { LoteAcreditacion } from "@/lib/api/types";
import { toneAdelanto, toneLote, toneMovimiento } from "./estados";
import {
  comisionCierrePct,
  esMontoValido,
  impuestosLote,
  lotesACsv,
  mensajeCsvCargado,
  netoConContracargo,
  parseContracargoInput,
  resumirPorComercio,
  round2,
  tasasCalculadas,
  totalDescuentos,
} from "./utils";

function lote(over: Partial<LoteAcreditacion> = {}): LoteAcreditacion {
  return {
    id: "l1",
    codigo: "L-001",
    comercioId: "c1",
    bandera: "Visa",
    fecha: "2026-10-01",
    cantidadOperaciones: 3,
    importeBruto: 10000,
    impuestos: 0,
    tasaPaywayPct: 3,
    tasaPaywayMonto: 999,
    tasaPropiaPct: 2,
    tasaPropiaMonto: 888,
    cuotas: null,
    costoPaywayPagoUnico: null,
    contracargoMonto: 0,
    comisionCierreLotePct: 0.45,
    comisionCierreLoteMonto: 45,
    importeNeto: 9000,
    estado: "Pendiente",
    esEstimado: false,
    diasHabilesAplicados: null,
    fechaEstimadaRecalcular: false,
    resueltoPor: null,
    fechaResolucion: null,
    notasResolucion: null,
    createdAt: "",
    updatedAt: "",
    ivaMonto: 100,
    iibbMonto: 50,
    debitoCreditoMonto: 25,
    fechaCobroReal: null,
    comercio: { id: "c1", usuario: "u1", legajo: "LEG1", nombreComercio: "Kiosco", siteId: null },
    ...over,
  };
}

describe("tasasCalculadas", () => {
  it("recalcula bruto × pct / 100 ignorando los montos de la DB", () => {
    expect(tasasCalculadas(lote())).toEqual({ paywayMonto: 300, propiaMonto: 200 });
  });
  it("redondea a 2 decimales y tolera valores no numéricos", () => {
    expect(tasasCalculadas(lote({ importeBruto: 333.33, tasaPaywayPct: 1.5 })).paywayMonto).toBe(5);
    expect(tasasCalculadas(lote({ tasaPaywayPct: NaN })).paywayMonto).toBe(0);
    expect(round2(1.005)).toBe(1.01);
  });
});

describe("impuestosLote", () => {
  it("suma los snapshots reales", () => {
    const i = impuestosLote(lote());
    expect(i.totalReal).toBe(175);
    expect(i.usarLegacy).toBe(false);
    expect(i.total).toBe(175);
  });
  it("cae al legacy si los snapshots están en 0", () => {
    const i = impuestosLote(
      lote({ ivaMonto: null, iibbMonto: 0, debitoCreditoMonto: null, impuestos: 400 }),
    );
    expect(i.usarLegacy).toBe(true);
    expect(i.total).toBe(400);
  });
});

describe("totalDescuentos", () => {
  it("lote firme: impuestos + tasas + cierre + contracargo + pago único", () => {
    const l = lote({ costoPaywayPagoUnico: 10, contracargoMonto: 20 });
    expect(totalDescuentos(l)).toBe(175 + 300 + 200 + 10 + 45 + 20);
  });
  it("lote Programado no descuenta el cierre de lote", () => {
    expect(totalDescuentos(lote({ estado: "Programado" }))).toBe(175 + 300 + 200);
  });
});

describe("comisionCierrePct", () => {
  it("usa el pct del lote o cae a 0,45", () => {
    expect(comisionCierrePct(lote({ comisionCierreLotePct: 0.6 }))).toBe(0.6);
    expect(comisionCierrePct(lote({ comisionCierreLotePct: 0 }))).toBe(0.45);
    expect(comisionCierrePct(lote({ comisionCierreLotePct: null }))).toBe(0.45);
  });
});

describe("contracargo", () => {
  it("parsea el input", () => {
    expect(parseContracargoInput("  ")).toBeUndefined();
    expect(parseContracargoInput("12,5")).toBe(12.5);
    expect(parseContracargoInput(".")).toBe(0);
  });
  it("valida el formato", () => {
    expect(esMontoValido("")).toBe(true);
    expect(esMontoValido("10.5")).toBe(true);
    expect(esMontoValido("10,5")).toBe(true);
    expect(esMontoValido("1.2.3")).toBe(false);
    expect(esMontoValido("abc")).toBe(false);
  });
  it("neto recalculado usa la columna legacy de impuestos", () => {
    const l = lote({ impuestos: 100 });
    expect(netoConContracargo(l, "")).toBe(10000 - 100 - 300 - 200 - 45);
    expect(netoConContracargo(l, "50,5")).toBe(10000 - 100 - 300 - 200 - 50.5 - 45);
  });
});

describe("resumirPorComercio", () => {
  it("agrupa por comercio sumando montos", () => {
    const r = resumirPorComercio([
      lote({ id: "a", costoPaywayPagoUnico: 1, contracargoMonto: 5, impuestos: 7 }),
      lote({ id: "b", importeNeto: 1000, impuestos: 3 }),
      lote({ id: "c", comercioId: "c2", comercio: null }),
    ]);
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({
      comercio: "Kiosco",
      legajo: "LEG1",
      cantidadLotes: 2,
      cantidadOps: 6,
      totalBruto: 20000,
      totalImpuestos: 10,
      totalPayWay: 999 * 2 + 1,
      totalPropio: 888 * 2,
      totalContracargo: 5,
      totalFinal: 10000,
      pendienteAcreditar: 10000,
    });
    expect(r[1]).toMatchObject({ comercio: "—", legajo: "c2", cantidadLotes: 1 });
  });

  it("no cuenta como pendiente lo acreditado o cancelado", () => {
    const [r] = resumirPorComercio([
      lote({ id: "a", estado: "Pendiente", importeNeto: 100, impuestos: 1 }),
      lote({ id: "b", estado: "Acreditado", importeNeto: 200, impuestos: 2 }),
      lote({ id: "c", estado: "Cancelado", importeNeto: 300, impuestos: 3 }),
    ]);
    expect(r).toMatchObject({ totalFinal: 600, pendienteAcreditar: 100, pendienteImpuestos: 1 });
  });
});

describe("lotesACsv", () => {
  it("arma CSV con BOM, ; y montos con coma, escapando celdas", () => {
    const csv = lotesACsv([
      lote({ cuotas: 3, comercio: { ...lote().comercio!, nombreComercio: 'Kiosco "A"; B' } }),
    ]);
    const [header, fila] = csv.slice(1).split("\r\n");
    expect(csv.startsWith("﻿")).toBe(true);
    expect(header.split(";")).toHaveLength(12);
    expect(fila).toBe(
      'L-001;2026-10-01;;"Kiosco ""A""; B";LEG1;Visa;3c;3;10000,00;720,00;9000,00;Pendiente',
    );
  });
});

describe("mensajeCsvCargado", () => {
  it("arma el texto según aplicados / sin match", () => {
    expect(mensajeCsvCargado({ aplicados: 0, sinMatch: 2 }).tipo).toBe("warning");
    expect(mensajeCsvCargado({ aplicados: 1, sinMatch: 0 }).texto).toBe("Lote pasado a Pendiente.");
    expect(mensajeCsvCargado({ aplicados: 3, sinMatch: 1 }).texto).toBe(
      "3 lotes pasados a Pendiente. 1 renglón(es) sin match.",
    );
  });
});

describe("estados", () => {
  it("mapea tonos", () => {
    expect(toneLote("Acreditado")).toBe("success");
    expect(toneLote("Programado")).toBe("neutral");
    expect(toneMovimiento(null)).toBe("neutral");
    expect(toneMovimiento("aprobado")).toBe("success");
    expect(toneMovimiento("XYZ")).toBe("warn");
    expect(toneAdelanto("Rechazado")).toBe("danger");
    expect(toneAdelanto("Otro")).toBe("neutral");
  });
});
