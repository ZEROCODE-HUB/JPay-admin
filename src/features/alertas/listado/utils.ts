import { formatDateTime } from "@/shared/format";
import type { TableServerFilters } from "@/shared/ui/data-table";
import {
  ALERT_RESOLUTION_LABEL,
  ALERT_STATUS_LABEL,
  type AlertFilters,
  type AlertItem,
  type AlertResolution,
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
  "Número de cliente",
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
