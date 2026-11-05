import { formatDateTime } from "@/shared/format";
import type { TableServerFilters } from "@/shared/ui/data-table";
import {
  ALERT_RESOLUTION_LABEL,
  ALERT_STATUS_LABEL,
  type AlertFilters,
  type AlertItem,
  type AlertResolution,
  type SimulatedDeposit,
} from "@/lib/api/compliance";
import { invertir, rangoFiltro } from "../comun/utils";

export type Dictamen = { alert: AlertItem; resolution: AlertResolution };

export const STATUS_OPTIONS = Object.values(ALERT_STATUS_LABEL);
export const STATUS_BY_LABEL = invertir(ALERT_STATUS_LABEL);

/** Traduce el panel de filtros de la tabla a los filtros de la API de alertas. */
export function filtrosAlertas(panel: TableServerFilters, search: string): AlertFilters {
  const activo = panel.enums.activo;
  const creada = rangoFiltro(panel.dates, "createdAt");
  const aceptada = rangoFiltro(panel.dates, "acceptedAt");
  return {
    search: search || undefined,
    status: panel.enums.estado ? STATUS_BY_LABEL.get(panel.enums.estado) : undefined,
    active: activo === "Sí" ? true : activo === "No" ? false : undefined,
    createdFrom: creada.from,
    createdTo: creada.to,
    acceptedFrom: aceptada.from,
    acceptedTo: aceptada.to,
  };
}

/** Una alerta puede dictaminarse mientras está pendiente o en revisión. */
export const alertaAbierta = (a: AlertItem) => a.status === "pending" || a.status === "in_review";

export const CSV_CABECERA = [
  "Legajo",
  "Correo",
  "Nombre",
  "Tipo",
  "Estado",
  "Activo",
  "Fecha de alerta",
  "Fecha de aceptación",
  "Vence",
  "Resolución",
  "Dictamen",
  "TXID",
  "Descripción",
];

export function filaCsvAlerta(a: AlertItem): (string | number | null)[] {
  return [
    a.legajo,
    a.correo,
    a.nombre,
    a.type,
    ALERT_STATUS_LABEL[a.status],
    a.isActive ? "Sí" : "No",
    a.createdAt,
    a.acceptedAt ?? "",
    a.dueAt,
    a.resolution ? ALERT_RESOLUTION_LABEL[a.resolution] : "",
    a.resolutionNotes ?? "",
    a.idTxn ?? "",
    a.description,
  ];
}

/** Toast de resultado del barrido de compliance. */
export function mensajeBarrido(r: {
  coincidencias_revisadas: number;
  alertas_nuevas: number;
  ultima_corrida_plaft: string | null;
}): string {
  return (
    `Barrido ejecutado: ${r.coincidencias_revisadas} coincidencias en listas PLD revisadas, ${r.alertas_nuevas} alertas nuevas.` +
    (r.ultima_corrida_plaft
      ? ` Última corrida de listas PLD: ${formatDateTime(r.ultima_corrida_plaft)}.`
      : " No hay corridas de listas PLD registradas.")
  );
}

export type FormSimulacion = {
  clabe: string;
  importe: string;
  rfc: string;
  titular: string;
  clabeOrigen: string;
};

/** Valida el formulario de depósito simulado; devuelve el error a mostrar o null. */
export function validarSimulacion(form: FormSimulacion): string | null {
  if (!/^\d{18}$/.test(form.clabe.trim())) return "La CLABE destino debe tener 18 dígitos";
  if (!(Number(form.importe) > 0)) return "Ingresa un importe mayor a 0";
  return null;
}

/** Parámetros de `simulateDeposit` a partir del formulario. */
export function inputSimulacion(form: FormSimulacion) {
  const importe = Number(form.importe);
  return {
    clabeDestino: form.clabe.trim(),
    importe: Math.round(importe * 100) / 100,
    rfcOrigen: form.rfc.replace(/[\s-]/g, "").toUpperCase(),
    titularOrigen: form.titular.trim(),
    clabeOrigen: form.clabeOrigen.trim(),
  };
}

/** Mensaje del resultado de la simulación (ok = toast de éxito). */
export function resultadoSimulacion(r: SimulatedDeposit): { ok: boolean; mensaje: string } {
  if (r.estado === "acreditado") {
    return {
      ok: true,
      mensaje: r.retenido
        ? "Depósito acreditado RETENIDO (bloqueo preventivo)."
        : `Depósito acreditado (${r.decision === "alert" ? "con alertas" : "sin alertas"}).`,
    };
  }
  return {
    ok: false,
    mensaje:
      r.estado === "sin_subcuenta"
        ? "No hay ninguna subcuenta con esa CLABE"
        : `Resultado: ${r.estado}`,
  };
}
