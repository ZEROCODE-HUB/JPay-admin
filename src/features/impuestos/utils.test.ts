import { describe, expect, it, vi } from "vitest";
import { formatMoney, formatPercent } from "@/shared/format";
import {
  ambitoTone,
  contarPaginas,
  dialogoError,
  estadoActivoTone,
  fechaLocalISO,
  formatMontoImpuesto,
} from "./utils";

describe("impuestos: utils comunes", () => {
  it("estado y ámbito → tono", () => {
    expect(estadoActivoTone("Activo")).toBe("success");
    expect(estadoActivoTone("Inactivo")).toBe("neutral");
    expect(ambitoTone("Interno")).toBe("success");
    expect(ambitoTone("Externo")).toBe("neutral");
    expect(ambitoTone(null)).toBe("neutral");
  });

  it("formatMontoImpuesto usa % para Porcentaje y $ para el resto", () => {
    expect(formatMontoImpuesto("Porcentaje", 3.5)).toBe(formatPercent(3.5));
    expect(formatMontoImpuesto("Fijo", 0.6)).toBe(formatMoney(0.6));
    expect(formatMontoImpuesto("Otro", 10)).toBe(formatMoney(10));
    expect(formatMontoImpuesto("Porcentaje", null)).toBe("—");
  });

  it("contarPaginas nunca baja de 1", () => {
    expect(contarPaginas(0, 10)).toBe(1);
    expect(contarPaginas(10, 10)).toBe(1);
    expect(contarPaginas(11, 10)).toBe(2);
  });

  it("fechaLocalISO usa la fecha local, no la UTC", () => {
    expect(fechaLocalISO(new Date(2026, 9, 27, 23, 59))).toBe("2026-10-27");
    expect(fechaLocalISO(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });

  it("dialogoError arma un diálogo danger que cierra", () => {
    const cerrar = vi.fn();
    const d = dialogoError("No se pudo", "falló", cerrar);
    expect(d).toMatchObject({
      title: "No se pudo",
      message: "falló",
      confirmLabel: "Cerrar",
      variant: "danger",
    });
    d.onConfirm();
    expect(cerrar).toHaveBeenCalled();
  });
});
