import { Loader2, Save } from "lucide-react";
import { useSmvm } from "../hooks/useSmvm";

/** Valor del SMVM: referencia de todas las reglas expresadas en salarios mínimos. */
export function SmvmCard() {
  const { q, valor, setValor, guardando, guardar } = useSmvm();

  return (
    <div className="bg-card border rounded-lg p-6 mb-6">
      <h3 className="font-display text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">
        Salario mínimo vital y móvil (SMVM)
      </h3>
      {q.isError ? (
        <p className="text-xs text-danger-600">No se pudo cargar: {(q.error as Error).message}</p>
      ) : (
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px]">
            <label
              htmlFor="smvm"
              className="block text-xs font-semibold text-muted-foreground mb-1"
            >
              Valor vigente (ARS)
            </label>
            <input
              id="smvm"
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Sin configurar"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <button
            type="button"
            onClick={() => void guardar()}
            disabled={
              guardando || q.isLoading || valor === (q.data && q.data > 0 ? String(q.data) : "")
            }
            className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{" "}
            Guardar SMVM
          </button>
          {q.data === 0 && (
            <p className="w-full text-[11px] font-medium text-amber-700">
              Sin SMVM configurado, las reglas expresadas en salarios mínimos (alertas y bloqueos)
              no se evalúan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
