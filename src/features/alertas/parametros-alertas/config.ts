import type { AlertRuleCode, MinorsPolicy } from "@/lib/api/alert-rules";

export const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export type NumberField = { key: string; label: string; integer?: boolean };

/**
 * Presentacion de cada regla: titulo del grupo, etiqueta del switch y campos.
 * Los VALORES salen de la base (alert_rules); aca solo vive como se muestran.
 */
export type RuleView = { code: AlertRuleCode; switchLabel: string; numbers?: NumberField[] };
export type GroupView = { title: string; rules: RuleView[]; full?: boolean };

export const GROUPS: GroupView[] = [
  {
    title: "Límite de depósitos excedidos",
    rules: [
      {
        code: "deposit_company_max",
        switchLabel: "Depósito por empresa",
        numbers: [{ key: "max_amount", label: "Depósito por empresa (monto máx.)" }],
      },
      {
        code: "deposit_min_wages",
        switchLabel: "Límite de depósito excedido",
        numbers: [
          { key: "min_wages_count", label: "Salario mínimo (cantidad)", integer: true },
          {
            key: "min_wage_deposits_per_transfer",
            label: "Depósitos de salario mínimo por transferencia",
            integer: true,
          },
        ],
      },
    ],
  },
  {
    title: "Límite de depósito mensual",
    rules: [
      {
        code: "deposit_monthly_limit",
        switchLabel: "Límite de depósito mensual",
        numbers: [
          { key: "monthly_amount", label: "Monto del límite de depósito mensual" },
          { key: "same_origin_monthly_amount", label: "Depósito de un mismo origen por mes" },
        ],
      },
    ],
  },
  {
    title: "Máximo de intentos fallidos por retiro",
    rules: [
      {
        code: "withdrawal_failed_attempts",
        switchLabel: "Control de intentos fallidos",
        numbers: [
          { key: "max_attempts", label: "Intentos fallidos permitidos", integer: true },
          {
            key: "window_seconds",
            label: "Tiempo de evaluación de retiros fallidos (segundos)",
            integer: true,
          },
        ],
      },
    ],
  },
  {
    title: "Transferencias repetidas",
    rules: [
      {
        code: "repeated_transfers",
        switchLabel: "Operaciones repetitivas",
        numbers: [
          {
            key: "threshold",
            label: "Umbral de operaciones repetidas (mismo destino)",
            integer: true,
          },
          { key: "window_minutes", label: "Ventana de evaluación (minutos)", integer: true },
        ],
      },
    ],
  },
  {
    title: "Transferencias por hora",
    rules: [
      {
        code: "transfers_per_hour",
        switchLabel: "Límite de transferencias por hora",
        numbers: [
          { key: "max_per_hour", label: "Transferencias por hora (máximo)", integer: true },
        ],
      },
    ],
  },
  {
    title: "Afinidad entre cuentas (solo transferencias entre cuentas empresa)",
    rules: [
      {
        code: "company_account_affinity",
        switchLabel: "Afinidad entre cuentas",
        numbers: [
          { key: "threshold", label: "Afinidad entre cuentas (umbral)", integer: true },
          { key: "window_days", label: "Ventana de evaluación (días)", integer: true },
        ],
      },
    ],
  },
  {
    title: "Volumen anormal de operación",
    rules: [
      {
        code: "abnormal_volume",
        switchLabel: "Alerta de volumen habilitada",
        numbers: [
          { key: "min_amount", label: "Monto mínimo por operación" },
          { key: "max_amount", label: "Monto máximo por operación" },
        ],
      },
    ],
  },
  {
    title: "Política de transferencia a menores",
    rules: [{ code: "minors_transfer_policy", switchLabel: "Transferencia a menor" }],
  },
  {
    title: "Screening PLAFT (REPET)",
    rules: [
      {
        code: "plaft_screening",
        switchLabel: "Alertar coincidencias del screening",
        numbers: [{ key: "threshold", label: "Similitud mínima para alertar (%)" }],
      },
    ],
  },
  {
    title: "Movimiento en horario inusual",
    full: true,
    rules: [{ code: "unusual_hours", switchLabel: "Regla de horario inusual habilitada" }],
  },
];

export const POLITICAS: { value: MinorsPolicy; label: string }[] = [
  { value: "allow", label: "Permitir" },
  { value: "alert", label: "Alertar" },
  { value: "block", label: "Bloquear" },
];

export const CODES = GROUPS.flatMap((g) => g.rules.map((r) => r.code));
