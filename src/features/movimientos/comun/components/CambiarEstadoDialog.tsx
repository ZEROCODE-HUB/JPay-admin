import type { Dispatch, SetStateAction } from "react";
import { AlertTriangle } from "lucide-react";
import { FormDialog } from "@/shared/ui/form-dialog";
import { Label } from "@/components/portal-shell";
import type { useCambiarEstadoMovimiento } from "@/hooks/useMovimientoActions";
import type { EstadoMovimiento } from "@/lib/api/types";
import type { EstadoTarget } from "../utils";

/**
 * Modal para cambiar manualmente el estado de un movimiento. La mutación vive en
 * la pantalla para que su estado (error) sobreviva al cerrar y reabrir el modal.
 */
export function CambiarEstadoDialog({
  target,
  setTarget,
  estados,
  cambiarEstado,
  title,
  description,
  selectId,
}: {
  target: EstadoTarget;
  setTarget: Dispatch<SetStateAction<EstadoTarget | null>>;
  estados: EstadoMovimiento[];
  cambiarEstado: ReturnType<typeof useCambiarEstadoMovimiento>;
  title: string;
  description: string;
  selectId: string;
}) {
  return (
    <FormDialog
      open
      onClose={() => setTarget(null)}
      title={title}
      description={description}
      onSubmit={async () => {
        await cambiarEstado.mutateAsync({
          movimientoId: target.dbId,
          nuevoEstadoId: target.nuevoId,
          observaciones: "Cambio manual desde backoffice",
        });
        setTarget(null);
      }}
      submitLabel={cambiarEstado.isPending ? "Guardando…" : "Confirmar cambio"}
      size="md"
    >
      {cambiarEstado.isError && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{(cambiarEstado.error as Error).message}</span>
        </div>
      )}
      <div>
        <Label htmlFor={selectId}>Nuevo estado</Label>
        <select
          id={selectId}
          className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm"
          value={target.nuevoId}
          onChange={(e) => setTarget((s) => (s ? { ...s, nuevoId: Number(e.target.value) } : s))}
        >
          {estados.map((s) => (
            <option key={s.id} value={s.id}>
              {s.codigo} — {s.nombre}
            </option>
          ))}
        </select>
      </div>
    </FormDialog>
  );
}
