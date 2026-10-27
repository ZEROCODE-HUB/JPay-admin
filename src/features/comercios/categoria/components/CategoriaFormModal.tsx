import { useState } from "react";
import { FormDialog } from "@/shared/ui/form-dialog";
import { Input, Label } from "@/components/portal-shell";
import type { CodigoCategoria } from "@/lib/api/types";
import { categoriaFormInicial, categoriaFormValido, type CategoriaForm } from "../utils";

export function CategoriaFormModal({
  categoria,
  onClose,
  onSave,
}: {
  categoria: CodigoCategoria | null;
  onClose: () => void;
  onSave: (form: CategoriaForm) => void;
}) {
  const [form, setForm] = useState<CategoriaForm>(() => categoriaFormInicial(categoria));

  const guardar = () => {
    if (!categoriaFormValido(form)) return;
    onSave(form);
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={categoria ? "Editar categoría" : "Nueva categoría"}
      description={
        categoria
          ? `Modificá los datos de la categoría ${categoria.codigo}.`
          : "Complete los datos para crear una nueva categoría."
      }
      onSubmit={guardar}
      submitLabel={categoria ? "Guardar cambios" : "Crear categoría"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cat-codigo">Código</Label>
          <Input
            id="cat-codigo"
            value={form.codigo}
            onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
            placeholder="CAT-XXX"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Debe ser único: no puede coincidir con el código de otra categoría.
          </p>
        </div>
        <div>
          <Label htmlFor="cat-nombre">Nombre</Label>
          <Input
            id="cat-nombre"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre de la categoría"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cat-descripcion">Descripción</Label>
          <Input
            id="cat-descripcion"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            placeholder="Descripción breve"
          />
        </div>
      </div>
    </FormDialog>
  );
}
