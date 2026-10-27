import { Search } from "lucide-react";
import { FormDialog } from "@/shared/ui/form-dialog";
import { Input, Label } from "@/components/portal-shell";
import type { SubcuentaTipo } from "@/lib/api/subcuentas";
import { TIPO_SUBCUENTA_META } from "../estados";
import type { NuevoCvu } from "../hooks/useNuevoCvu";

export function NuevoCvuDialog({ n }: { n: NuevoCvu }) {
  return (
    <FormDialog
      open={n.showNuevo}
      onClose={() => n.setShowNuevo(false)}
      title="Nuevo CVU"
      description="Crear CVU asociado a un usuario existente (búsqueda rápida por email, funciona con miles)."
      onSubmit={n.crear}
      submitLabel={n.saving ? "Creando..." : "Crear CVU"}
    >
      <div className="relative">
        <Label>Email del usuario</Label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={n.formSearch}
            onChange={(e) => {
              n.setFormSearch(e.target.value);
              n.setFormOpen(true);
              n.setFormEmail(e.target.value);
            }}
            onFocus={() => n.setFormOpen(true)}
            onBlur={() => setTimeout(() => n.setFormOpen(false), 150)}
            placeholder="Buscar por email, legajo o nombre..."
            className="pl-9"
            autoComplete="off"
          />
        </div>
        {n.formOpen && (n.clientesOpt?.length ?? 0) > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-card shadow-lg max-h-60 overflow-auto">
            {(n.clientesOpt ?? []).map((c) => (
              <button
                key={c.legajo}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  n.setFormEmail(c.correo);
                  n.setFormSearch(c.correo);
                  n.setFormOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex flex-col"
              >
                <span className="font-medium">{c.correo}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {c.legajo} · {c.nombre}
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">
          Seleccioná un email de la lista (20 resultados, server-side). Funciona para PF y PJ.
        </p>
      </div>
      <div>
        <Label>Alias (opcional)</Label>
        <Input
          value={n.formAlias}
          onChange={(e) => n.setFormAlias(e.target.value)}
          placeholder="mi.alias (se genera automático si vacío)"
        />
      </div>
      <div>
        <Label>Tipo de cuenta</Label>
        <select
          className="w-full h-10 px-3 rounded-md border bg-card text-sm"
          value={n.formTipo}
          onChange={(e) => n.setFormTipo(e.target.value as SubcuentaTipo)}
        >
          {(Object.keys(TIPO_SUBCUENTA_META) as SubcuentaTipo[]).map((t) => (
            <option key={t} value={t}>
              {TIPO_SUBCUENTA_META[t].label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Operativa: saldo líquido para retiros y transferencias. Recaudación: cobros / ventas.
          Garantías: contracargos y retenciones. Sueldos: nómina y pagos a empleados.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Se generará un CVU de 22 dígitos y alias, y se guardará como subcuenta. Aparecerá en el
        detalle del usuario en Subcuentas y CVUs recientes.
      </p>
    </FormDialog>
  );
}
