import { describe, expect, it } from "vitest";
import type { CvuRow } from "@/lib/api/subcuentas";
import { estadoCvu, tipoSubcuentaClases } from "./estados";
import { aliasDeCvu, toCvuTableRow } from "./utils";

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
    cliente: { correo: "c@x.com", nombre: "Ana", cuit: "20123456789", tipoPersona: "fisica" },
  } as unknown as CvuRow;

  it("deriva CBK, alias y correo del cliente", () => {
    const r = toCvuTableRow(base);
    expect(r._cbk).toBe("CBK-012345678901");
    expect(r._alias).toBe("678901");
    expect(r._correo).toBe("c@x.com");
    expect(r._cuit).toBe("20123456789");
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
