import { describe, expect, it } from "vitest";
import type { CruceItem } from "@/lib/conciliacion/engine";
import {
  buildCruceCsv,
  calcularRangoConciliacion,
  downloadRowsToBankRows,
  nombreCruceCsv,
  porcentajeExito,
} from "./conciliacion";

describe("porcentajeExito", () => {
  it("redondea a 2 decimales", () => {
    expect(porcentajeExito({ total: 3, encontrados: 2 })).toBe(66.67);
  });
  it("devuelve 0 sin resumen o con total 0", () => {
    expect(porcentajeExito(null)).toBe(0);
    expect(porcentajeExito({ total: 0, encontrados: 0 })).toBe(0);
  });
});

describe("calcularRangoConciliacion", () => {
  const a1 = { archivo: "a1.csv", fecha: "2026-09-01" };
  const a2 = { archivo: "a2.csv", fecha: "2026-09-03" };

  it("primer reporte: histórico hasta fin del día de carga", () => {
    const r = calcularRangoConciliacion(a1, [a2, a1]);
    expect(r.desde).toBeUndefined();
    expect(r.rangoLabel).toBe("histórico hasta 2026-09-01");
    const hasta = new Date(r.hasta);
    expect([hasta.getHours(), hasta.getMinutes(), hasta.getMilliseconds()]).toEqual([23, 59, 999]);
    expect(hasta.getDate()).toBe(1);
  });

  it("siguientes: delta desde el día posterior al reporte anterior", () => {
    const r = calcularRangoConciliacion(a2, [a2, a1]);
    expect(r.rangoLabel).toBe("2026-09-01 → 2026-09-03 (delta)");
    const desde = new Date(r.desde!);
    expect([desde.getDate(), desde.getHours()]).toEqual([2, 0]);
    expect(new Date(r.hasta).getDate()).toBe(3);
  });
});

describe("downloadRowsToBankRows", () => {
  it("mapea columnas del banco y aplica defaults", () => {
    const [b] = downloadRowsToBankRows([{ ID_DEBIN: "X1", IMPORTE_COELSA: -150.5 }]);
    expect(b.idDebin).toBe("X1");
    expect(b.importeCoelsa).toBe(-150.5);
    expect(b.importeRaw).toBe("-150.5");
    expect(b.estadoCoelsa).toBe("COMPLETADA");
    expect(b.cvu).toBe("");
  });
});

describe("buildCruceCsv", () => {
  it("arma encabezado, escapa comillas/comas y usa \\n", () => {
    const items = [
      {
        bankRow: { idDebin: "D1", tipoMovCoelsa: "CREDITO", importeCoelsa: 10, estadoCoelsa: "OK" },
        movimiento: { idTxn: "T1", montoOperacion: 10 },
        estado: "encontrado",
        detalle: 'monto "ok", fecha',
      },
      {
        bankRow: { idDebin: "D2", tipoMovCoelsa: "DEBITO", importeCoelsa: -5, estadoCoelsa: "OK" },
        movimiento: null,
        estado: "no_encontrado",
        detalle: "a;b",
      },
    ] as unknown as CruceItem[];
    expect(buildCruceCsv(items)).toBe(
      [
        "ID_DEBIN,TIPO,IMPORTE_BANCO,ESTADO_BANCO,id_txn_plataforma,monto_plataforma,estado_cruce,detalle",
        'D1,CREDITO,10,OK,T1,10,encontrado,"monto ""ok"", fecha"',
        'D2,DEBITO,-5,OK,,,no_encontrado,"a;b"',
      ].join("\n"),
    );
  });
  it("sin items devuelve string vacío", () => {
    expect(buildCruceCsv([])).toBe("");
  });
});

describe("nombreCruceCsv", () => {
  it("reemplaza la extensión", () => {
    expect(nombreCruceCsv("banco.2026.xlsx")).toBe("cruce_banco.2026.csv");
    expect(nombreCruceCsv("sinext")).toBe("cruce_sinext.csv");
  });
});
