import { describe, expect, it } from "vitest";
import type { CvuRow } from "@/lib/api/subcuentas";
import { estadoCvu, tipoSubcuentaClases } from "./estados";
import { aliasDeCvu, aliasDeFila, clienteParaCvu, toCvuTableRow, validarAlias } from "./utils";

describe("estadoCvu", () => {
  it("traduce los estados de subcuenta", () => {
    expect(estadoCvu("Activa")).toEqual({ label: "Habilitado", tone: "success" });
    expect(estadoCvu("Pausada")).toEqual({ label: "Deshabilitado", tone: "danger" });
    expect(estadoCvu("Suspendido")).toEqual({ label: "Suspendido", tone: "warn" });
  });
  it("deja los desconocidos en neutral con su texto", () => {
    expect(estadoCvu("Otro")).toEqual({ label: "Otro", tone: "neutral" });
  });
});

describe("tipoSubcuentaClases", () => {
  it("usa violeta para Sueldos", () => {
    expect(tipoSubcuentaClases("Sueldos")).toContain("purple");
    expect(tipoSubcuentaClases("Operativa")).toContain("emerald");
  });
});

describe("toCvuTableRow", () => {
  const base = {
    id: "s1",
    legajo: "L1",
    nombre: "Ana",
    apellido: "Pérez",
    email: "ana@x.com",
    tipo: "Operativa",
    estado: "Activa",
    cbu: "0000003100012345678901",
    createdAt: null,
    cliente: {
      id: "cli-1",
      correo: "c@x.com",
      nombre: "Ana",
      cuit: "20-12345678-9",
      tipoPersona: "fisica",
      alias: null,
    },
  } as unknown as CvuRow;

  it("deriva CBK, alias y correo del cliente", () => {
    const r = toCvuTableRow(base);
    expect(r._cbk).toBe("CBK-012345678901");
    expect(r._alias).toBe("678901");
    expect(r._correo).toBe("c@x.com");
    expect(r._cuit).toBe("20-12345678-9");
    expect(r._fechaAlta).toBe("—");
  });

  it("sin CVU muestra guiones", () => {
    const r = toCvuTableRow({ ...base, cbu: null, cliente: null } as unknown as CvuRow);
    expect(r._cvu).toBeNull();
    expect(r._cbk).toBe("—");
    expect(r._correo).toBe("ana@x.com");
    expect(aliasDeCvu(null)).toBe("—");
  });
});

describe("alias del CVU", () => {
  it("usa el alias guardado en el cliente y si no, el derivado del CVU", () => {
    const cbu = "0000003100012345678901";
    expect(aliasDeFila({ cbu, cliente: null })).toBe("678901");
    expect(
      aliasDeFila({ cbu, cliente: { alias: "ana.perez" } as unknown as CvuRow["cliente"] }),
    ).toBe("ana.perez");
    expect(aliasDeFila({ cbu: null, cliente: null })).toBe("—");
  });

  it("valida largo y caracteres", () => {
    expect(validarAlias("ana.perez-1")).toBeNull();
    expect(validarAlias("corto")).toMatch(/entre 6 y 20/);
    expect(validarAlias("a".repeat(21))).toMatch(/entre 6 y 20/);
    expect(validarAlias("ana perez")).toMatch(/solo admite/);
  });
});

describe("clienteParaCvu", () => {
  const row = {
    id: "sub-1",
    legajo: "L1",
    nombre: "Ana",
    apellido: "Pérez",
    email: "ana@x.com",
    cliente: {
      id: "cli-1",
      correo: "c@x.com",
      nombre: "Ana",
      cuit: "20-12345678-9",
      tipoPersona: "juridica",
      alias: null,
    },
  } as unknown as CvuRow;

  it("manda el id del cliente, no el de la subcuenta", () => {
    expect(clienteParaCvu(row)).toEqual({
      id: "cli-1",
      legajo: "L1",
      correo: "c@x.com",
      cuit: "20123456789",
      nombre: "Ana Pérez",
      tipoPersona: "juridica",
    });
  });

  it("devuelve null si falta el cliente o el CUIT", () => {
    expect(clienteParaCvu({ ...row, cliente: null } as CvuRow)).toBeNull();
    expect(clienteParaCvu({ ...row, cliente: { ...row.cliente!, cuit: "" } } as CvuRow)).toBeNull();
  });
});
