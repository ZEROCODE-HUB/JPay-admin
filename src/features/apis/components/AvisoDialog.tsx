import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import type { ConfirmAction } from "../listado";

/** Diálogo de aviso/confirmación genérico (se monta solo si hay acción). */
export function AvisoDialog({
  confirmAction,
  onClose,
}: {
  confirmAction: ConfirmAction | null;
  onClose: () => void;
}) {
  if (!confirmAction) return null;
  return (
    <ConfirmDialog
      open={!!confirmAction}
      onClose={onClose}
      title={confirmAction.title}
      message={confirmAction.message}
      confirmLabel={confirmAction.confirmLabel}
      variant={confirmAction.variant}
      onConfirm={confirmAction.onConfirm}
    />
  );
}
