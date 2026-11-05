import { FormDialog } from "@/shared/ui/form-dialog";
import { LegajoCell } from "@/components/legajo-label";
import type { SubcuentaConCliente } from "@/lib/api/subcuentas";

export function ClabeDetalleDialog({
  viewing,
  onClose,
}: {
  viewing: SubcuentaConCliente | null;
  onClose: () => void;
}) {
  if (!viewing) return null;
  return (
    <FormDialog
      open={!!viewing}
      onClose={onClose}
      title="Detalle de la subcuenta"
      description={`${viewing.nombre} ${viewing.apellido}`.trim()}
      onSubmit={onClose}
      submitLabel="Cerrar"
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Legajo:</span>{" "}
          <LegajoCell legajo={viewing.legajo} />
        </div>
        <div>
          <span className="text-muted-foreground">Correo:</span>{" "}
          <span className="font-medium">{viewing.cliente?.correo ?? viewing.email}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Nombre:</span>{" "}
          <span className="font-medium">{viewing.nombre}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Apellido:</span>{" "}
          <span className="font-medium">{viewing.apellido}</span>
        </div>
        <div>
          <span className="text-muted-foreground">RFC:</span>{" "}
          <span className="font-mono font-medium">{viewing.cliente?.taxId ?? "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">CLABE:</span>{" "}
          <span className="font-mono font-medium">{viewing.cbu ?? "—"}</span>
        </div>
      </div>
    </FormDialog>
  );
}
