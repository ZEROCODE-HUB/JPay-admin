import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { EvaluacionRiesgoRow, RiesgoPLD } from "@/lib/api/clientes";

export function PlaftRiesgoModal({
  open,
  onClose,
  legajo,
  vigente,
  loading,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  legajo: string;
  vigente: EvaluacionRiesgoRow | null;
  loading: boolean;
  onSubmit: (nivel: RiesgoPLD, motivo: string, vigenteHasta: string | null) => void;
}) {
  const [nivel, setNivel] = useState<RiesgoPLD>(vigente?.nivel ?? "bajo");
  const [motivo, setMotivo] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState<string>("");
  const [motivoError, setMotivoError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNivel(vigente?.nivel ?? "bajo");
      setMotivo("");
      setVigenteHasta(vigente?.vigente_hasta ? vigente.vigente_hasta.slice(0, 10) : "");
      setMotivoError(null);
    }
  }, [open, vigente]);

  if (!open) return null;

  const submit = () => {
    if (motivo.trim().length < 10) {
      setMotivoError(
        "Describí brevemente por qué (mín. 10 caracteres). Queda en la auditoría PLAFT.",
      );
      return;
    }
    onSubmit(nivel, motivo.trim(), vigenteHasta || null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-card border shadow-xl p-6 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-lg">Nivel de riesgo PLAFT</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Legajo <span className="font-mono">{legajo}</span>. La evaluación vigente anterior se
            cierra automáticamente; toda la historia queda registrada.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Nivel</label>
          <div className="grid grid-cols-4 gap-2">
            {(["bajo", "medio", "alto", "critico"] as RiesgoPLD[]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNivel(n)}
                className={`h-9 rounded-md border text-xs font-semibold transition-colors ${
                  nivel === n
                    ? n === "bajo"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : n === "medio"
                        ? "bg-amber-500 text-white border-amber-500"
                        : n === "alto"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-danger-500 text-white border-danger-500"
                    : "bg-card hover:bg-accent text-foreground"
                }`}
              >
                {n.charAt(0).toUpperCase() + n.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Motivo / justificación</label>
          <textarea
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (motivoError) setMotivoError(null);
            }}
            placeholder="Ej: Cliente con facturación declarada $X, sin alertas regulatorias. Cumple DDR estándar."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:ring-2 focus:ring-ring/40 outline-none"
          />
          {motivoError && <p className="mt-1 text-xs text-danger-600">{motivoError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Vigente hasta (opcional)</label>
          <input
            type="date"
            value={vigenteHasta}
            onChange={(e) => setVigenteHasta(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring/40 outline-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Si lo dejás vacío, la evaluación queda vigente hasta que se reevalúe.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="h-9 rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Guardando…" : vigente ? "Reevaluar riesgo" : "Asignar riesgo"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
