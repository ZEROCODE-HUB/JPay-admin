import { describe, expect, it } from "vitest";
import { formatMoney, formatPercent } from "@/shared/format";
import type { ComisionCliente } from "@/lib/api/types";
import {
  codigoOperacionNuevo,
  comisionDesdeApi,
  configLabel,
  desgloseDe,
  draftDesdeComision,
  draftVacio,
} from "./utils";

function api(over: Partial<ComisionCliente> = {}): ComisionCliente {
  return {
    id: "c1",
    clienteId: "cl1",
    subcuentaId: null,
    subcuenta: null,
    operacion: "DEP-CTA-1",
    tipo: "Depósito",
    modalidad: "Porcentaje",
    porcentaje: 1,
    montoFijo: null,
    porcentajeImpuesto: 21,
    estado: "Habilitado",
    descripcion: null,
    createdAt: "",
    updatedAt: "",
    cliente: null,
    ...over,
  };
}

describe("carga de comisiones: utils", () => {
  it("mapea la fila de la API con '—' si falta el cliente", () => {
    const c = comisionDesdeApi(api({ subcuentaId: "s1", subcuenta: { cbu: "000", nombre: null } }));
    expect(c).toMatchObject({
      legajo: "—",
      correo: "—",
      tipoPersona: "fisica",
      descripcion: "",
      cvu: "000",
    });
  });

  it("borradores: vacío y desde una comisión (legajo '—' → '')", () => {
    expect(draftVacio()).toMatchObject({ tipo: "Depósito", porcentaje: 1, porcentajeImpuesto: 21 });
    const d = draftDesdeComision(comisionDesdeApi(api()));
    expect(d.id).toBe("c1");
    expect(d.legajo).toBe("");
  });

  it("desglose: 1 % + 21 % de IVA sobre 100.000", () => {
    const d = desgloseDe(draftVacio());
    expect(d.comision).toBeCloseTo(1000);
    expect(d.impuesto).toBeCloseTo(210);
    expect(d.total).toBeCloseTo(1210);
  });

  it("configLabel según modalidad", () => {
    expect(configLabel({ modalidad: "Fijo", montoFijo: 100, porcentaje: null })).toBe(
      formatMoney(100),
    );
    expect(configLabel({ modalidad: "Porcentaje", montoFijo: null, porcentaje: null })).toBe(
      formatPercent(0),
    );
  });

  it("código de operación nuevo", () => {
    expect(codigoOperacionNuevo({ tipo: "Retiro", subcuentaId: "s" }, 5)).toBe("RET-CVU-5");
    expect(codigoOperacionNuevo({ tipo: "Conversión", subcuentaId: null }, 6)).toBe("CNV-CTA-6");
    expect(codigoOperacionNuevo({ tipo: "Depósito", subcuentaId: null }, 7)).toBe("DEP-CTA-7");
  });
});
