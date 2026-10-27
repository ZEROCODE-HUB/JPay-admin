import { Power, PowerOff } from "lucide-react";
import { formatDate } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import type { ActionItem } from "@/components/actions-dropdown";
import { Badge } from "@/components/portal-shell";
import type { DcExcepcion } from "@/lib/api/types";
import { estadoActivoTone } from "../../utils";
import type { DebitosCreditosState } from "../hooks/useDebitosCreditos";

export const columnasExcepciones: Column<DcExcepcion>[] = [
  {
    key: "cuit",
    label: "CUIT",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums text-xs">{r.cuit}</span>,
  },
  {
    key: "email",
    label: "Usuario",
    render: (r) => r.email,
  },
  {
    key: "tipo",
    label: "Tipo",
    sortable: true,
    render: (r) => r.tipo,
  },
  {
    key: "direccion",
    label: "Dirección",
    sortable: true,
    render: (r) => <Badge tone="neutral">{r.direccion}</Badge>,
  },
  {
    key: "impuestoNombre",
    label: "Impuesto",
    render: (r) => r.impuestoNombre ?? <span className="text-muted-foreground">—</span>,
  },
  {
    key: "motivo",
    label: "Motivo",
    render: (r) => r.motivo ?? "—",
  },
  {
    key: "vigenciaDesde",
    label: "Vigencia desde",
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatDate(r.vigenciaDesde)}</span>
    ),
  },
  {
    key: "vigenciaHasta",
    label: "Vigencia hasta",
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatDate(r.vigenciaHasta)}</span>
    ),
  },
  {
    key: "archivoCertificado",
    label: "Certificado",
    render: (r) =>
      r.archivoCertificado ? (
        <a
          href={r.archivoCertificado}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-ink underline text-xs"
        >
          Ver certificado
        </a>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    render: (r) => <Badge tone={estadoActivoTone(r.estado)}>{r.estado}</Badge>,
  },
];

/** Menú de acciones de una excepción: solo activar / desactivar. */
export function accionesExcepcion(s: DebitosCreditosState, row: DcExcepcion): ActionItem[] {
  return [
    {
      label: row.estado === "Activo" ? "Desactivar" : "Activar",
      icon: row.estado === "Activo" ? PowerOff : Power,
      disabled: !s.puedeModificar,
      onClick: () => s.toggleEstado(row),
    },
  ];
}
