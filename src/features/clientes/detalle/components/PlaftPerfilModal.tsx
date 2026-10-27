import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { monedaActiva } from "@/shared/format";
export function PlaftPerfilModal({
  open,
  onClose,
  clienteId,
  idFiscal,
  initial,
  loading,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  /** Identificador fiscal con su etiqueta ("RFC …", "CUIT …"). */
  idFiscal: string;
  initial: {
    limiteTransferencia: number | null;
    limiteOpsDiarias: number | null;
    limiteMontoDiario: number | null;
  };
  loading: boolean;
  onSubmit: (input: {
    limiteTransferencia: number | null;
    limiteOpsDiarias: number | null;
    limiteMontoDiario: number | null;
  }) => void;
}) {
  const [limiteTransferencia, setLimiteTransferencia] = useState<string>(
    initial.limiteTransferencia != null ? String(initial.limiteTransferencia) : "",
  );
  const [limiteOpsDiarias, setLimiteOpsDiarias] = useState<string>(
    initial.limiteOpsDiarias != null ? String(initial.limiteOpsDiarias) : "",
  );
  const [limiteMontoDiario, setLimiteMontoDiario] = useState<string>(
    initial.limiteMontoDiario != null ? String(initial.limiteMontoDiario) : "",
  );

  useEffect(() => {
    if (open) {
      setLimiteTransferencia(
        initial.limiteTransferencia != null ? String(initial.limiteTransferencia) : "",
      );
      setLimiteOpsDiarias(initial.limiteOpsDiarias != null ? String(initial.limiteOpsDiarias) : "");
      setLimiteMontoDiario(
        initial.limiteMontoDiario != null ? String(initial.limiteMontoDiario) : "",
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = () => {
    const parse = (v: string) => (v.trim() === "" ? null : Number(v.replace(/[^\d.-]/g, "")));
    onSubmit({
      limiteTransferencia: parse(limiteTransferencia),
      limiteOpsDiarias: parse(limiteOpsDiarias),
      limiteMontoDiario: parse(limiteMontoDiario),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-card border shadow-xl p-6 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-lg">Perfil transaccional</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cliente <span className="font-mono">{clienteId.slice(0, 8)}…</span> · {idFiscal}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Monto máximo por transferencia ({monedaActiva()})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={limiteTransferencia}
              onChange={(e) => setLimiteTransferencia(e.target.value)}
              placeholder="Sin límite"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm w-full focus:ring-2 focus:ring-ring/40 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Operaciones diarias máx.</label>
              <input
                type="text"
                inputMode="numeric"
                value={limiteOpsDiarias}
                onChange={(e) => setLimiteOpsDiarias(e.target.value)}
                placeholder="Sin límite"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm w-full focus:ring-2 focus:ring-ring/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Monto diario máx. ({monedaActiva()})
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={limiteMontoDiario}
                onChange={(e) => setLimiteMontoDiario(e.target.value)}
                placeholder="Sin límite"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm w-full focus:ring-2 focus:ring-ring/40 outline-none"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          El motor de alertas (cuando esté activo) comparará estas cifras con los movimientos del
          cliente y disparará automáticamente alertas de exceso / variación cuando corresponda.
        </p>

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
            {loading ? "Guardando…" : "Guardar perfil"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
