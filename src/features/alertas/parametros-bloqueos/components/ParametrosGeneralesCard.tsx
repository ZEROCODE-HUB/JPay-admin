import { AlertTriangle, Loader2, Save } from "lucide-react";
import type { ParametrosGenerales } from "../hooks/useParametrosGenerales";

const CAMPOS = [
  [
    "persona",
    "Cantidad de salarios mínimos depositados por persona",
    "Si una persona física supera este acumulado de depósitos, la cuenta se bloquea automáticamente.",
  ],
  [
    "empresa",
    "Cantidad de salarios mínimos depositados por empresa",
    "Si una persona jurídica supera este acumulado de depósitos, la cuenta se bloquea automáticamente.",
  ],
] as const;

/** Tarjeta "Parámetros generales de bloqueos" (umbrales de la regla global). */
export function ParametrosGeneralesCard({ g }: { g: ParametrosGenerales }) {
  const { reglas, regla, params, setParams, errGen, guardandoGen, genSinCambios, pais, setPais } =
    g;

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="font-display text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">
        Parámetros generales de bloqueos
      </h3>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="bloqueos-pais" className="font-medium">
          País
        </label>
        <select
          id="bloqueos-pais"
          className="h-9 rounded-md border border-input bg-card px-2 text-sm"
          value={pais ?? ""}
          disabled={!genSinCambios}
          onChange={(e) => setPais(e.target.value || null)}
        >
          <option value="">Argentina (valores generales)</option>
          <option value="MX">México</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {pais === "MX"
            ? "En México los umbrales se cuentan en UMAs mensuales (no en salarios mínimos)."
            : "En salarios mínimos (SMVM). Rigen para todo país sin valores propios."}
        </span>
      </div>
      {reglas.isLoading ? (
        <div className="flex items-center text-sm text-muted-foreground py-4">
          <Loader2 size={14} className="animate-spin mr-2" /> Cargando…
        </div>
      ) : reglas.isError || !regla ? (
        <div className="flex items-center gap-2 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
          <AlertTriangle size={14} />
          {reglas.isError
            ? `No se pudo cargar: ${(reglas.error as Error).message}`
            : "Falta la regla de bloqueo en la base: aplicá la migración de configuración de alertas."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CAMPOS.map(([k, label, ayuda]) => (
              <div key={k}>
                <label
                  htmlFor={`gen-${k}`}
                  className="block text-xs font-semibold text-muted-foreground mb-1"
                >
                  {label}
                </label>
                <input
                  id={`gen-${k}`}
                  type="number"
                  min={0}
                  step={1}
                  value={params[k]}
                  onChange={(e) => setParams((p) => ({ ...p, [k]: e.target.value }))}
                  aria-invalid={Boolean(errGen[k])}
                  className={`w-full h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 ${errGen[k] ? "border-danger-400" : "border-input"}`}
                />
                {errGen[k] ? (
                  <p className="text-[11px] font-medium text-danger-600 mt-1">{errGen[k]}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-1">{ayuda}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => void g.guardarGenerales()}
              disabled={guardandoGen || genSinCambios}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {guardandoGen ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {guardandoGen ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
