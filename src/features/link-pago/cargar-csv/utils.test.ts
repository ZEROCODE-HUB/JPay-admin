import { describe, expect, it } from "vitest";
import type { Establecimiento } from "@/lib/api/liquidaciones";
import type { ResultadoRetenciones, RetencionDetalle } from "@/lib/api/retenciones-lote";
import type { LoteAcreditacion } from "@/lib/api/types";
import type { PreviewAcreditacion, TotalesAcreditacion } from "@/lib/liquidaciones/acreditacion";
import {
  construirSitios,
  csvContracargosDemo,
  fechaCobroRealPara,
  iibbMontoFinal,
  importeNetoFinal,
  liquidacionDePreview,
  mapearEstablecimientos,
  numeroDeInput,
  submitLabelCarga,
  validarCarga,
  type PreviewGeneral,
} from "./utils";

const totales: TotalesAcreditacion = {
  brutoCsv: 1000,
  netoCsv: 900,
  impuestosPayway: 50,
  costoServicio: 50,
  comisionPropia: 30,
  comisionCierre: 4.05,
  retencionDebitoCredito: 5,
  retencionIva: 6.3,
  retencionIibb: 0,
  totalDescuentos: 45.35,
  importeNeto: 854.65,
};

const preview = (aplicables: number, renglones = aplicables) =>
  ({
    renglones: Array.from({ length: renglones }),
    aplicables: Array.from({ length: aplicables }),
    totales,
    diferenciaBruto: 0,
    diferenciaBrutoPct: 0,
  }) as unknown as PreviewAcreditacion;

const ret = (m: number, extra: Partial<RetencionDetalle> = {}): RetencionDetalle => ({
  monto: m,
  alicuotaPct: null,
  asignado: true,
  asigTipo: null,
  asigMonto: null,
  motivo: "",
  aplicado: true,
  ...extra,
});

const retenciones = (iibbAsignado: boolean): ResultadoRetenciones => ({
  loteId: "L1",
  legajo: "LEG",
  cuit: "20-1-1",
  baseImponible: 900,
  comisionPropiaMonto: 30,
  debitoCredito: ret(10),
  iva: ret(20),
  iibb: ret(15, { asignado: iibbAsignado }),
  totalRetenciones: 45,
  asignacionesConsultadas: [],
});

const lote = (siteId: string | null, id = "C1") =>
  ({
    id: `lote-${id}`,
    comercioId: id,
    comercio: { siteId, nombreComercio: null, usuario: `user-${id}` },
  }) as unknown as LoteAcreditacion;

describe("cargar-csv: entradas del cálculo", () => {
  it("mapearEstablecimientos resuelve el nombre del comercio con fallback", () => {
    const rows = [
      {
        establecimiento: "123",
        marca: "VISA",
        comercioId: "C1",
        vigenteHasta: null,
        comercio: { nombreComercio: "Kiosco", usuario: "u@x" },
      },
      {
        establecimiento: "456",
        marca: "AMEX",
        comercioId: "C2",
        vigenteHasta: "2026-12-31",
        comercio: null,
      },
    ] as unknown as Establecimiento[];
    expect(mapearEstablecimientos(rows)).toEqual([
      {
        establecimiento: "123",
        marca: "VISA",
        comercioId: "C1",
        vigenteHasta: null,
        comercioNombre: "Kiosco",
      },
      {
        establecimiento: "456",
        marca: "AMEX",
        comercioId: "C2",
        vigenteHasta: "2026-12-31",
        comercioNombre: "",
      },
    ]);
  });

  it("construirSitios usa el lote en per-lote y los Programado en general", () => {
    expect(construirSitios(true, lote("S1"), [lote("S9", "C9")])).toEqual([
      { sitioId: "S1", comercioId: "C1", comercioNombre: "user-C1" },
    ]);
    expect(construirSitios(true, lote(null), null)).toEqual([]);
    expect(construirSitios(false, null, [lote("S2", "C2"), lote(null, "C3")])).toEqual([
      { sitioId: "S2", comercioId: "C2", comercioNombre: "user-C2" },
    ]);
  });

  it("numeroDeInput acepta coma decimal y cae a 0", () => {
    expect(numeroDeInput("0,45")).toBe(0.45);
    expect(numeroDeInput("")).toBe(0);
    expect(numeroDeInput("abc")).toBe(0);
  });

  it("fechaCobroRealPara devuelve la fecha más antigua o null", () => {
    expect(
      fechaCobroRealPara([{ fecha: "2026-10-09" }, { fecha: "" }, { fecha: "2026-10-07" }]),
    ).toBe("2026-10-07");
    expect(fechaCobroRealPara([{ fecha: "" }])).toBeNull();
    expect(fechaCobroRealPara([])).toBeNull();
  });
});

describe("cargar-csv: retenciones e importe neto", () => {
  it("iibbMontoFinal prefiere el motor solo si IIBB está asignado", () => {
    expect(iibbMontoFinal(null, 7)).toBe(7);
    expect(iibbMontoFinal(retenciones(false), 7)).toBe(7);
    expect(iibbMontoFinal(retenciones(true), 7)).toBe(15);
  });

  it("importeNetoFinal sin motor usa el cálculo local", () => {
    expect(importeNetoFinal(totales, null, 0)).toBe(854.65);
  });

  it("importeNetoFinal con motor recalcula sobre el neto del CSV y no baja de 0", () => {
    // 900 - 30 - 4.05 - 10 - 20 - 15 = 820.95
    expect(importeNetoFinal(totales, retenciones(true), 15)).toBe(820.95);
    expect(importeNetoFinal(totales, retenciones(true), 10_000)).toBe(0);
  });

  it("liquidacionDePreview arma la liquidación con o sin motor", () => {
    expect(liquidacionDePreview(preview(1), 3, 0.45, null, 0)).toEqual({
      comisionPropiaPct: 3,
      comisionPropiaMonto: 30,
      comisionCierreLotePct: 0.45,
      comisionCierreLoteMonto: 4.05,
      debitoCreditoMonto: 5,
      ivaMonto: 6.3,
      iibbMonto: 0,
      importeNeto: 854.65,
    });
    expect(liquidacionDePreview(preview(1), 3, 0.45, retenciones(true), 15)).toMatchObject({
      debitoCreditoMonto: 10,
      ivaMonto: 20,
      iibbMonto: 15,
      importeNeto: 820.95,
    });
  });
});

describe("cargar-csv: validación y textos", () => {
  const general = (n: number) =>
    ({ matches: Array.from({ length: n }), sinMatch: [] }) as unknown as PreviewGeneral;

  it("validarCarga en per-lote exige lote y renglones aplicables", () => {
    const base = { modoPerLote: true, previewGeneral: null };
    expect(validarCarga({ ...base, lote: null, previewPerLote: preview(1) })).toEqual({
      ok: false,
      msg: "Sin lote objetivo.",
    });
    expect(validarCarga({ ...base, lote: lote("S"), previewPerLote: preview(0, 3) }).ok).toBe(
      false,
    );
    expect(validarCarga({ ...base, lote: lote("S"), previewPerLote: preview(2) })).toEqual({
      ok: true,
    });
  });

  it("validarCarga en general exige al menos un lote con match", () => {
    const base = { modoPerLote: false, lote: null, previewPerLote: null };
    expect(validarCarga({ ...base, previewGeneral: null }).ok).toBe(false);
    expect(validarCarga({ ...base, previewGeneral: general(0) }).ok).toBe(false);
    expect(validarCarga({ ...base, previewGeneral: general(1) }).ok).toBe(true);
  });

  it("submitLabelCarga", () => {
    expect(submitLabelCarga(true, null, null)).toBe("Pasar a Pendiente");
    expect(submitLabelCarga(true, preview(1), null)).toMatch(/^Pasar a Pendiente \(.+\)$/);
    expect(submitLabelCarga(false, null, general(1))).toBe("Pasar a Pendiente (1 lote)");
    expect(submitLabelCarga(false, null, general(3))).toBe("Pasar a Pendiente (3 lotes)");
    expect(submitLabelCarga(false, null, general(0))).toBe("Pasar a Pendiente");
  });

  it("csvContracargosDemo arma el archivo con BOM, encabezado y 5 filas", () => {
    const { nombre, contenido } = csvContracargosDemo(new Date(2026, 9, 15), "Marca");
    expect(nombre).toBe("contracargos_demo_2026-10.csv");
    expect(contenido.startsWith("﻿Marca - Reporte")).toBe(true);
    const lineas = contenido.split("\r\n");
    expect(lineas).toHaveLength(7);
    expect(lineas[1]).toMatch(/^ID_TRANSACCION;/);
  });
});
