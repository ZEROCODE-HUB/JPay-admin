import type { Contra, EstadoContra } from "@/lib/api/contracargos";

/**
 * Días hábiles entre `hoy` y `fechaLimite`.
 * - Positivo: días que faltan (en horario hábil, lun-vie)
 * - Negativo: días que se pasó del plazo
 * - 0: vence hoy
 */
export function diasHabilesRestantes(fechaLimite: string, hoy: Date = new Date()): number {
  const limite = new Date(fechaLimite);
  // Normalizamos a inicio de día para evitar líos de hora.
  const dLimite = new Date(limite.getFullYear(), limite.getMonth(), limite.getDate());
  const dHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (dLimite.getTime() === dHoy.getTime()) return 0;

  const sentido = dLimite.getTime() > dHoy.getTime() ? 1 : -1;
  const cursor = new Date(dHoy);
  let count = 0;

  while (true) {
    cursor.setDate(cursor.getDate() + sentido);
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) count += sentido;
    if (sentido > 0 && cursor.getTime() >= dLimite.getTime()) break;
    if (sentido < 0 && cursor.getTime() <= dLimite.getTime()) break;
  }
  return count;
}

/** Cantidad de contracargos por estado (para las cards KPI). */
export function contarPorEstado(rows: Pick<Contra, "estado">[]): Record<EstadoContra, number> {
  const kpis: Record<EstadoContra, number> = {
    Simulado: 0,
    Abierto: 0,
    En_mediación: 0,
    En_mediacion: 0,
    Cerrado_acreditado: 0,
    Cerrado_retenido: 0,
  };
  for (const r of rows) kpis[r.estado] = (kpis[r.estado] ?? 0) + 1;
  return kpis;
}

/** Importe tipeado por el operador ("15000,50" o "15000.50") a número. */
export function parseImporte(valor: string): number {
  return parseFloat(valor.replace(",", "."));
}

/** Tamaño de un adjunto en KB con un decimal. */
export function tamanoKb(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}
