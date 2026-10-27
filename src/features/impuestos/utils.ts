import { formatMoney, formatPercent } from "@/shared/format";
import type { AmbitoImpuesto, EstadoImpuesto, TipoImpuesto } from "@/lib/api/types";
import type { ConfirmActionState } from "./types";

export type Tono = "success" | "neutral";

/** Tono del badge de estado (Activo / Inactivo). */
export function estadoActivoTone(estado: EstadoImpuesto): Tono {
  return estado === "Activo" ? "success" : "neutral";
}

/** Tono del badge de ámbito: Interno = success, Externo = neutral. */
export function ambitoTone(ambito: AmbitoImpuesto | null | undefined): Tono {
  return ambito === "Interno" ? "success" : "neutral";
}

/** Monto de un impuesto según su tipo: porcentaje, pesos o "—" si no tiene. */
export function formatMontoImpuesto(tipo: TipoImpuesto, monto: number | null): string {
  if (monto === null) return "—";
  return tipo === "Porcentaje" ? formatPercent(monto) : formatMoney(monto);
}

/** Cantidad de páginas de un listado paginado en el servidor (mínimo 1). */
export function contarPaginas(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Fecha local (no UTC) en formato AAAA-MM-DD, como la usan los inputs type="date". */
export function fechaLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Diálogo de error que se cierra con "Cerrar". */
export function dialogoError(
  title: string,
  message: string,
  cerrar: () => void,
): ConfirmActionState {
  return { title, message, confirmLabel: "Cerrar", variant: "danger", onConfirm: cerrar };
}
