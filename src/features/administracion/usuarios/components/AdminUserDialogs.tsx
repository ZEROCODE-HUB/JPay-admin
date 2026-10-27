import { Loader2, X } from "lucide-react";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { AdminUser, Rol } from "@/lib/api/types";
import { estadoAdminLabel, type NuevoAdminUser } from "../utils";
import { NewUserForm } from "./NewUserForm";

export function AdminUserDetalle({
  detail,
  rolNombre,
  onClose,
}: {
  detail: AdminUser;
  rolNombre: Map<string, string>;
  onClose: () => void;
}) {
  return (
    <FormDialog
      open={!!detail}
      onClose={onClose}
      title="Detalle del usuario"
      description={`${detail.nombre} · ${detail.legajo}`}
      onSubmit={onClose}
      submitLabel="Cerrar"
    >
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Nombre:</span>{" "}
          <span className="font-medium">{detail.nombre}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Legajo:</span>{" "}
          <span className="font-medium">{detail.legajo}</span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Email:</span>{" "}
          <span className="font-medium">{detail.email}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Rol:</span>{" "}
          <span className="font-medium">{rolNombre.get(detail.rolId) ?? detail.rolId}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Estado:</span>{" "}
          <span className="font-medium">{estadoAdminLabel(detail.activo)}</span>
        </div>
      </div>
    </FormDialog>
  );
}

export function NuevoAdminUserModal({
  rolesLoading,
  roles,
  submitting,
  error,
  onSubmit,
  onClose,
}: {
  rolesLoading: boolean;
  roles: Rol[];
  submitting: boolean;
  error: string | null;
  onSubmit: (vars: NuevoAdminUser) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-card border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Nuevo usuario backoffice</h3>
          <button onClick={onClose} className="p-1 hover:opacity-70">
            <X size={18} />
          </button>
        </div>

        {rolesLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 size={16} className="animate-spin" /> Cargando roles…
          </div>
        ) : (
          <NewUserForm
            roles={roles}
            submitting={submitting}
            error={error}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
