import { useState } from "react";
import { Input, Label } from "@/components/portal-shell";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { ApiRestriccion, ApiUsuario, EstadoRestriccion } from "@/lib/api/types";
import { SELECT_CLASS } from "../../listado";
import { restriccionFormInicial, restriccionFormValido, type RestriccionForm } from "../utils";

export function RestriccionFormModal({
  restriccion,
  usuarios,
  onClose,
  onSave,
}: {
  restriccion: ApiRestriccion | null;
  usuarios: ApiUsuario[];
  onClose: () => void;
  onSave: (form: RestriccionForm) => void;
}) {
  const [form, setForm] = useState<RestriccionForm>(() => restriccionFormInicial(restriccion));

  const guardar = () => {
    if (!restriccionFormValido(form)) return;
    onSave(form);
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={restriccion ? "Editar restricción" : "Nueva restricción"}
      description={
        restriccion
          ? `Configuración de la restricción de "${restriccion.apiUsuario?.nombreCompleto}".`
          : "Definí los datos del usuario y la vigencia de la restricción."
      }
      onSubmit={guardar}
      submitLabel={restriccion ? "Guardar cambios" : "Crear restricción"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="re-usuario">Usuario de API</Label>
          <select
            id="re-usuario"
            className={SELECT_CLASS}
            value={form.apiUsuarioId}
            onChange={(e) => setForm((f) => ({ ...f, apiUsuarioId: e.target.value }))}
            disabled={!!restriccion}
          >
            <option value="">Seleccioná un usuario…</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.usuario} · {u.nombreCompleto} · Código #{u.codigoUsuarioApi}
              </option>
            ))}
          </select>
          {!restriccion && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Seleccioná el usuario de API al que aplica la restricción.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="re-estado">Estado</Label>
          <select
            id="re-estado"
            className={SELECT_CLASS}
            value={form.estado}
            onChange={(e) =>
              setForm((f) => ({ ...f, estado: e.target.value as EstadoRestriccion }))
            }
          >
            <option value="Restringiendo">Restringiendo</option>
            <option value="No restringiendo">No restringiendo</option>
          </select>
        </div>
        <div>
          <Label htmlFor="re-expiracion">Fecha de expiración</Label>
          <Input
            id="re-expiracion"
            type="date"
            value={form.fechaExpiracion}
            onChange={(e) => setForm((f) => ({ ...f, fechaExpiracion: e.target.value }))}
          />
        </div>
      </div>
    </FormDialog>
  );
}
