import { beforeEach, describe, expect, it, vi } from "vitest";

/** Query builder falso de Supabase: registra cada llamada y resuelve con `resultado`. */
type Llamada = [metodo: string, ...args: unknown[]];
const consultas: Llamada[][] = [];
let resultado: { data: unknown; error: unknown; count: number | null } = {
  data: [],
  error: null,
  count: 0,
};

function builder(llamadas: Llamada[]): unknown {
  return new Proxy(
    {},
    {
      get(_t, prop: string) {
        if (prop === "then") {
          return (ok: (v: unknown) => unknown) => Promise.resolve(resultado).then(ok);
        }
        return (...args: unknown[]) => {
          llamadas.push([prop, ...args]);
          return builder(llamadas);
        };
      },
    },
  );
}

vi.mock("@/lib/supabase", () => ({
  requireSupabase: () => ({
    from: (tabla: string) => {
      const llamadas: Llamada[] = [["from", tabla]];
      consultas.push(llamadas);
      return builder(llamadas);
    },
  }),
}));

const {
  listImpuestos,
  countImpuestosPorAmbito,
  listImpuestosAsignaciones,
  updateImpuestoAsignacion,
} = await import("@/lib/api/impuestos");

const llamadasA = (metodo: string, i = 0) => consultas[i].filter(([m]) => m === metodo);

beforeEach(() => {
  consultas.length = 0;
  resultado = { data: [], error: null, count: 0 };
});

describe("lib/api/impuestos", () => {
  it("listImpuestos filtra el ámbito en el servidor", async () => {
    await listImpuestos({ page: 1, pageSize: 10, ambito: "Interno" });
    expect(llamadasA("eq")).toContainEqual(["eq", "ambito", "Interno"]);
    expect(llamadasA("range")).toEqual([["range", 10, 19]]);
  });

  it("countImpuestosPorAmbito hace un count head por ámbito con los mismos filtros", async () => {
    resultado = { data: null, error: null, count: 7 };
    const conteo = await countImpuestosPorAmbito({ estado: "Activo" });
    expect(conteo).toEqual({ externos: 7, internos: 7 });
    expect(consultas).toHaveLength(2);
    for (const [i, ambito] of [
      [0, "Externo"],
      [1, "Interno"],
    ] as const) {
      expect(llamadasA("select", i)).toEqual([["select", "id", { count: "exact", head: true }]]);
      expect(llamadasA("eq", i)).toEqual([
        ["eq", "estado", "Activo"],
        ["eq", "ambito", ambito],
      ]);
    }
  });

  it("listImpuestosAsignaciones aplica desde/hasta sobre fecha_asignacion", async () => {
    await listImpuestosAsignaciones({
      page: 0,
      pageSize: 10,
      fecha_desde: "2026-10-01",
      fecha_hasta: "2026-10-27",
    });
    expect(llamadasA("gte")).toEqual([["gte", "fecha_asignacion", "2026-10-01"]]);
    expect(llamadasA("lte")).toEqual([["lte", "fecha_asignacion", "2026-10-27"]]);
  });

  it("listImpuestosAsignaciones sin fechas no filtra por fecha", async () => {
    await listImpuestosAsignaciones({ page: 0, pageSize: 10 });
    expect(llamadasA("gte")).toEqual([]);
    expect(llamadasA("lte")).toEqual([]);
  });

  it("updateImpuestoAsignacion guarda el cambio de impuesto", async () => {
    resultado = { data: null, error: { message: "sin filas" }, count: null };
    await expect(
      updateImpuestoAsignacion("a1", { impuesto_id: "imp-2", monto: 3 }),
    ).rejects.toThrow();
    expect(llamadasA("update")).toEqual([["update", { impuesto_id: "imp-2", monto: 3 }]]);
  });
});
