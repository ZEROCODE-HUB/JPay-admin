import { describe, expect, it } from "vitest";
import { actividadExcelRows, filtrarActividad, parseFechaDMY, type Actividad } from "./actividad";
import { periodoEnCurso } from "./periodos";

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

describe("periodos", () => {
  it("periodoEnCurso", () => {
    expect(periodoEnCurso(new Date(2026, 2, 20))).toBe("01/03/2026");
  });
});
