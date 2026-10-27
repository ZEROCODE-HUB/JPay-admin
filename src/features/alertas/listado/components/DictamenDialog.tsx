import { FormDialog } from "@/shared/ui/form-dialog";
import { ALERT_RESOLUTION_LABEL } from "@/lib/api/compliance";
import type { Dictamen } from "../utils";

type Props = {
  dictamen: Dictamen;
  notas: string;
  onNotasChange: (v: string) => void;
  enviando: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Cierre de una alerta con su resolución y el dictamen del analista. */
export function DictamenDialog({
  dictamen,
  notas,
  onNotasChange,
  enviando,
  onClose,
  onConfirm,
}: Props) {
  return (
    <FormDialog
      open
      onClose={onClose}
      title={ALERT_RESOLUTION_LABEL[dictamen.resolution]}
      description={`${dictamen.alert.type} · ${dictamen.alert.legajo}`}
      onSubmit={onConfirm}
      submitLabel={enviando ? "Guardando…" : "Confirmar resolución"}
    >
      {dictamen.resolution === "ros" && (
        <div className="mb-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
          Registra que la operatoria no tiene justificación económica ni legal y corresponde un
          Reporte de Operación Sospechosa ante la UIF.
        </div>
      )}
      {dictamen.resolution === "false_positive" && dictamen.alert.plaftMatchId != null && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Esta coincidencia REPET queda descartada y no vuelve a generar alertas. Otras
          coincidencias del cliente sí.
        </div>
      )}
      <label className="text-xs font-semibold text-foreground mb-1.5 block">
        Dictamen del analista
      </label>
      <textarea
        value={notas}
        onChange={(e) => onNotasChange(e.target.value)}
        placeholder="Fundamento de la resolución, documentación revisada…"
        className="w-full h-28 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 resize-none"
      />
      <p className="text-[11px] text-muted-foreground mt-1">
        Cerrar la alerta no desbloquea la cuenta: los bloqueos se liberan desde el listado de
        bloqueos.
      </p>
    </FormDialog>
  );
}
