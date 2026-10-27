/** Parámetros por defecto de alertas y bloqueos de riesgo (usados al crear subcuentas). */
export type ParametroAlerta = { label: string; valor: string };
export type ParametroBloqueo = { label: string; valor: string };

export const DEFAULT_PARAMS_ALERTAS: ParametroAlerta[] = [
  { label: "Depósitos por mes", valor: "10" },
  { label: "Depósitos salario mínimo por transferencia", valor: "5" },
  { label: "Transferencias por hora", valor: "10" },
  { label: "Operaciones repetitivas", valor: "5" },
  { label: "Volumen anormal", valor: "$ 1.000.000 – $ 5.000.000" },
  { label: "Política a menores", valor: "Bloquear" },
];

export const DEFAULT_PARAMS_BLOQUEO: ParametroBloqueo[] = [
  { label: "Salarios mínimos por persona", valor: "15" },
  { label: "Salarios mínimos por empresa", valor: "50" },
];
