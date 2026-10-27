export type ImpuestoPorCobrar = {
  id: string;
  usuario: string;
  legajo: string;
  loteId: string;
  bandera: string;
  impuesto: string;
  monto: number;
  estado: "pendiente" | "pagado";
  fechaLote: string;
  comercio: string;
};

// Vacío a propósito: eran datos de ejemplo. Pendiente de conectar a la base.
export const MOCK_IMPUESTOS_POR_COBRAR: ImpuestoPorCobrar[] = [];

export function getImpuestosPorCobrarPorLegajo(legajo: string): ImpuestoPorCobrar[] {
  return MOCK_IMPUESTOS_POR_COBRAR.filter((r) => r.legajo === legajo);
}

export type ImpuestoPorComercio = {
  comercio: string;
  legajo: string;
  pendiente: number;
  pagado: number;
  total: number;
  detalle: ImpuestoPorCobrar[];
};

export function getImpuestosPorComercio(): ImpuestoPorComercio[] {
  const map = new Map<string, ImpuestoPorComercio>();
  for (const r of MOCK_IMPUESTOS_POR_COBRAR) {
    const key = `${r.comercio}__${r.legajo}`;
    if (!map.has(key))
      map.set(key, {
        comercio: r.comercio,
        legajo: r.legajo,
        pendiente: 0,
        pagado: 0,
        total: 0,
        detalle: [],
      });
    const agg = map.get(key)!;
    agg.detalle.push(r);
    agg.total += r.monto;
    if (r.estado === "pendiente") agg.pendiente += r.monto;
    else agg.pagado += r.monto;
  }
  return Array.from(map.values());
}
