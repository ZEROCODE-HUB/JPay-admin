import { describe, expect, it } from "vitest";
import { brand } from "@/brand/brand";
import { accionesDisponibles, qrValue, totalPaginas } from "./utils";
import { estadoQrTone } from "./estados";

describe("accionesDisponibles", () => {
  it("ofrece todas las transiciones menos la del estado actual, en orden", () => {
    expect(accionesDisponibles("Activado")).toEqual([
      "Desactivar",
      "Rechazar",
      "Suspender",
      "Pendiente",
      "Eliminar",
    ]);
    expect(accionesDisponibles("Eliminado")).toEqual([
      "Activar",
      "Desactivar",
      "Rechazar",
      "Suspender",
      "Pendiente",
    ]);
  });

  it("trata 'Pendiente de aprobación' con y sin tilde como pendiente", () => {
    const esperado = ["Activar", "Desactivar", "Rechazar", "Suspender", "Eliminar"];
    expect(accionesDisponibles("Pendiente de aprobación")).toEqual(esperado);
    expect(accionesDisponibles("Pendiente de aprobacion")).toEqual(esperado);
  });
});

describe("qrValue", () => {
  it("usa la URL guardada si existe", () => {
    expect(qrValue({ id: "abc", qrUrl: "https://x/qr" })).toBe("https://x/qr");
  });

  it("arma la URL pública del punto de venta si no hay URL", () => {
    expect(qrValue({ id: "abc", qrUrl: null })).toBe(`${brand.web.website}/qr/pdv/abc`);
    expect(qrValue({ id: "abc", qrUrl: "" })).toBe(`${brand.web.website}/qr/pdv/abc`);
  });
});

describe("totalPaginas", () => {
  it("redondea hacia arriba con mínimo 1", () => {
    expect(totalPaginas(0, 10)).toBe(1);
    expect(totalPaginas(10, 10)).toBe(1);
    expect(totalPaginas(11, 10)).toBe(2);
  });
});

describe("estadoQrTone", () => {
  it("mapea cada estado a su tono", () => {
    expect(estadoQrTone("Activado")).toBe("success");
    expect(estadoQrTone("Rechazado")).toBe("danger");
    expect(estadoQrTone("Eliminado")).toBe("danger");
    expect(estadoQrTone("Suspendido")).toBe("danger");
    expect(estadoQrTone("Desactivado")).toBe("neutral");
    expect(estadoQrTone("Pendiente de aprobación")).toBe("warn");
  });
});
