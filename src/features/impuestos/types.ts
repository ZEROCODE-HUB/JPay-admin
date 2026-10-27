import type { EstadoImpuesto } from "@/lib/api/types";

/** Filtro de estado de los listados de impuestos ("" = todos). */
export type EstadoFiltro = EstadoImpuesto | "";

/** Diálogo de confirmación / error genérico que abren las acciones de la pantalla. */
export type ConfirmActionState = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

/** Error de carga ya normalizado para mostrar en el listado. */
export type ErrorListado = { permission?: boolean; message?: string } | null;
