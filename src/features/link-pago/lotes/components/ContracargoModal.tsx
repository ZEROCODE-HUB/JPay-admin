import { Input, Label } from "@/components/portal-shell";
import { formatMoney } from "@/shared/format";
import type { ContracargoDraft } from "../hooks/useLotesAcciones";
import { esMontoValido, netoConContracargo } from "../utils";

/** Modal "Resolver contracargo": monto opcional + notas, y acredita el lote. */
export function ContracargoModal({
  draft,
  onChange,
  onClose,
  onConfirm,
}: {
  draft: ContracargoDraft;
  onChange: (d: ContracargoDraft) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { lote } = draft;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-md shadow-xl p-6 space-y-4">
        <h3 className="font-display font-semibold text-lg">Resolver contracargo — {lote.codigo}</h3>
        <p className="text-sm text-muted-foreground">
          Lote {lote.bandera} · {lote.comercio?.nombreComercio ?? lote.comercio?.usuario} ·
          Contracargo actual {formatMoney(lote.contracargoMonto)}.
        </p>
        <div>
          <Label>Contracargo monto (opcional, recalcula neto)</Label>
          <Input
            value={draft.contracargoMonto}
            onChange={(e) => {
              const v = e.target.value;
              if (esMontoValido(v)) onChange({ ...draft, contracargoMonto: v });
            }}
            placeholder="0.00"
            className="font-mono"
            inputMode="decimal"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Neto recalculado: {formatMoney(netoConContracargo(lote, draft.contracargoMonto))}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold">Notas</label>
          <textarea
            value={draft.notas}
            onChange={(e) => onChange({ ...draft, notas: e.target.value })}
            rows={3}
            placeholder="Motivo, ticket PayWay, notas internas..."
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-3 rounded-md border bg-card text-sm">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 rounded-md text-sm font-semibold bg-primary text-primary-foreground"
          >
            Acreditar
          </button>
        </div>
      </div>
    </div>
  );
}
