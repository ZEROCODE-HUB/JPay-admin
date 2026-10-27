import type {
  AlertRule,
  AlertRuleCode,
  AlertRuleParameters,
  MinorsPolicy,
  ScheduleDay,
} from "@/lib/api/alert-rules";
import { CODES, GROUPS } from "./config";

/** Estado editable: numeros como texto para no perder lo que se esta tipeando. */
export type Draft = Record<
  string,
  {
    isEnabled: boolean;
    values: Record<string, string>;
    policy?: MinorsPolicy;
    days?: ScheduleDay[];
  }
>;

export function toDraft(rules: AlertRule[]): Draft {
  const d: Draft = {};
  for (const r of rules) {
    if (!CODES.includes(r.code)) continue;
    const values: Record<string, string> = {};
    for (const [k, v] of Object.entries(r.parameters))
      if (typeof v === "number") values[k] = String(v);
    d[r.code] = {
      isEnabled: r.isEnabled,
      values,
      policy: (r.parameters.policy as MinorsPolicy | undefined) ?? undefined,
      days: Array.isArray(r.parameters.days)
        ? (r.parameters.days as ScheduleDay[]).map((x) => ({ ...x }))
        : undefined,
    };
  }
  return d;
}

/** Valida y arma los parametros a guardar; devuelve errores por campo. */
export function construir(draft: Draft): {
  rules: { code: AlertRuleCode; isEnabled: boolean; parameters: AlertRuleParameters }[];
  errores: Record<string, string>;
} {
  const errores: Record<string, string> = {};
  const rules: { code: AlertRuleCode; isEnabled: boolean; parameters: AlertRuleParameters }[] = [];
  for (const g of GROUPS) {
    for (const rv of g.rules) {
      const d = draft[rv.code];
      if (!d) continue;
      const parameters: AlertRuleParameters = {};
      for (const f of rv.numbers ?? []) {
        const raw = (d.values[f.key] ?? "").trim();
        const n = Number(raw);
        const id = `${rv.code}.${f.key}`;
        if (raw === "" || !Number.isFinite(n)) errores[id] = "Ingresá un número";
        else if (n < 0) errores[id] = "No puede ser negativo";
        else if (f.integer && !Number.isInteger(n)) errores[id] = "Debe ser un número entero";
        else parameters[f.key] = n;
      }
      if (
        rv.code === "abnormal_volume" &&
        typeof parameters.min_amount === "number" &&
        typeof parameters.max_amount === "number" &&
        parameters.min_amount > parameters.max_amount
      ) {
        errores["abnormal_volume.min_amount"] = "El mínimo no puede superar al máximo";
      }
      if (rv.code === "withdrawal_failed_attempts" && parameters.window_seconds === 0) {
        errores["withdrawal_failed_attempts.window_seconds"] = "Debe ser mayor a 0";
      }
      if (rv.code === "repeated_transfers" && parameters.window_minutes === 0) {
        errores["repeated_transfers.window_minutes"] = "Debe ser mayor a 0";
      }
      if (rv.code === "company_account_affinity" && parameters.window_days === 0) {
        errores["company_account_affinity.window_days"] = "Debe ser mayor a 0";
      }
      if (
        rv.code === "plaft_screening" &&
        typeof parameters.threshold === "number" &&
        parameters.threshold > 100
      ) {
        errores["plaft_screening.threshold"] = "Va de 0 a 100";
      }
      if (rv.code === "minors_transfer_policy") parameters.policy = d.policy ?? "block";
      if (rv.code === "unusual_hours") {
        parameters.days = d.days ?? [];
        (d.days ?? []).forEach((day) => {
          if (day.enabled && day.start >= day.end)
            errores[`unusual_hours.day${day.day}`] = "El inicio debe ser anterior al fin";
        });
      }
      rules.push({ code: rv.code, isEnabled: d.isEnabled, parameters });
    }
  }
  return { rules, errores };
}
