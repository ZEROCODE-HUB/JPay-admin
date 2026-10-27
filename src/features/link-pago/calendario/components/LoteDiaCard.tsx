import { AlertTriangle, Building2, Zap } from "lucide-react";
import { brand } from "@/brand/brand";
import { Badge, Card } from "@/components/portal-shell";
import type {
  AdelantoParaCalendario,
  CalendarioAcreditacion,
} from "@/lib/api/calendario-acreditaciones";
import { formatMoney, formatPercent } from "@/shared/format";
import { colorEstado } from "../estados";
import { adelantosComprometidos, comisionCierrePct, netoDespuesAdelantos } from "../utils";

function FilaDescuento({ label, monto }: { label: string; monto: number }) {
  return (
    <tr className="text-danger-600">
      <td className="py-1">{label}</td>
      <td className="text-right">-{formatMoney(monto)}</td>
      <td className="text-right" />
    </tr>
  );
}

/** Desglose de un lote dentro del modal del día. */
export function LoteDiaCard({
  it,
  tieneAd,
  adelantos,
  minMonto,
  onAdelantar,
}: {
  it: CalendarioAcreditacion;
  tieneAd: boolean;
  adelantos: AdelantoParaCalendario[];
  minMonto: number;
  onAdelantar: (adelantoId?: string) => void;
}) {
  const color = colorEstado(it.estadoCalculado);
  const neto = netoDespuesAdelantos(it);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 size={16} className="text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{it.comercioNombre}</div>
            <div className="text-xs text-muted-foreground">
              {it.comercioLegajo} · {it.bandera} · {it.codigo}
            </div>
          </div>
        </div>
        <Badge className={`${color.bg} ${color.text}`}>{color.label}</Badge>
      </div>

      {/* Banner amarillo: si hay adelanto aprobado/pendiente */}
      {tieneAd && (
        <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-700">
            <AlertTriangle size={12} /> Adelanto comprometido
          </div>
          <div className="text-amber-700 mt-1">
            {adelantosComprometidos(adelantos).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onAdelantar(a.id)}
                className="block w-full text-left hover:underline"
              >
                {a.estado} · {formatMoney(a.montoPorAcreditar ?? a.montoSolicitado)} · Tkt #
                {a.id.slice(0, 8).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de desglose */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-1 font-medium">Concepto</th>
              <th className="text-right py-1 font-medium">Importe</th>
              <th className="text-right py-1 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr>
              <td className="py-1">Importe bruto del lote</td>
              <td className="text-right">{formatMoney(it.importeBruto)}</td>
              <td className="text-right text-muted-foreground">{it.cantidadOperaciones} ops</td>
            </tr>
            <FilaDescuento
              label={`(-) Comisión ${brand.name} (${formatPercent(it.tasaPropiaPct)})`}
              monto={it.tasaPropiaMonto}
            />
            <FilaDescuento
              label={`(-) Comisión PayWay (${formatPercent(it.tasaPaywayPct)})`}
              monto={it.tasaPaywayMonto}
            />
            <FilaDescuento
              label={`(-) Comisión cierre de lote (${formatPercent(comisionCierrePct(it))})`}
              monto={it.comisionCierreLoteMonto}
            />
            <FilaDescuento label="(-) Impuestos" monto={it.impuestos} />
            {it.contracargoMonto > 0 && (
              <FilaDescuento label="(-) Contracargo" monto={it.contracargoMonto} />
            )}
            {it.adelantosAplicadosDia > 0 && (
              <tr className="text-amber-700">
                <td className="py-1">(-) Adelanto aplicado a este día</td>
                <td className="text-right">-{formatMoney(it.adelantosAplicadosDia)}</td>
                <td className="text-right" />
              </tr>
            )}
            <tr className="border-t-2 font-semibold">
              <td className="py-1.5">= Neto a depositar</td>
              <td className="text-right text-emerald-700">{formatMoney(neto)}</td>
              <td className="text-right" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Acciones */}
      {it.estadoCalculado === "programado" && !tieneAd && (
        <div className="mt-3 pt-3 border-t flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground mr-auto">
            {neto < minMonto
              ? `Remanente < ${formatMoney(minMonto)} (cupo agotado)`
              : "100% disponible para adelanto"}
          </span>
          <button
            type="button"
            onClick={() => onAdelantar()}
            disabled={neto < minMonto}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap size={12} /> Adelantar
          </button>
        </div>
      )}
    </Card>
  );
}
