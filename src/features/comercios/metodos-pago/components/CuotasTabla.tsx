import { Plus, Trash2 } from "lucide-react";
import { Card, Input } from "@/components/portal-shell";
import type { CuotaForm } from "../utils";

/** Tabla editable de cuotas (N°, TEN, coeficiente) del método de pago. */
export function CuotasTabla({
  cuotas,
  loading,
  onAdd,
  onUpdate,
  onRemove,
}: {
  cuotas: CuotaForm[];
  loading: boolean;
  onAdd: () => void;
  onUpdate: (key: string, field: string, value: string) => void;
  onRemove: (key: string) => void;
}) {
  return (
    <Card className="p-5">
      <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        Cuotas
      </h4>
      {loading ? (
        <div className="text-center py-4 text-muted-foreground">Cargando cuotas...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-3 py-2.5 font-display font-semibold text-foreground">
                    N° de cuota
                  </th>
                  <th className="px-3 py-2.5 font-display font-semibold text-foreground">
                    TEN (%)
                  </th>
                  <th className="px-3 py-2.5 font-display font-semibold text-foreground">
                    Coeficiente
                  </th>
                  <th className="px-3 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {cuotas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      Sin cuotas cargadas para este método de pago.
                    </td>
                  </tr>
                ) : (
                  cuotas.map((c) => (
                    <tr key={c.key} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Input
                          aria-label="Número de cuota"
                          value={c.numero}
                          onChange={(e) => onUpdate(c.key, "numero", e.target.value)}
                          className="w-20 h-9"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label="TEN"
                          value={c.ten}
                          onChange={(e) => onUpdate(c.key, "ten", e.target.value)}
                          className="w-28 h-9"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label="Coeficiente"
                          value={c.coeficiente}
                          onChange={(e) => onUpdate(c.key, "coeficiente", e.target.value)}
                          className="w-28 h-9"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => onRemove(c.key)}
                          className="p-1.5 text-danger-600 hover:bg-muted rounded-md"
                          title="Eliminar cuota"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink hover:text-primary-ink/80 transition-colors"
          >
            <Plus size={14} /> Agregar cuota
          </button>
        </>
      )}
    </Card>
  );
}
