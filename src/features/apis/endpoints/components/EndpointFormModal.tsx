import { useState } from "react";
import { Input, Label } from "@/components/portal-shell";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { ApiEndpoint, EstadoEndpoint, GrupoEndpoint, MetodoHttp } from "@/lib/api/types";
import { GRUPOS_ENDPOINT, METODOS_HTTP } from "@/lib/api/types";
import { SELECT_CLASS } from "../../listado";
import { endpointFormInicial, endpointFormValido, type EndpointForm } from "../utils";

export function EndpointFormModal({
  endpoint,
  onClose,
  onSave,
}: {
  endpoint: ApiEndpoint | null;
  onClose: () => void;
  onSave: (form: EndpointForm) => void;
}) {
  const [form, setForm] = useState<EndpointForm>(() => endpointFormInicial(endpoint));

  const guardar = () => {
    if (!endpointFormValido(form)) return;
    onSave(form);
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={endpoint ? "Editar endpoint" : "Nuevo endpoint"}
      description={
        endpoint
          ? `Configuración del endpoint "${endpoint.nombre}".`
          : "Complete los datos para crear un nuevo endpoint."
      }
      onSubmit={guardar}
      submitLabel={endpoint ? "Guardar cambios" : "Crear endpoint"}
      size="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="ep-nombre">Nombre del endpoint</Label>
          <Input
            id="ep-nombre"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ep-path">Path</Label>
          <Input
            id="ep-path"
            value={form.path}
            onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
            className="font-mono"
          />
        </div>
        <div>
          <Label htmlFor="ep-tipo">Tipo de endpoint</Label>
          <select
            id="ep-tipo"
            className={SELECT_CLASS}
            value={form.metodo}
            onChange={(e) => setForm((f) => ({ ...f, metodo: e.target.value as MetodoHttp }))}
          >
            {METODOS_HTTP.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="ep-grupo">Grupo de endpoints</Label>
          <select
            id="ep-grupo"
            className={SELECT_CLASS}
            value={form.grupo}
            onChange={(e) => setForm((f) => ({ ...f, grupo: e.target.value as GrupoEndpoint }))}
          >
            {GRUPOS_ENDPOINT.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ep-desc">Descripción</Label>
          <Input
            id="ep-desc"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="ep-estado">Estado</Label>
          <select
            id="ep-estado"
            className={SELECT_CLASS}
            value={form.estado}
            onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoEndpoint }))}
          >
            <option value="Habilitado">Habilitado</option>
            <option value="Deshabilitado">Deshabilitado</option>
          </select>
        </div>
        <div>
          <Label htmlFor="ep-rec">REC</Label>
          <select
            id="ep-rec"
            className={SELECT_CLASS}
            value={form.rec ? "true" : "false"}
            onChange={(e) => setForm({ ...form, rec: e.target.value === "true" })}
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
    </FormDialog>
  );
}
