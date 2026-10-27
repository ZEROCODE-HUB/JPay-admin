import { describe, expect, it } from "vitest";
import { estadoMetodoTone } from "./estados";
import { agregarCuota, cuotasAForm } from "./utils";

describe("metodos de pago", () => {
  it("cuotasAForm pasa los valores a texto con keys 1..n", () => {
    expect(
      cuotasAForm([
        { cuotas: 1, ten: 0, coeficiente: 1 },
        { cuotas: 3, ten: 12.5, coeficiente: 1.07 },
      ]),
    ).toEqual([
      { key: 1, numero: "1", ten: "0", coeficiente: "1" },
      { key: 2, numero: "3", ten: "12.5", coeficiente: "1.07" },
    ]);
  });

  it("agregarCuota numera la nueva como la siguiente", () => {
    const prev = cuotasAForm([{ cuotas: 1, ten: 0, coeficiente: 1 }]);
    expect(agregarCuota(prev, 9)).toEqual([
      ...prev,
      { key: 9, numero: "2", ten: "0", coeficiente: "1" },
    ]);
  });

  it("tono del estado", () => {
    expect(estadoMetodoTone("Activo")).toBe("success");
    expect(estadoMetodoTone("Inactivo")).toBe("neutral");
  });
});
