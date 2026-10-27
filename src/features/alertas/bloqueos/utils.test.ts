import { describe, expect, it } from "vitest";
import type { AccountBlock } from "@/lib/api/compliance";
import { fechaYResponsable, nombreCsv, rangoFiltro, totalPaginas } from "../comun/utils";
import { alcanceDetalle, filaCsvBloqueo, filtrosBloqueos, mensajeLiberacion } from "./utils";

const bloqueo = {
  id: "b1",
  legajo: "L1",
  correo: "a@x.com",
  nombre: "Ana",
  origin: "rule",
  ruleName: "Depósitos",
  scope: "subaccount",
  subcuentaNombre: "Principal",
  subcuentaCvu: "000123",
  reason: "Umbral",
  blockStatus: "active",
  complianceStatus: "pending",
  blockedAt: "2026-01-01T00:00:00Z",
  acceptedAt: null,
  releasedAt: null,
  heldAmount: 100,
} as unknown as AccountBlock;

describe("filtrosBloqueos", () => {
  it("traduce etiquetas del panel a códigos de la API", () => {
    const f = filtrosBloqueos(
      {
        global: "",
        enums: { estado: "Bloqueado", compliance: "Aceptado", alcance: "Subcuenta" },
        dates: { blockedAt: { from: "2026-01-01", to: "" } },
      },
      "ana",
    );
    expect(f).toMatchObject({
      search: "ana",
      blockStatus: "active",
      complianceStatus: "accepted",
      scope: "subaccount",
      blockedFrom: "2026-01-01",
      blockedTo: undefined,
      acceptedFrom: undefined,
    });
  });

  it("sin filtros deja todo en undefined", () => {
    const f = filtrosBloqueos({ global: "", enums: {}, dates: {} }, "");
    expect(Object.values(f).every((v) => v === undefined)).toBe(true);
  });
});

describe("filas y textos", () => {
  it("arma la fila del CSV", () => {
    const fila = filaCsvBloqueo(bloqueo);
    expect(fila[3]).toBe("Regla: Depósitos");
    expect(fila[4]).toBe("Subcuenta");
    expect(fila[7]).toBe("Bloqueado");
    expect(fila[8]).toBe("Pendiente");
    expect(fila[10]).toBe("");
  });

  it("describe el alcance", () => {
    expect(alcanceDetalle(bloqueo)).toBe("Subcuenta Principal 000123");
    expect(alcanceDetalle({ ...bloqueo, scope: "client" } as AccountBlock)).toBe("Toda la cuenta");
  });

  it("mensaje de liberación según depósitos liberados", () => {
    expect(mensajeLiberacion({ depositos_liberados: 0, monto_liberado: 0 })).toBe(
      "Bloqueo liberado.",
    );
    expect(mensajeLiberacion({ depositos_liberados: 2, monto_liberado: 50 })).toContain(
      "Se liberaron 2 depósito(s)",
    );
  });
});

describe("utilidades comunes", () => {
  it("nombreCsv, rangoFiltro, totalPaginas y fechaYResponsable", () => {
    expect(nombreCsv("bloqueos", new Date("2026-03-04T12:00:00Z"))).toBe("bloqueos-2026-03-04.csv");
    expect(rangoFiltro({}, "x")).toEqual({ from: undefined, to: undefined });
    expect(totalPaginas(0, 20)).toBe(1);
    expect(totalPaginas(41, 20)).toBe(3);
    expect(fechaYResponsable(null, "x")).toBe("—");
  });
});
