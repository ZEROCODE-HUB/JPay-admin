import { describe, expect, it, vi } from "vitest";
import { dialogoError, esErrorDuplicado, totalPaginas } from "./listado";

describe("apis externas: listado", () => {
  it("totalPaginas devuelve al menos 1 y redondea hacia arriba", () => {
    expect(totalPaginas(0)).toBe(1);
    expect(totalPaginas(10)).toBe(1);
    expect(totalPaginas(11)).toBe(2);
    expect(totalPaginas(25, 5)).toBe(5);
  });

  it("esErrorDuplicado detecta código 23505 o mensaje de unicidad", () => {
    expect(esErrorDuplicado({ code: "23505", message: "x" })).toBe(true);
    expect(esErrorDuplicado({ code: null, message: "duplicate key value" })).toBe(true);
    expect(esErrorDuplicado({ message: "violates UNIQUE constraint" })).toBe(true);
    expect(esErrorDuplicado({ code: "42501", message: "permission denied" })).toBe(false);
  });

  it("dialogoError usa el mensaje del error salvo que se pase otro", () => {
    const cerrar = vi.fn();
    const d = dialogoError("No se pudo guardar", new Error("boom"), cerrar);
    expect(d).toMatchObject({
      title: "No se pudo guardar",
      message: "boom",
      confirmLabel: "Cerrar",
      variant: "danger",
    });
    d.onConfirm();
    expect(cerrar).toHaveBeenCalledOnce();
    expect(dialogoError("x", new Error("boom"), cerrar, "otro").message).toBe("otro");
  });
});
