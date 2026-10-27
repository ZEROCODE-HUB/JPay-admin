import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import type { ConfirmActionState } from "../types";

/** Muestra el diálogo de confirmación / error pendiente, si hay uno. */
export function ConfirmActionDialog({
  action,
  onClose,
}: {
  action: ConfirmActionState | null;
  onClose: () => void;
}) {
  if (!action) return null;
  return (
    <ConfirmDialog
      open={!!action}
      onClose={onClose}
      title={action.title}
      message={action.message}
      confirmLabel={action.confirmLabel}
      variant={action.variant}
      onConfirm={action.onConfirm}
    />
  );
}
