import { describe, expect, it } from "vitest";
import type { SubcuentaConCliente } from "@/lib/api/subcuentas";
import { estadoSubcuenta, tipoSubcuentaClases } from "./estados";
import { toClabeTableRow } from "./utils";

describe("estadoSubcuenta", () => {
  it("traduce los estados de subcuenta", () => {
    expect(estadoSubcuenta("Activa")).toEqual({ label: "Habilitado", tone: "success" });
    expect(estadoSubcuenta("Pausada")).toEqual({ label: "Deshabilitado", tone: "danger" });
    expect(estadoSubcuenta("Suspendido")).toEqual({ label: "Suspendido", tone: "warn" });
  });
  it("deja los desconocidos en neutral con su texto", () => {
    expect(estadoSubcuenta("Otro")).toEqual({ label: "Otro", tone: "neutral" });
  });
});

describe("tipoSubcuentaClases", () => {
  it("usa violeta para Sueldos", () => {
    expect(tipoSubcuentaClases("Sueldos")).toContain("purple");
    expect(tipoSubcuentaClases("Operativa")).toContain("emerald");
  });
});

describe("toClabeTableRow", () => {
  const base = {
    id: "s1",
    legajo: "L1",
    nombre: "Ana",
    apellido: "Pérez",
    email: "ana@x.com",
    tipo: "Operativa",
    estado: "Activa",
    cbu: "032180000118359719",
    createdAt: null,
    cliente: {
      id: "cli-1",
      correo: "c@x.com",
      nombre: "Ana",
      taxId: "GODE561231GR8",
      tipoPersona: "fisica",
    },
  } as unknown as SubcuentaConCliente;

  it("toma la CLABE, el RFC y el correo del cliente", () => {
    const r = toClabeTableRow(base);
    expect(r._clabe).toBe("032180000118359719");
    expect(r._correo).toBe("c@x.com");
    expect(r._rfc).toBe("GODE561231GR8");
    expect(r._fechaAlta).toBe("—");
  });

  it("sin CLABE ni cliente", () => {
    const r = toClabeTableRow({
      ...base,
      cbu: null,
      cliente: null,
    } as unknown as SubcuentaConCliente);
    expect(r._clabe).toBeNull();
    expect(r._rfc).toBe("");
    expect(r._correo).toBe("ana@x.com");
  });
});
