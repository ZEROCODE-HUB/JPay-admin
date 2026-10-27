import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/api/types";
import { consumoTone, riesgoTone } from "./estados";
import { labelRiesgo, toUsuario } from "./utils";

const cliente = {
  id: "1",
  legajo: "L-1",
  correo: "a@b.com",
  nombre: "Ana",
  cuit: "20123456789",
  estado: "activado",
  fechaAlta: "01/01/2026",
  esPep: true,
  limiteTransferencia: 1000,
} as unknown as Cliente;

describe("personas físicas: utils", () => {
  it("toUsuario usa defaults sin enrichment", () => {
    const u = toUsuario(cliente);
    expect(u.legajo).toBe("L-1");
    expect(u.nombres).toBe("Ana");
    expect(u.esPep).toBe(true);
    expect(u.riesgo).toBeNull();
    expect(u.kycCompleto).toBe(false);
    expect(u.cvuCount).toBe(0);
    expect(u.consumoMensualPct).toBeNull();
    expect(u.limiteTransferencia).toBe(1000);
  });

  it("toUsuario toma el enrichment", () => {
    const u = toUsuario(cliente, {
      riesgo: "alto",
      riesgoMotivo: "x",
      kycCompleto: true,
      cvuCount: 2,
      consumoMensualPct: 40,
    });
    expect(u.riesgo).toBe("alto");
    expect(u.riesgoMotivo).toBe("x");
    expect(u.kycCompleto).toBe(true);
    expect(u.cvuCount).toBe(2);
    expect(u.consumoMensualPct).toBe(40);
  });

  it("labelRiesgo capitaliza", () => {
    expect(labelRiesgo("medio")).toBe("Medio");
  });

  it("estados → clases", () => {
    expect(riesgoTone("bajo")).toContain("emerald");
    expect(riesgoTone("critico")).toContain("danger");
    expect(consumoTone(95)).toBe("bg-danger-500");
    expect(consumoTone(75)).toBe("bg-amber-500");
    expect(consumoTone(50)).toBe("bg-yellow-500");
    expect(consumoTone(10)).toBe("bg-emerald-500");
  });
});
