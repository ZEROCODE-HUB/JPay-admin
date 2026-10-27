import { ArrowRightLeft, CheckCircle, Eye, FileWarning, ShieldCheck, XCircle } from "lucide-react";
import { formatDateTime } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import { LegajoCell } from "@/components/legajo-label";
import {
  ALERT_RESOLUTION_LABEL,
  ALERT_STATUS_LABEL,
  type AlertItem,
  type AlertResolution,
} from "@/lib/api/compliance";
import { STATUS_TONE, activoTone } from "../estados";
import { STATUS_OPTIONS, alertaAbierta } from "../utils";

/** Acciones del menú de cada fila. */
export function accionesAlerta(
  a: AlertItem,
  h: {
    verDetalle: (a: AlertItem) => void;
    aceptar: (a: AlertItem) => void;
    abrirDictamen: (a: AlertItem, r: AlertResolution) => void;
    verOperacion: (txid: string) => void;
  },
): ActionItem[] {
  const abierta = alertaAbierta(a);
  return [
    { label: "Ver detalle", icon: Eye, onClick: () => h.verDetalle(a) },
    ...(a.status === "pending"
      ? [
          {
            label: "Aceptar (iniciar revisión)",
            icon: CheckCircle,
            onClick: () => h.aceptar(a),
          },
        ]
      : []),
    ...(abierta
      ? [
          {
            label: "Resolver: operación justificada",
            icon: ShieldCheck,
            onClick: () => h.abrirDictamen(a, "justified"),
          },
          {
            label: "Registrar ROS",
            icon: FileWarning,
            variant: "danger" as const,
            onClick: () => h.abrirDictamen(a, "ros"),
          },
          {
            label: "Descartar: falso positivo",
            icon: XCircle,
            onClick: () => h.abrirDictamen(a, "false_positive"),
          },
        ]
      : []),
    ...(a.idTxn
      ? [
          {
            label: "Ver operación",
            icon: ArrowRightLeft,
            onClick: () => h.verOperacion(a.idTxn!),
          },
        ]
      : []),
  ];
}

export const columnasAlertas: Column<AlertItem>[] = [
  {
    key: "legajo",
    label: "Legajo",
    minWidth: 130,
    render: (r) => <LegajoCell legajo={r.legajo} />,
  },
  { key: "correo", label: "Correo", minWidth: 180, maxWidth: 260, render: (r) => r.correo },
  { key: "nombre", label: "Nombre", minWidth: 160, maxWidth: 240, render: (r) => r.nombre },
  {
    key: "type",
    label: "Tipo de alerta",
    minWidth: 200,
    maxWidth: 280,
    tooltip: (r) => r.description,
    render: (r) => r.type,
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: STATUS_OPTIONS,
    minWidth: 120,
    render: (r) => (
      <div className="flex flex-col gap-0.5">
        <Badge tone={STATUS_TONE[r.status]}>{ALERT_STATUS_LABEL[r.status]}</Badge>
        {r.resolution && (
          <span className="text-[11px] text-muted-foreground">
            {ALERT_RESOLUTION_LABEL[r.resolution]}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "activo",
    label: "Activo",
    filterable: "enum",
    filterOptions: ["Sí", "No"],
    minWidth: 80,
    render: (r) => <Badge tone={activoTone(r.isActive)}>{r.isActive ? "Sí" : "No"}</Badge>,
  },
  {
    key: "createdAt",
    label: "Fecha de alerta",
    filterable: "date",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatDateTime(r.createdAt)}</span>
    ),
  },
  {
    key: "acceptedAt",
    label: "Fecha de aceptación",
    filterable: "date",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatDateTime(r.acceptedAt)}</span>
    ),
  },
];
