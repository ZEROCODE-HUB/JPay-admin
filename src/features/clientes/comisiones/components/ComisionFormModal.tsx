import { AlertTriangle } from "lucide-react";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { CargaComisionesState } from "../hooks/useCargaComisiones";
import { ComisionFormFields } from "./ComisionFormFields";
import { DesglosePreview } from "./DesglosePreview";

/** Alta / edición de una comisión, con el error de validación y el desglose. */
export function ComisionFormModal({ s }: { s: CargaComisionesState }) {
  return (
    <FormDialog
      open
      onClose={s.cerrarForm}
      title={s.editTarget ? "Editar comisión" : "Nueva comisión"}
      description={
        s.editTarget
          ? `Editando comisión ${s.editTarget.legajo}`
          : "Asignar una nueva comisión a un cliente."
      }
      onSubmit={s.guardarDraft}
      submitLabel={s.saving ? "Guardando…" : "Guardar"}
      size="lg"
    >
      {s.formError && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-xs text-danger-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{s.formError}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComisionFormFields draft={s.draft} onChange={s.setDraft} />
        <div className="sm:col-span-2">
          <DesglosePreview desglose={s.draftDesglose} />
        </div>
      </div>
    </FormDialog>
  );
}
