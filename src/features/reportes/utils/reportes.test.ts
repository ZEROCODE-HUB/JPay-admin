import { describe, expect, it } from "vitest";
import { actividadExcelRows, filtrarActividad, parseFechaDMY, type Actividad } from "./actividad";
import { generarTxtImpuesto, generarXmlImpuesto, nuevoImpuesto, type Impuesto } from "./impuestos";
import { esCuitValido, normalizarCuit, periodoActual, periodoEnCurso } from "./periodos";

const imp: Impuesto = {
  id: "IMP-0001",
  reporte: "Débito/Crédito <Sellos> & otros",
  periodo: "2026-06",
  tramo: "Tramo 1",
  creado: "2026-07-05",
  presentado: "Sí",
  pagado: "No",
  totalRegistros: 12,
  totalMovimientos: 10,
  totalMonto: "$ 1.000",
  totalRetenciones: "$ 100",
};

describe("impuestos", () => {
  it("genera el TXT", () => {
    expect(generarTxtImpuesto(imp)).toBe(
      [
        "ID: IMP-0001",
        "Reporte: Débito/Crédito <Sellos> & otros",
        "Periodo: 2026-06",
        "Tramo: Tramo 1",
        "Fecha de creacion: 2026-07-05",
        "Presentado: Sí",
        "Pagado: No",
        "Total registros: 12",
        "Total movimientos: 10",
        "Total monto: $ 1.000",
        "Total retenciones: $ 100",
      ].join("\n"),
    );
  });
  it("genera el XML escapando &, < y >", () => {
    const xml = generarXmlImpuesto(imp);
    expect(xml.split("\n")[0]).toBe('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("  <reporte>Débito/Crédito &lt;Sellos&gt; &amp; otros</reporte>");
    expect(xml).toContain("  <total_registros>12</total_registros>");
    expect(xml.endsWith("</reporte_impuesto>")).toBe(true);
  });
  it("nuevoImpuesto numera y toma el período de la fecha", () => {
    const n = nuevoImpuesto(4, { fecha: "2026-08-15", impuesto: "IVA", tramo: "Tramo 2" });
    expect(n).toMatchObject({
      id: "IMP-0005",
      periodo: "2026-08",
      creado: "2026-08-15",
      presentado: "No",
      pagado: "No",
      totalMonto: "$ 0",
    });
  });
});

describe("actividad", () => {
  const items: Actividad[] = [
    {
      campo: "A",
      valorAnterior: "",
      valorNuevo: "",
      fecha: "15/07/2026",
      hora: "10:00",
      usuario: "u",
    },
    {
      campo: "B",
      valorAnterior: "",
      valorNuevo: "",
      fecha: "10/07/2026",
      hora: "09:00",
      usuario: "u",
    },
  ];
  it("parseFechaDMY", () => {
    expect(parseFechaDMY("15/07/2026")).toEqual(new Date(2026, 6, 15));
    expect(parseFechaDMY("2026-07-15")).toBeNull();
  });
  it("sin rango devuelve todo", () => {
    expect(filtrarActividad(items, "", "")).toHaveLength(2);
  });
  it("filtra con fechas DD/MM/AAAA", () => {
    expect(filtrarActividad(items, "12/07/2026", "").map((a) => a.campo)).toEqual(["A"]);
    expect(filtrarActividad(items, "", "12/07/2026").map((a) => a.campo)).toEqual(["B"]);
  });
  it("filtra con fechas del input date (AAAA-MM-DD)", () => {
    expect(filtrarActividad(items, "2026-07-12", "").map((a) => a.campo)).toEqual(["A"]);
    expect(filtrarActividad(items, "", "2026-07-31")).toHaveLength(2);
    expect(filtrarActividad(items, "", "2026-07-12").map((a) => a.campo)).toEqual(["B"]);
  });
  it("arma filas de Excel", () => {
    expect(actividadExcelRows([items[0]])).toEqual([
      {
        "Campo actualizado": "A",
        "Valor anterior": "",
        "Valor nuevo": "",
        "Fecha y hora": "15/07/2026 10:00",
        "Actualizado por": "u",
      },
    ]);
  });
});

describe("periodos y CUIT", () => {
  it("periodoActual / periodoEnCurso", () => {
    const d = new Date(2026, 2, 20);
    expect(periodoActual(d)).toBe("2026-03");
    expect(periodoEnCurso(d)).toBe("01/03/2026");
  });
  it("normaliza y valida CUIT", () => {
    expect(normalizarCuit("20-12345678-9 99")).toBe("20123456789");
    expect(esCuitValido("20123456789")).toBe(true);
    expect(esCuitValido("2012345678")).toBe(false);
  });
});
