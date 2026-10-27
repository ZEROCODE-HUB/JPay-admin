import { useState } from "react";
import { Input, Label } from "@/components/portal-shell";
import { FormDialog } from "@/shared/ui/form-dialog";
import { useImpuestosForAsignacion } from "@/hooks/useImpuestos";
import { TIPOS_OPERACION } from "@/lib/api/types";
import type { EstadoImpuesto, ImpuestoAsignacion, TipoOperacion } from "@/lib/api/types";
import { aplicarImpuesto, esAsignacionValida, formInicial, type AsignacionForm } from "../utils";
import { ClienteLegajoBuscador } from "./ClienteLegajoBuscador";

const SELECT_CLS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Alta / edición de la asignación de un impuesto a un cliente. */
export function AsignacionFormModal({
  asignacion,
  onClose,
  onSave,
}: {
  asignacion: ImpuestoAsignacion | null;
  onClose: () => void;
  onSave: (form: AsignacionForm) => void;
}) {
  const { rows: impuestosDisponibles } = useImpuestosForAsignacion();
  const [form, setForm] = useState<AsignacionForm>(() => formInicial(asignacion));
  const valido = esAsignacionValida(form, !!asignacion);

  const guardar = () => {
    if (!valido) return;
    onSave(form);
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={asignacion ? "Editar asignación" : "Nueva asignación de impuesto"}
      description={
        asignacion
          ? `Modificá la asignación de ${asignacion.clienteLegajo}.`
          : "Asigná un impuesto activo a un cliente por su legajo."
      }
      onSubmit={guardar}
      submitLabel={asignacion ? "Guardar cambios" : "Crear asignación"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="as-legajo">Usuario (correo / legajo)</Label>
          {asignacion ? (
            <>
              <Input id="as-legajo" value={form.clienteLegajo} disabled />
              <p className="text-[11px] text-muted-foreground mt-1">
                El legajo no se puede modificar.
              </p>
            </>
          ) : (
            <ClienteLegajoBuscador
              legajo={form.clienteLegajo}
              onLegajoChange={(clienteLegajo) => setForm((f) => ({ ...f, clienteLegajo }))}
            />
          )}
        </div>
        <div>
          <Label htmlFor="as-impuesto">Impuesto</Label>
          <select
            id="as-impuesto"
            className={SELECT_CLS}
            value={form.impuestoId}
            onChange={(e) => {
              const imp = impuestosDisponibles.find((i) => i.id === e.target.value);
              setForm(aplicarImpuesto(form, e.target.value, imp));
            }}
          >
            <option value="">Seleccionar…</option>
            {impuestosDisponibles.map((i) => (
              <option key={i.id} value={i.id}>
                {i.codigo} — {i.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="as-estado">Estado</Label>
          <select
            id="as-estado"
            className={SELECT_CLS}
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoImpuesto })}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <Label htmlFor="as-monto">% del impuesto</Label>
          <Input
            id="as-monto"
            type="number"
            step="any"
            min="0"
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            placeholder="Ej: 3.5"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Editable por asignación — sobrescribe el % base del impuesto.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="as-tipo-operacion">Tipo de operación</Label>
          <select
            id="as-tipo-operacion"
            className={SELECT_CLS}
            value={form.tipoOperacion}
            onChange={(e) =>
              setForm({ ...form, tipoOperacion: e.target.value as TipoOperacion | "" })
            }
          >
            <option value="">Aplica a todas las operaciones</option>
            {TIPOS_OPERACION.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">
            Restringe el impuesto a un tipo de operación específico (Link de pago, E-commerce,
            Depósito o Retiro). Si lo dejás vacío, aplica a todas.
          </p>
        </div>
      </div>
      {!valido && (
        <p className="text-xs text-muted-foreground">
          Completá el legajo y el impuesto para poder guardar.
        </p>
      )}
    </FormDialog>
  );
}
