import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export type Salud = "ok" | "warning" | "error";

export const saludMeta: Record<
  Salud,
  { label: string; tone: "success" | "warn" | "danger"; icon: typeof CheckCircle2 }
> = {
  ok: { label: "Funcionando correctamente", tone: "success", icon: CheckCircle2 },
  warning: { label: "Ejecución reciente con demoras", tone: "warn", icon: AlertTriangle },
  error: { label: "Última ejecución fallida", tone: "danger", icon: XCircle },
};

/** Clases del ícono de salud de cada tarjeta. */
export function saludIconClass(salud: Salud): string {
  return salud === "ok"
    ? "text-emerald-500 shrink-0"
    : salud === "warning"
      ? "text-amber-500 shrink-0"
      : "text-danger-500 shrink-0";
}
