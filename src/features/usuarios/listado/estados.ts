import type { RiesgoPLD } from "@/lib/api/clientes";

const CLASES_RIESGO: Record<RiesgoPLD, string> = {
  bajo: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medio: "bg-amber-100 text-amber-800 border-amber-200",
  alto: "bg-orange-100 text-orange-800 border-orange-200",
  critico: "bg-danger-100 text-danger-800 border-danger-200",
};

/** Clases del badge de riesgo PLAFT (cualquier nivel desconocido cae en el tono de peligro). */
export function riesgoTone(nivel: RiesgoPLD): string {
  return CLASES_RIESGO[nivel] ?? "bg-danger-100 text-danger-800 border-danger-200";
}

/** Color de la barra de consumo mensual según el % usado del límite. */
export function consumoTone(pct: number): string {
  if (pct >= 90) return "bg-danger-500";
  if (pct >= 75) return "bg-amber-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-emerald-500";
}
