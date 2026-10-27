import type { EstadoCalendario } from "@/lib/api/calendario-acreditaciones";

export type ColorEstado = { bg: string; text: string; label: string; border: string };

export const ESTADO_COLORS: Record<EstadoCalendario, ColorEstado> = {
  programado: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    label: "Programado",
  },
  pendiente: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    label: "Pendiente",
  },
  acreditado: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
    label: "Acreditado",
  },
  contracargo: {
    bg: "bg-danger-100",
    text: "text-danger-700",
    border: "border-danger-300",
    label: "Contracargo",
  },
  cancelado: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    label: "Cancelado",
  },
};

/** Color del estado; si llega uno desconocido se muestra como pendiente. */
export function colorEstado(e: EstadoCalendario): ColorEstado {
  return ESTADO_COLORS[e] ?? ESTADO_COLORS.pendiente;
}

/** Estados que ofrece el filtro (Cancelado no se lista). */
export const ESTADOS_FILTRO: { value: EstadoCalendario; label: string }[] = [
  { value: "programado", label: "Programado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "acreditado", label: "Acreditado" },
  { value: "contracargo", label: "Contracargo" },
];

export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Estados de adelanto que ya no comprometen el lote. */
const ADELANTO_CERRADO = new Set(["Acreditado", "Rechazado", "Cancelado"]);

export function adelantoCerrado(estado: string): boolean {
  return ADELANTO_CERRADO.has(estado);
}
