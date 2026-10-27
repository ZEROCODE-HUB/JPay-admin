import { describe, expect, it } from "vitest";
import type { AlertRule } from "@/lib/api/alert-rules";
import { construir, toDraft, type Draft } from "./utils";

describe("toDraft", () => {
  it("pasa números a texto, ignora códigos desconocidos y copia los días", () => {
    const rules = [
      { code: "transfers_per_hour", isEnabled: true, parameters: { max_per_hour: 5 } },
      { code: "desconocida", isEnabled: true, parameters: {} },
      {
        code: "unusual_hours",
        isEnabled: false,
        parameters: { days: [{ day: 1, enabled: true, start: "22:00", end: "23:00" }] },
      },
    ] as unknown as AlertRule[];
    const d = toDraft(rules);
    expect(Object.keys(d)).toEqual(["transfers_per_hour", "unusual_hours"]);
    expect(d.transfers_per_hour.values).toEqual({ max_per_hour: "5" });
    expect(d.unusual_hours.days?.[0].start).toBe("22:00");
  });
});

describe("construir", () => {
  it("valida números, enteros y rangos", () => {
    const draft: Draft = {
      transfers_per_hour: { isEnabled: true, values: { max_per_hour: "1.5" } },
      abnormal_volume: { isEnabled: true, values: { min_amount: "10", max_amount: "5" } },
      plaft_screening: { isEnabled: true, values: { threshold: "150" } },
      deposit_company_max: { isEnabled: true, values: { max_amount: "" } },
    };
    const { errores } = construir(draft);
    expect(errores["transfers_per_hour.max_per_hour"]).toBe("Debe ser un número entero");
    expect(errores["abnormal_volume.min_amount"]).toBe("El mínimo no puede superar al máximo");
    expect(errores["plaft_screening.threshold"]).toBe("Va de 0 a 100");
    expect(errores["deposit_company_max.max_amount"]).toBe("Ingresá un número");
  });

  it("arma los parámetros válidos y la política por defecto", () => {
    const draft: Draft = {
      transfers_per_hour: { isEnabled: false, values: { max_per_hour: "3" } },
      minors_transfer_policy: { isEnabled: true, values: {} },
      unusual_hours: {
        isEnabled: true,
        values: {},
        days: [{ day: 2, enabled: true, start: "10:00", end: "09:00" }],
      },
    } as Draft;
    const { rules, errores } = construir(draft);
    expect(rules.find((r) => r.code === "transfers_per_hour")).toEqual({
      code: "transfers_per_hour",
      isEnabled: false,
      parameters: { max_per_hour: 3 },
    });
    expect(rules.find((r) => r.code === "minors_transfer_policy")?.parameters.policy).toBe("block");
    expect(errores["unusual_hours.day2"]).toBe("El inicio debe ser anterior al fin");
  });
});
