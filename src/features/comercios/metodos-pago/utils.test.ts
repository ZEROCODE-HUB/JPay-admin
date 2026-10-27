import { describe, expect, it } from "vitest";
import { estadoMetodoTone } from "./estados";
import { agregarCuota, cuotasAForm, planificarCuotas } from "./utils";

describe("metodos de pago", () => {
  it("cuotasAForm pasa los valores a texto y usa el id como key", () => {
    expect(
      cuotasAForm([
        { id: "a", cuotas: 1, ten: 0, coeficiente: 1 },
        { id: "b", cuotas: 3, ten: 12.5, coeficiente: 1.07 },
      ]),
    ).toEqual([
      { key: "a", id: "a", numero: "1", ten: "0", coeficiente: "1" },
      { key: "b", id: "b", numero: "3", ten: "12.5", coeficiente: "1.07" },
    ]);
  });

  it("agregarCuota numera la nueva como la siguiente, sin id", () => {
    const prev = cuotasAForm([{ id: "a", cuotas: 1, ten: 0, coeficiente: 1 }]);
    expect(agregarCuota(prev, "nueva")).toEqual([
      ...prev,
      { key: "nueva", numero: "2", ten: "0", coeficiente: "1" },
    ]);
  });

  it("las keys de cuotas nuevas no repiten las de las cargadas", () => {
    let cuotas = cuotasAForm([
      { id: "a", cuotas: 1, ten: 0, coeficiente: 1 },
      { id: "b", cuotas: 3, ten: 0, coeficiente: 1 },
    ]);
    cuotas = agregarCuota(cuotas, crypto.randomUUID());
    cuotas = agregarCuota(cuotas, crypto.randomUUID());
    expect(new Set(cuotas.map((c) => c.key)).size).toBe(4);
  });

  describe("planificarCuotas", () => {
    const originales = [
      { id: "a", cuotas: 1, ten: 0, coeficiente: 1 },
      { id: "b", cuotas: 3, ten: 10, coeficiente: 1.05 },
      { id: "c", cuotas: 6, ten: 20, coeficiente: 1.1 },
    ];

    it("sin cambios no hace nada", () => {
      expect(planificarCuotas(originales, cuotasAForm(originales))).toEqual({
        crear: [],
        actualizar: [],
        eliminar: [],
      });
    });

    it("crea las nuevas, actualiza las editadas y elimina las quitadas", () => {
      const form = cuotasAForm(originales)
        .filter((c) => c.id !== "c")
        .map((c) => (c.id === "b" ? { ...c, ten: "12,5", coeficiente: "1.07" } : c));
      const conNueva = agregarCuota(form, "k1").map((c) =>
        c.key === "k1" ? { ...c, numero: "12", ten: "30", coeficiente: "1.2" } : c,
      );
      expect(planificarCuotas(originales, conNueva)).toEqual({
        crear: [{ cuotas: 12, ten: 30, coeficiente: 1.2 }],
        actualizar: [{ id: "b", cuotas: 3, ten: 12.5, coeficiente: 1.07 }],
        eliminar: ["c"],
      });
    });

    it("rechaza números inválidos o repetidos", () => {
      const base = cuotasAForm(originales);
      expect(() => planificarCuotas(originales, agregarCuota(base, "x"))).not.toThrow();
      expect(() => planificarCuotas(originales, [{ ...base[0], numero: "abc" }])).toThrow(
        /inválido/,
      );
      expect(() => planificarCuotas(originales, [base[0], { ...base[1], numero: "1" }])).toThrow(
        /repetida/,
      );
      expect(() => planificarCuotas(originales, [{ ...base[0], ten: "x" }])).toThrow();
    });
  });

  it("tono del estado", () => {
    expect(estadoMetodoTone("Activo")).toBe("success");
    expect(estadoMetodoTone("Inactivo")).toBe("neutral");
  });
});
