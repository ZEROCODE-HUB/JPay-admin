import type { BanderaCuota } from "@/lib/api/banderas";

export const TIPOS_METODO = [
  "Tarjeta de crédito",
  "Tarjeta de débito",
  "Tarjeta prepago",
  "Pago Fácil",
  "Rapipago",
];

/** Fila editable de la tabla de cuotas del modal (los valores se editan como texto). */
export type CuotaForm = { key: number; numero: string; ten: string; coeficiente: string };

/** Datos que devuelve el modal de alta/edición de método de pago. */
export type MetodoPagoForm = {
  id?: string;
  nombre: string;
  tipo: string;
  diasHabiles: number;
  estado: string;
  cuotas: CuotaForm[];
};

/** Convierte las cuotas guardadas a filas editables, con keys 1..n. */
export function cuotasAForm(
  cq: Pick<BanderaCuota, "cuotas" | "ten" | "coeficiente">[],
): CuotaForm[] {
  return cq.map((c, i) => ({
    key: i + 1,
    numero: String(c.cuotas),
    ten: String(c.ten),
    coeficiente: String(c.coeficiente),
  }));
}

/** Agrega una cuota vacía al final, numerada como la siguiente. */
export function agregarCuota(prev: CuotaForm[], key: number): CuotaForm[] {
  return [...prev, { key, numero: String(prev.length + 1), ten: "0", coeficiente: "1" }];
}
