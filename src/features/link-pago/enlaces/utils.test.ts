import { describe, expect, it } from "vitest";
import { toneEnlace } from "./estados";
import { formatDateTime } from "@/shared/format";
import { accionesDisponibles, etiquetaEnlace, montoNumero, vencimientoEnlace } from "./utils";

describe("toneEnlace", () => {
  it("mapea los estados del ciclo del enlace", () => {
    expect(toneEnlace("Pagado")).toBe("success");
    expect(toneEnlace("Activado")).toBe("success");
    expect(toneEnlace("Desactivado")).toBe("neutral");
    expect(toneEnlace("Expirado")).toBe("neutral");
    expect(toneEnlace("Contracargo")).toBe("danger");
    expect(toneEnlace("Eliminado")).toBe("danger");
    expect(toneEnlace("Pendiente de aprobación")).toBe("warn");
  });
});

describe("accionesDisponibles", () => {
  it("no ofrece la transición al estado actual", () => {
    expect(accionesDisponibles("Activado")).toMatchObject({ activar: false, desactivar: true });
    expect(accionesDisponibles("Pagado").pagado).toBe(false);
  });
  it("expirados y cancelados no se expiran ni eliminan", () => {
    for (const e of ["Expirado", "Cancelado"]) {
      expect(accionesDisponibles(e)).toMatchObject({ expirar: false, eliminar: false });
    }
    expect(accionesDisponibles("Eliminado").eliminar).toBe(false);
  });
});

describe("helpers", () => {
  it("montoNumero y etiquetaEnlace", () => {
    expect(montoNumero(null)).toBeNull();
    expect(montoNumero("12.5")).toBe(12.5);
    expect(etiquetaEnlace({ url: null, id: "e1" })).toBe("e1");
    expect(etiquetaEnlace({ url: "https://x", id: "e1" })).toBe("https://x");
  });
});

describe("vencimientoEnlace", () => {
  const ahora = new Date("2026-10-27T12:00:00");

  it("muestra la fecha real y marca vencido si ya pasó", () => {
    const expira = "2026-10-26T09:30:00";
    expect(vencimientoEnlace(expira, ahora)).toEqual({
      fecha: formatDateTime(expira),
      vencido: true,
    });
  });

  it("no está vencido si la expiración es futura", () => {
    expect(vencimientoEnlace("2026-10-28T09:30:00", ahora)?.vencido).toBe(false);
  });

  it("sin fecha o fecha inválida devuelve null", () => {
    expect(vencimientoEnlace(null, ahora)).toBeNull();
    expect(vencimientoEnlace("no-es-fecha", ahora)).toBeNull();
  });
});
