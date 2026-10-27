import { useState } from "react";
import { brand } from "@/brand/brand";
import { Input, Label } from "@/components/portal-shell";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { ApiUsuario, EstadoApiUsuario } from "@/lib/api/types";
import { ESTADOS_API_USUARIO } from "@/lib/api/types";
import { SELECT_CLASS } from "../../listado";
import { usuarioFormInicial, usuarioFormValido, type UsuarioForm } from "../utils";

export function UsuarioFormModal({
  usuario,
  onClose,
  onSave,
}: {
  usuario: ApiUsuario | null;
  onClose: () => void;
  onSave: (form: UsuarioForm) => void;
}) {
  const [form, setForm] = useState<UsuarioForm>(() => usuarioFormInicial(usuario));

  const guardar = () => {
    if (!usuarioFormValido(form)) return;
    onSave(form);
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={usuario ? "Editar usuario de API" : "Nuevo usuario de API"}
      description={
        usuario
          ? `Configuración del usuario ${usuario.usuario}.`
          : "Complete los datos para crear un nuevo usuario de API."
      }
      onSubmit={guardar}
      submitLabel={usuario ? "Guardar cambios" : "Crear usuario"}
      size="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="au-codigo">Código de usuario API</Label>
          <Input
            id="au-codigo"
            value={form.codigoUsuarioApi}
            onChange={(e) => setForm((f) => ({ ...f, codigoUsuarioApi: e.target.value }))}
            placeholder="1001"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Debe ser único: no puede coincidir con el código de otro usuario de API.
          </p>
        </div>
        <div>
          <Label htmlFor="au-usuario">Usuario (email)</Label>
          <Input
            id="au-usuario"
            value={form.usuario}
            onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
            placeholder={`afip@${brand.web.domain}`}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="au-nombre">Nombre completo</Label>
          <Input
            id="au-nombre"
            value={form.nombreCompleto}
            onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
            placeholder="Integración AFIP"
          />
        </div>
        <div>
          <Label htmlFor="au-estado">Estado</Label>
          <select
            id="au-estado"
            className={SELECT_CLASS}
            value={form.estado}
            onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoApiUsuario }))}
          >
            {ESTADOS_API_USUARIO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>
    </FormDialog>
  );
}
