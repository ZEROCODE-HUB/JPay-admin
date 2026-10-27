import { useQuery } from "@tanstack/react-query";
import { listAlertRules } from "@/lib/api/alert-rules";

/** Clave de react-query de la configuración de reglas (compartida por alertas y bloqueos). */
export const ALERT_RULES_KEY = ["alert_rules"] as const;

/** Reglas de alerta/bloqueo configuradas en la base (`alert_rules`). */
export function useAlertRules() {
  return useQuery({ queryKey: ALERT_RULES_KEY, queryFn: listAlertRules });
}
