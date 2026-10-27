import { AlertTriangle, Info, Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/portal-shell";
import { GROUPS } from "../config";
import { useParametrosAlertas } from "../hooks/useParametrosAlertas";
import { ReglaEditor } from "./ReglaEditor";

/** Configuración de umbrales que activan alertas (solo notifican, no bloquean). */
export function ParametrosAlertasPage() {
  const s = useParametrosAlertas();

  return (
    <>
      <PageHeader
        title="Parámetros de alertas"
        description="Configuración de umbrales que activan alertas (solo notifican, no bloquean)"
      />

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex gap-3">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          Una <strong>alerta</strong> solo notifica y queda pendiente de revisión manual. No
          suspende la cuenta automáticamente.
        </div>
      </div>

      {s.isLoading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin mr-2" /> Cargando configuración…
        </div>
      ) : s.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 px-6 py-10 text-center text-sm text-danger-700">
          <AlertTriangle size={24} />
          <p>No se pudo cargar la configuración: {(s.error as Error)?.message}</p>
          <button
            type="button"
            onClick={() => s.refetch()}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-4 md:p-6">
          {s.faltantes.length > 0 && (
            <div className="mb-4 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
              Faltan reglas en la base ({s.faltantes.join(", ")}). Aplicá la migración de
              configuración de alertas.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GROUPS.map((g) => (
              <div
                key={g.title}
                className={
                  g.full
                    ? "break-inside-avoid md:col-span-2 lg:col-span-full"
                    : "break-inside-avoid"
                }
              >
                <h4 className="font-display text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
                  {g.title}
                </h4>
                <div className="space-y-3">
                  {g.rules.map((rv) => {
                    const d = s.draft[rv.code];
                    if (!d) return null;
                    return (
                      <ReglaEditor
                        key={rv.code}
                        rv={rv}
                        d={d}
                        errores={s.errores}
                        patch={s.patch}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border">
            {!s.sinCambios && (
              <span className="text-xs text-muted-foreground">Hay cambios sin guardar</span>
            )}
            <button
              type="button"
              onClick={() => void s.guardar()}
              disabled={s.guardando || s.sinCambios}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {s.guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {s.guardando ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
