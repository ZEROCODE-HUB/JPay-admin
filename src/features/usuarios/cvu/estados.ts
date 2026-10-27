import { Coins, ShieldCheck, Wallet } from "lucide-react";
import type { SubcuentaTipo } from "@/lib/api/subcuentas";
import type { Tono } from "../comun/types";

const ESTADO_CVU: Record<string, { label: string; tone: Tono }> = {
  Activa: { label: "Habilitado", tone: "success" },
  Pausada: { label: "Deshabilitado", tone: "danger" },
  Habilitado: { label: "Habilitado", tone: "success" },
  Deshabilitado: { label: "Deshabilitado", tone: "danger" },
  Suspendido: { label: "Suspendido", tone: "warn" },
};

/** Etiqueta y tono del badge de estado de un CVU (subcuenta). */
export function estadoCvu(e: string): { label: string; tone: Tono } {
  return ESTADO_CVU[e] ?? { label: e, tone: "neutral" };
}

/**
 * Mapea el `subcuentas.tipo` (4 valores oficiales: Operativa | Recaudacion | Garantias | Sueldos)
 * a un badge con color e ícono. Etiqueta y "kind" se usan también en el dropdown del modal.
 */
export const TIPO_SUBCUENTA_META: Record<SubcuentaTipo, { label: string; icon: typeof Wallet }> = {
  Operativa: { label: "Operativa", icon: Wallet },
  Recaudacion: { label: "Recaudación", icon: Coins },
  Garantias: { label: "Garantías", icon: ShieldCheck },
  Sueldos: { label: "Sueldos", icon: Wallet },
};

/** Clases de color del badge de tipo de subcuenta. */
export function tipoSubcuentaClases(tipo: SubcuentaTipo): string {
  return tipo === "Operativa"
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : tipo === "Recaudacion"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : tipo === "Garantias"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-purple-100 text-purple-800 border-purple-200";
}
