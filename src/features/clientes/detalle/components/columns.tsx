import { Badge } from "@/components/portal-shell";
import type { Column } from "@/shared/ui/data-table";
import type { HistorialCambio, Validacion } from "@/lib/api/detalle-cliente";
import type { AlertaView, BloqueoView } from "../utils";

export const historialColumns: Column<HistorialCambio>[] = [
  { key: "campo", label: "Campo", render: (r) => r.campo },
  { key: "valorAnterior", label: "Valor anterior", render: (r) => r.valorAnterior ?? "—" },
  { key: "valorNuevo", label: "Valor nuevo", render: (r) => r.valorNuevo ?? "—" },
  { key: "fecha", label: "Fecha", render: (r) => r.fecha },
  { key: "hora", label: "Hora", render: (r) => r.hora ?? "—" },
  { key: "usuario", label: "Usuario", render: (r) => r.usuario ?? "—" },
];

export const validacionesColumns: Column<Validacion>[] = [
  { key: "proveedor", label: "Proveedor", render: (r) => r.proveedor },
  { key: "estado", label: "Estado", render: (r) => r.estado },
  { key: "fecha", label: "Fecha", render: (r) => r.fecha },
];

export const riesgoColumns: Column<AlertaView>[] = [
  { key: "tipo", label: "Tipo de alerta", render: (r) => r.tipo },
  {
    key: "estado",
    label: "Estado",
    render: (r) => {
      const tone =
        r.estado === "Resuelto" ? "success" : r.estado === "Revisado" ? "neutral" : "warn";
      return <Badge tone={tone}>{r.estado}</Badge>;
    },
  },
  { key: "fecha", label: "Fecha de la alerta", render: (r) => r.fecha },
  {
    key: "fechaAceptacion",
    label: "Fecha de aceptación",
    render: (r) => r.fechaAceptacion ?? "—",
  },
];

export const bloqueosColumns: Column<BloqueoView>[] = [
  { key: "parametro", label: "Tipo", render: (r) => r.parametro },
  {
    key: "estado",
    label: "Estado",
    render: (r) => {
      if (!r.estado) return "—";
      const tone =
        r.estado === "Desbloqueado" ? "success" : r.estado === "Bloqueado" ? "danger" : "warn";
      return <Badge tone={tone}>{r.estado}</Badge>;
    },
  },
  { key: "valor", label: "Valor", render: (r) => r.valor ?? "—" },
  {
    key: "fechaAceptacion",
    label: "Fecha de aceptación",
    render: (r) => r.fechaAceptacion ?? "—",
  },
];
