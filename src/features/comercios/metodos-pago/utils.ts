import type { BanderaCuota } from "@/lib/api/banderas";

export const TIPOS_METODO = [
  "Tarjeta de crédito",
  "Tarjeta de débito",
  "Tarjeta prepago",
  "Pago Fácil",
  "Rapipago",
];

/**
 * Fila editable de la tabla de cuotas del modal (los valores se editan como texto).
 * `id` es el de `banderas_cuotas` (ausente en las cuotas nuevas); `key` es solo para React.
 */
export type CuotaForm = {
  key: string;
  id?: string;
  numero: string;
  ten: string;
  coeficiente: string;
};

/** Datos que devuelve el modal de alta/edición de método de pago. */
export type MetodoPagoForm = {
  id?: string;
  nombre: string;
  tipo: string;
  diasHabiles: number;
  estado: string;
  cuotas: CuotaForm[];
};

/** Convierte las cuotas guardadas a filas editables (key = id de la cuota). */
export function cuotasAForm(
  cq: Pick<BanderaCuota, "id" | "cuotas" | "ten" | "coeficiente">[],
): CuotaForm[] {
  return cq.map((c) => ({
    key: c.id,
    id: c.id,
    numero: String(c.cuotas),
    ten: String(c.ten),
    coeficiente: String(c.coeficiente),
  }));
}

/** Agrega una cuota vacía al final, numerada como la siguiente. `key` debe ser único. */
export function agregarCuota(prev: CuotaForm[], key: string): CuotaForm[] {
  return [...prev, { key, numero: String(prev.length + 1), ten: "0", coeficiente: "1" }];
}

type CuotaValores = { cuotas: number; ten: number; coeficiente: number };

/** Cambios a aplicar en `banderas_cuotas` para que queden como en el formulario. */
export type PlanCuotas = {
  crear: CuotaValores[];
  actualizar: (CuotaValores & { id: string })[];
  eliminar: string[];
};

function parseNumero(v: string): number {
  return Number(v.trim().replace(",", "."));
}

/**
 * Compara las cuotas guardadas con las del formulario y devuelve qué crear, actualizar
 * (solo las que cambiaron) y eliminar. Lanza un Error si algún valor no es válido.
 */
export function planificarCuotas(
  originales: Pick<BanderaCuota, "id" | "cuotas" | "ten" | "coeficiente">[],
  form: CuotaForm[],
): PlanCuotas {
  const plan: PlanCuotas = { crear: [], actualizar: [], eliminar: [] };
  const porId = new Map(originales.map((o) => [o.id, o]));
  const vistos = new Set<string>();
  const numeros = new Set<number>();

  for (const c of form) {
    const valores = {
      cuotas: parseNumero(c.numero),
      ten: parseNumero(c.ten),
      coeficiente: parseNumero(c.coeficiente),
    };
    if (!Number.isInteger(valores.cuotas) || valores.cuotas < 1) {
      throw new Error(`N° de cuota inválido: "${c.numero}"`);
    }
    if (!Number.isFinite(valores.ten) || !Number.isFinite(valores.coeficiente)) {
      throw new Error(`Valores inválidos en la cuota ${valores.cuotas}`);
    }
    if (numeros.has(valores.cuotas)) {
      throw new Error(`La cuota ${valores.cuotas} está repetida`);
    }
    numeros.add(valores.cuotas);

    const original = c.id ? porId.get(c.id) : undefined;
    if (!original) {
      plan.crear.push(valores);
      continue;
    }
    vistos.add(original.id);
    if (
      original.cuotas !== valores.cuotas ||
      original.ten !== valores.ten ||
      original.coeficiente !== valores.coeficiente
    ) {
      plan.actualizar.push({ id: original.id, ...valores });
    }
  }

  plan.eliminar = originales.filter((o) => !vistos.has(o.id)).map((o) => o.id);
  return plan;
}
