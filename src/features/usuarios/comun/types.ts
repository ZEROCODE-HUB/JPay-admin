export type Tono = "success" | "warn" | "danger" | "neutral";

/** Diálogo de confirmación pendiente (acciones sobre un cliente). */
export type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

export type AccionCliente =
  "aprobar" | "activar" | "suspender" | "reactivar" | "deshabilitar" | "eliminar";
