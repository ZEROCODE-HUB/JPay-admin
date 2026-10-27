import { useState } from "react";
import { Input, Label } from "@/components/portal-shell";
import { FormDialog } from "@/shared/ui/form-dialog";
import { AMBITOS_IMPUESTO } from "@/lib/api/types";
import type { AmbitoImpuesto, EstadoImpuesto, Impuesto, TipoImpuesto } from "@/lib/api/types";
import {
  TIPOS_IMPUESTO,
  esImpuestoFormValido,
  formInicial,
  montoNegativo,
  necesitaMonto as tipoNecesitaMonto,
  type ImpuestoForm,
} from "../utils";

const SELECT_CLS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Alta / edición de un impuesto del catálogo. */
export function ImpuestoFormModal({
  impuesto,
  onClose,
  onSave,
}: {
  impuesto: Impuesto | null;
  onClose: () => void;
  onSave: (form: ImpuestoForm) => void;
}) {
  const [form, setForm] = useState<ImpuestoForm>(() => formInicial(impuesto));

  const necesitaMonto = tipoNecesitaMonto(form.tipo);
  const valido = esImpuestoFormValido(form);

  const guardar = () => {
    if (!valido) return;
    onSave({
      ...form,
      monto: necesitaMonto ? form.monto : "",
    });
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={impuesto ? "Editar impuesto" : "Nuevo impuesto"}
      description={
        impuesto
          ? `Modificá los datos del impuesto "${impuesto.nombre}".`
          : "Definí el tipo de impuesto y su monto."
      }
      onSubmit={guardar}
      submitLabel={impuesto ? "Guardar cambios" : "Crear impuesto"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="im-codigo">Código</Label>
          <Input
            id="im-codigo"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            placeholder="Ej: IIBB"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Debe ser único entre los impuestos.
          </p>
        </div>
        <div>
          <Label htmlFor="im-nombre">Nombre</Label>
          <Input
            id="im-nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Ingresos Brutos"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="im-desc">Descripción</Label>
          <Input
            id="im-desc"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="im-tipo">Tipo de impuesto</Label>
          <select
            id="im-tipo"
            className={SELECT_CLS}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoImpuesto })}
          >
            {TIPOS_IMPUESTO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="im-estado">Estado</Label>
          <select
            id="im-estado"
            className={SELECT_CLS}
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoImpuesto })}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <Label htmlFor="im-ambito">Ámbito</Label>
          <select
            id="im-ambito"
            className={SELECT_CLS}
            value={form.ambito}
            onChange={(e) => setForm({ ...form, ambito: e.target.value as AmbitoImpuesto })}
          >
            {AMBITOS_IMPUESTO.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">Externo=neutral, Interno=success</p>
        </div>
        {necesitaMonto && (
          <div className="sm:col-span-2">
            <Label htmlFor="im-monto">Monto {form.tipo === "Porcentaje" ? "(%)" : "($)"}</Label>
            <Input
              id="im-monto"
              type="number"
              step="any"
              min="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              placeholder={form.tipo === "Porcentaje" ? "Ej: 35" : "Ej: 0.60"}
            />
            {montoNegativo(form.monto) && (
              <p className="text-xs text-danger-600 mt-1">El monto no puede ser negativo.</p>
            )}
          </div>
        )}
      </div>
      {!valido && (
        <p className="text-xs text-muted-foreground">
          Completá el código y el nombre {necesitaMonto ? "y el monto" : ""} para poder guardar.
        </p>
      )}
    </FormDialog>
  );
}
