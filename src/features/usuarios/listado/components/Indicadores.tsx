import { AlertOctagon } from "lucide-react";
import { formatMoney } from "@/shared/format";
import type { RiesgoPLD } from "@/lib/api/clientes";
import { consumoTone, riesgoTone } from "../estados";
import { labelRiesgo } from "../utils";

export function RiesgoBadge({
  nivel,
  motivo,
}: {
  nivel: RiesgoPLD | null;
  motivo?: string | null;
}) {
  if (!nivel) {
    return (
      <span
        title="Cliente sin evaluación PLAFT vigente. Pendiente de revisión."
        className="inline-flex items-center gap-1 text-xs text-muted-foreground italic"
      >
        <AlertOctagon size={12} className="text-muted-foreground" />
        Sin evaluar
      </span>
    );
  }
  const tone = riesgoTone(nivel);
  const label = labelRiesgo(nivel);
  return (
    <span
      title={motivo ?? `Nivel de riesgo PLAFT: ${label}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

export function KycBadge({ completo }: { completo: boolean }) {
  return completo ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium bg-emerald-100 text-emerald-800 border-emerald-200">
      ✓ Validado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium bg-amber-100 text-amber-800 border-amber-200">
      Pendiente
    </span>
  );
}

export function PerfilConsumo({ pct, limite }: { pct: number | null; limite: number | null }) {
  if (pct == null) {
    return (
      <span
        className="text-xs text-muted-foreground italic"
        title="Sin límite operativo configurado"
      >
        —
      </span>
    );
  }
  const tone = consumoTone(pct);
  const fmtLimite = limite ? formatMoney(limite, { decimals: 0 }) : null;
  return (
    <div className="flex flex-col gap-0.5 min-w-[100px]">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{pct}%</span>
        {fmtLimite && <span>{fmtLimite}</span>}
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${tone} transition-all`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
