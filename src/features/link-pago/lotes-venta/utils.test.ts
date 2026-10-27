import { describe, expect, it } from "vitest";
import type { LoteVenta } from "@/lib/api/types";
import { toneOperacion } from "./estados";
import {
  celdaCsv,
  keyLoteVenta,
  legajoComercioVenta,
  lotesVentaACsv,
  nombreComercioVenta,
} from "./utils";

function lote(over: Partial<LoteVenta> = {}): LoteVenta {
  return {
    comercioId: "c1",
    bandera: "Visa",
    fecha: "2026-10-01",
    cantidadOperaciones: 3,
    importeBruto: 1000,
    impuestos: 10.5,
    comision: 20,
    importeNeto: 1000,
    netoEstimado: 969.5,
    comercio: { id: "c1", usuario: "usr", legajo: "L-1", nombreComercio: "Tienda" },
    ...over,
  };
}

describe("toneOperacion", () => {
  it("mapea los códigos conocidos", () => {
    expect(toneOperacion("APROBADO")).toBe("success");
    expect(toneOperacion("PENDIENTE")).toBe("warn");
    expect(toneOperacion("PROCESADO")).toBe("warn");
    expect(toneOperacion("ERROR")).toBe("danger");
  });
  it("vacío o desconocido es neutral", () => {
    expect(toneOperacion(undefined)).toBe("neutral");
    expect(toneOperacion("OTRO")).toBe("neutral");
  });
});

describe("comercio del lote", () => {
  it("usa nombre, luego usuario, luego guion", () => {
    expect(nombreComercioVenta(lote())).toBe("Tienda");
    expect(
      nombreComercioVenta(
        lote({ comercio: { id: "c1", usuario: "usr", legajo: "L", nombreComercio: null } }),
      ),
    ).toBe("usr");
    expect(nombreComercioVenta(lote({ comercio: null }))).toBe("—");
  });
  it("legajo cae al id del comercio", () => {
    expect(legajoComercioVenta(lote())).toBe("L-1");
    expect(legajoComercioVenta(lote({ comercio: null }))).toBe("c1");
  });
  it("key combina comercio, bandera y fecha", () => {
    expect(keyLoteVenta(lote())).toBe("c1-Visa-2026-10-01");
  });
});

describe("CSV", () => {
  it("escapa comillas, separadores y saltos", () => {
    expect(celdaCsv(null)).toBe("");
    expect(celdaCsv("a;b")).toBe('"a;b"');
    expect(celdaCsv('di "x"')).toBe('"di ""x"""');
    expect(celdaCsv(3)).toBe("3");
  });
  it("arma encabezado y filas con 2 decimales", () => {
    const csv = lotesVentaACsv([lote()]);
    const [header, fila] = csv.split("\n");
    expect(header.split(";")[0]).toBe("Fecha Venta");
    const celdas = fila.split(";");
    expect(celdas[1]).toBe("Tienda");
    expect(celdas[2]).toBe("L-1");
    expect(celdas[5]).toBe("1000.00");
    expect(celdas[6]).toBe("10.50");
    expect(celdas[8]).toBe("969.50");
  });
});
