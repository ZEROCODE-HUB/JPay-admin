import { useState } from "react";
import type { ConfirmAction } from "../listado";

/** Estado del diálogo de aviso de error ("No se pudo …") de los listados de APIs. */
export function useAvisoError() {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const avisarError = (title: string, message: string) =>
    setConfirmAction({
      title,
      message,
      confirmLabel: "Cerrar",
      variant: "danger",
      onConfirm: () => setConfirmAction(null),
    });

  return { confirmAction, setConfirmAction, avisarError };
}
