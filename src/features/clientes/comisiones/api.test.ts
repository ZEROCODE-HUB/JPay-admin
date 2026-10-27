import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckCircle, XCircle } from "lucide-react";

/** Query builder falso de Supabase: registra cada llamada y resuelve con `resultado`. */
type Llamada = [metodo: string, ...args: unknown[]];
const llamadas: Llamada[] = [];
let resultado: { data: unknown; error: unknown; count: number | null } = {
  data: null,
  error: null,
  count: 0,
};

function builder(): unknown {
  return new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === "then") {
          return (ok: (v: unknown) => unknown) => Promise.resolve(resultado).then(ok);
        }
        return (...args: unknown[]) => {
          llamadas.push([prop, ...args]);
          return builder();
        };
      },
    },
  );
}

vi.mock("@/lib/supabase", () => ({
  requireSupabase: () => ({
    from: (tabla: string) => {
      llamadas.push(["from", tabla]);
      return builder();
    },
  }),
}));

const { contarOtrasComisionesHabilitadas } = await import("@/lib/api/comisiones");
const { accionesComision } = await import("./components/columns");

beforeEach(() => {
  llamadas.length = 0;
  resultado = { data: null, error: null, count: 0 };
});

describe("comisiones: una sola habilitada por alcance", () => {
  it("cuenta en el servidor las otras habilitadas del mismo cliente, tipo y CVU", async () => {
    resultado = { data: null, error: null, count: 1 };
    const n = await contarOtrasComisionesHabilitadas({
      clienteId: "cl1",
      tipo: "Retiro",
      subcuentaId: "s1",
      excluirId: "c9",
    });
    expect(n).toBe(1);
    expect(llamadas).toEqual([
      ["from", "comisiones_cliente"],
      ["select", "id", { count: "exact", head: true }],
      ["eq", "cliente_id", "cl1"],
      ["eq", "tipo", "Retiro"],
      ["eq", "estado", "Habilitado"],
      ["eq", "subcuenta_id", "s1"],
      ["neq", "id", "c9"],
    ]);
  });

  it("sin CVU busca las de toda la cuenta (subcuenta null) y sin excluir en el alta", async () => {
    const n = await contarOtrasComisionesHabilitadas({
      clienteId: "cl1",
      tipo: "Depósito",
      subcuentaId: null,
    });
    expect(n).toBe(0);
    expect(llamadas).toContainEqual(["is", "subcuenta_id", null]);
    expect(llamadas.some(([m]) => m === "neq")).toBe(false);
  });

  it("propaga el error de la consulta", async () => {
    resultado = { data: null, error: { message: "boom" }, count: null };
    await expect(
      contarOtrasComisionesHabilitadas({ clienteId: "cl1", tipo: "Retiro", subcuentaId: null }),
    ).rejects.toThrow();
  });
});

describe("comisiones: íconos de habilitar / deshabilitar", () => {
  const s = {
    puedeModificar: true,
    setViewing: vi.fn(),
    abrirEdicion: vi.fn(),
    pedirCambioEstado: vi.fn(),
  } as unknown as Parameters<typeof accionesComision>[0];
  const row = (estado: "Habilitado" | "Deshabilitado") =>
    ({ id: "c1", estado }) as Parameters<typeof accionesComision>[1];

  it("Habilitar usa CheckCircle y Deshabilitar XCircle", () => {
    expect(accionesComision(s, row("Deshabilitado"))[2]).toMatchObject({
      label: "Habilitar",
      icon: CheckCircle,
    });
    expect(accionesComision(s, row("Habilitado"))[2]).toMatchObject({
      label: "Deshabilitar",
      icon: XCircle,
    });
  });
});
