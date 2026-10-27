import { FormDialog } from "@/shared/ui/form-dialog";
import { Input, Label } from "@/components/portal-shell";
import { LegajoCell } from "@/components/legajo-label";
import type { CvuRow } from "@/lib/api/subcuentas";

export function CvuDetalleDialog({
  viewing,
  onClose,
}: {
  viewing: CvuRow | null;
  onClose: () => void;
}) {
  if (!viewing) return null;
  return (
    <FormDialog
      open={!!viewing}
      onClose={onClose}
      title="Detalle de CVU"
      description={`CVU de ${viewing.nombre} ${viewing.apellido}`}
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
          <span className="text-muted-foreground">CVU:</span>{" "}
          <span className="font-mono font-medium">{viewing.cbu ?? "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Alias:</span>{" "}
          <span className="font-medium">{viewing.cbu ? viewing.cbu.slice(-6) : "—"}</span>
        </div>
      </div>
    </FormDialog>
  );
}

export function CvuEditarDialog({
  editTarget,
  editAlias,
  onAliasChange,
  onClose,
  onSubmit,
}: {
  editTarget: CvuRow | null;
  editAlias: string;
  onAliasChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!editTarget) return null;
  return (
    <FormDialog
      open={!!editTarget}
      onClose={onClose}
      title="Editar CVU"
      description={`Editando CVU de ${editTarget.nombre}`}
      onSubmit={onSubmit}
      submitLabel="Guardar"
    >
      <div>
        <Label>Alias (derivado del CVU)</Label>
        <Input value={editAlias} onChange={(e) => onAliasChange(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">El CVU es inmutable; alias es informativo.</p>
    </FormDialog>
  );
}
