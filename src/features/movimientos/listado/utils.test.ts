import { describe, expect, it } from "vitest";
import type { LineaMovimiento } from "@/lib/api/lineas-movimiento";
import { rangoFechaApi } from "../comun/utils";
import { agruparPorTxid, fmtFecha, toggleEnSet } from "./utils";

const linea = (idTxn: string, lineNo: number) => ({ idTxn, lineNo }) as unknown as LineaMovimiento;

describe("agruparPorTxid", () => {
  const rows = [linea("A", 1), linea("A", 2), linea("B", 1), linea("A", 3)];

  it("sin agrupar deja todas las líneas planas", () => {
    const out = agruparPorTxid(rows, false, new Set());
    expect(out).toHaveLength(4);
    expect(out.every((f) => !f._esCabeza && f._hijas === 0)).toBe(true);
  });

  it("agrupando muestra solo las cabezas con su cantidad de hijas", () => {
    const out = agruparPorTxid(rows, true, new Set());
    expect(out.map((f) => [f.idTxn, f._esCabeza, f._hijas])).toEqual([
      ["A", true, 2],
      ["B", true, 0],
    ]);
  });

  it("los grupos abiertos muestran sus hijas", () => {
    const out = agruparPorTxid(rows, true, new Set(["A"]));
    expect(out.map((f) => f.lineNo)).toEqual([1, 2, 1, 3]);
  });
});

describe("helpers", () => {
  it("toggleEnSet agrega y quita sin mutar", () => {
    const s = new Set(["a"]);
    expect([...toggleEnSet(s, "b")]).toEqual(["a", "b"]);
    expect([...toggleEnSet(s, "a")]).toEqual([]);
    expect([...s]).toEqual(["a"]);
  });

  it("fmtFecha devuelve el texto original si no es fecha", () => {
    expect(fmtFecha("xx")).toBe("xx");
    expect(fmtFecha("2026-01-02T03:04:05")).toBe("2026-01-02 03:04:05");
  });

  it("rangoFechaApi cubre el día completo", () => {
    expect(rangoFechaApi({ from: "2026-01-01", to: "2026-01-31" })).toEqual({
      fechaDesde: "2026-01-01T00:00:00.000",
      fechaHasta: "2026-01-31T23:59:59.999",
    });
    expect(rangoFechaApi(undefined)).toEqual({ fechaDesde: undefined, fechaHasta: undefined });
  });
});
