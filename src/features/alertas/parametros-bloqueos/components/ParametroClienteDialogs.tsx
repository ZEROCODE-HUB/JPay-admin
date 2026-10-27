import { AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/shared/format";
import { FormDialog } from "@/shared/ui/form-dialog";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import type { ParametrosClientes } from "../hooks/useParametrosClientes";
import type { Generales } from "../utils";
import { ClienteParamFields } from "./ClienteParamFields";

/** Diálogos de la grilla por cliente: alta/edición, detalle y confirmación de baja. */
export function ParametroClienteDialogs({
  c,
  generales,
}: {
  c: ParametrosClientes;
  generales: Generales;
}) {
  const { dialogo, draft, errDraft, guardando, viendo, borrando } = c;

  return (
    <>
      {dialogo && (
        <FormDialog
          open
          onClose={() => c.setDialogo(null)}
          title={
            dialogo === "nuevo"
              ? "Agregar nuevos parámetros de usuario"
              : "Editar parámetros de usuario"
          }
          description={
            dialogo === "nuevo"
              ? "Configure umbrales de depósitos para un usuario"
              : `Editando parámetros de ${draft.correo}`
          }
          onSubmit={() => void c.guardarDraft()}
          submitLabel={
            guardando ? "Guardando…" : dialogo === "nuevo" ? "Agregar" : "Guardar cambios"
          }
        >
          {errDraft && (
            <div className="mb-3 flex items-start gap-2 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {errDraft}
            </div>
          )}
          <ClienteParamFields
            draft={draft}
            onChange={c.setDraft}
            editando={dialogo === "editar"}
            generales={generales}
          />
        </FormDialog>
      )}

      {viendo && (
        <FormDialog
          open
          onClose={() => c.setViendo(null)}
          title="Detalle de parámetros de usuario"
          description={`Parámetros de ${viendo.correo}`}
          onSubmit={() => c.setViendo(null)}
          submitLabel="Cerrar"
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Legajo:</span>{" "}
              <span className="font-mono tabular-nums font-medium">{viendo.legajo}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Usuario:</span>{" "}
              <span className="font-medium">{viendo.correo}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              <span className="font-medium">{viendo.nombre}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Actualizado:</span>{" "}
              <span className="font-medium">{formatDateTime(viendo.updatedAt)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Salarios mínimos por persona:</span>{" "}
              <span className="font-mono tabular-nums font-medium">
                {viendo.individualMinWages ?? `General (${generales.persona ?? "—"})`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Salarios mínimos por empresa:</span>{" "}
              <span className="font-mono tabular-nums font-medium">
                {viendo.companyMinWages ?? `General (${generales.empresa ?? "—"})`}
              </span>
            </div>
          </div>
        </FormDialog>
      )}

      <ConfirmDialog
        open={borrando !== null}
        onClose={() => c.setBorrando(null)}
        onConfirm={c.eliminar}
        title="Eliminar parámetros individuales"
        message={`El cliente ${borrando?.legajo ?? ""} volverá a usar los umbrales generales. ¿Continuar?`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  );
}
