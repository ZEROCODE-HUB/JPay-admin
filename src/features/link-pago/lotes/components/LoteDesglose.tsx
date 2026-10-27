import type { ReactNode } from "react";
import { CreditCard, Percent, Receipt } from "lucide-react";
import { brand } from "@/brand/brand";
import { Badge, Card } from "@/components/portal-shell";
import type { LoteAcreditacion } from "@/lib/api/types";
import { formatDateTime, formatMoney, formatPercent } from "@/shared/format";
import {
  comisionCierrePct,
  esLoteEstimado,
  impuestosLote,
  tasasCalculadas,
  totalDescuentos,
} from "../utils";

function Linea({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground flex items-center gap-1">{label}</span>
      {children}
    </div>
  );
}

function Descuento({ monto }: { monto: number }) {
  return <span className="font-mono text-danger-600">- {formatMoney(monto)}</span>;
}

/** Impuestos del lote: snapshots reales del motor de retenciones o el legacy. */
function LineasImpuestos({ lote, estimado }: { lote: LoteAcreditacion; estimado: boolean }) {
  const { iva, debitoCredito, iibb, legacy, totalReal, usarLegacy, total } = impuestosLote(lote);
  return (
    <>
      {iva > 0 && (
        <Linea
          label={
            <>
              <Receipt size={12} /> IVA
              {lote.tasaPropiaPct > 0 && (
                <span className="text-[10px] text-muted-foreground/70">
                  ({formatPercent((iva / Math.max(lote.tasaPropiaMonto, 0.01)) * 100, 0)}
                  s/comision)
                </span>
              )}
            </>
          }
        >
          <Descuento monto={iva} />
        </Linea>
      )}
      {debitoCredito > 0 && (
        <Linea
          label={
            <>
              <Receipt size={12} /> Débito/Crédito
            </>
          }
        >
          <Descuento monto={debitoCredito} />
        </Linea>
      )}
      {iibb > 0 && (
        <Linea
          label={
            <>
              <Receipt size={12} /> Ingresos Brutos
            </>
          }
        >
          <Descuento monto={iibb} />
        </Linea>
      )}
      {usarLegacy && (
        <Linea
          label={
            <>
              <Receipt size={12} /> Impuestos
              <span className="text-[10px] text-muted-foreground/70">(legacy)</span>
            </>
          }
        >
          <Descuento monto={legacy} />
        </Linea>
      )}
      {totalReal === 0 && !usarLegacy && (
        <Linea
          label={
            <>
              <Receipt size={12} /> Impuestos
            </>
          }
        >
          <span className="font-mono text-muted-foreground/60">- $ 0,00</span>
        </Linea>
      )}
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Menos impuestos</span>
        <span className={`font-mono ${estimado ? "text-muted-foreground/70" : ""}`}>
          {formatMoney(lote.importeBruto - total)}
        </span>
      </div>
    </>
  );
}

/** Card "Detalle financiero del lote" del modal de detalle. */
export function LoteDesglose({ lote }: { lote: LoteAcreditacion }) {
  const contracargo = lote.contracargoMonto ?? 0;
  const comisionCierre = lote.comisionCierreLoteMonto ?? 0;
  const loteEstimado = esLoteEstimado(lote);
  const { paywayMonto, propiaMonto } = tasasCalculadas(lote);
  const esCuotas = (lote.cuotas ?? 1) > 1;
  const esContracargo = lote.estado === "Contracargo" || contracargo > 0;
  const tonoTasa = loteEstimado ? "text-muted-foreground/60" : "text-danger-600";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Detalle financiero del lote
        </h4>
        {loteEstimado && <Badge tone="neutral">Proyección — sujeto al CSV de Payway</Badge>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Importe bruto</span>
          <span
            className={`font-mono font-semibold ${loteEstimado ? "text-muted-foreground/70" : ""}`}
          >
            {formatMoney(lote.importeBruto)}
            {loteEstimado && (
              <span className="ml-1 text-[10px] text-muted-foreground/70">(Est.)</span>
            )}
          </span>
        </div>
        <LineasImpuestos lote={lote} estimado={loteEstimado} />
        <div className="border-t my-2" />
        <Linea
          label={
            <>
              <Percent size={12} /> Tasa de interés PayWay ({lote.tasaPaywayPct}%)
            </>
          }
        >
          <span className={`font-mono ${tonoTasa}`}>- {formatMoney(paywayMonto)}</span>
        </Linea>
        <Linea
          label={
            <>
              <Percent size={12} /> Tasa de interés {brand.name} ({lote.tasaPropiaPct}%)
            </>
          }
        >
          <span className={`font-mono ${tonoTasa}`}>- {formatMoney(propiaMonto)}</span>
        </Linea>
        {esCuotas && lote.costoPaywayPagoUnico != null && (
          <Linea
            label={
              <>
                <CreditCard size={12} /> Costo PayWay por pago único ({lote.cuotas} cuotas)
              </>
            }
          >
            <span className={`font-mono ${tonoTasa}`}>
              - {formatMoney(lote.costoPaywayPagoUnico)}
            </span>
          </Linea>
        )}
        <Linea
          label={
            <>
              <Percent size={12} /> Comisión cierre de lote ({comisionCierrePct(lote)}%)
            </>
          }
        >
          {loteEstimado ? (
            <span className="font-mono text-muted-foreground/60">
              $ 0,00 <span className="text-[10px]">— Pendiente de cierre</span>
            </span>
          ) : (
            <Descuento monto={comisionCierre} />
          )}
        </Linea>
        {esContracargo && (
          <Linea
            label={
              <>
                <Receipt size={12} /> Contracargo{" "}
                <Badge tone="danger" className="ml-1">
                  retenido
                </Badge>
              </>
            }
          >
            <Descuento monto={contracargo} />
          </Linea>
        )}
        {esCuotas && (
          <p className="text-[11px] text-muted-foreground">
            Si el comprador paga en cuotas, PayWay acredita a {brand.name} en un solo pago y cobra
            fee por esa liquidación.
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Tasa {brand.name} = tasa cobrada al comercio − tasa PayWay a {brand.name} (neto).
        </p>
        {loteEstimado && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
            El 0,45% de cierre de lote se calcula y debita únicamente al confirmar la liquidación
            (estado Pendiente → Acreditado). Hasta entonces los importes son una proyección.
          </p>
        )}
        <div className="border-t my-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Total descuentos</span>
          <span className={`font-mono ${loteEstimado ? "text-muted-foreground/70" : ""}`}>
            - {formatMoney(totalDescuentos(lote))}
          </span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Importe final a acreditar</span>
          <span
            className={`font-mono flex items-center gap-1.5 ${
              lote.estado === "Contracargo"
                ? "text-danger-600"
                : loteEstimado
                  ? "text-muted-foreground/80"
                  : "text-emerald-700"
            }`}
          >
            {formatMoney(lote.importeNeto)}
            {loteEstimado && <Badge tone="neutral">Est.</Badge>}
          </span>
        </div>
        {esContracargo && (
          <p className="text-xs text-danger-700 bg-danger-50 border border-danger-200 rounded px-2 py-1.5 mt-2">
            Incluye contracargo ({formatMoney(contracargo)} retenido): el lote descuenta ese pago.
          </p>
        )}
        {lote.notasResolucion && (
          <p className="text-xs text-muted-foreground border rounded px-2 py-1.5 mt-2 whitespace-pre-wrap">
            Notas: {lote.notasResolucion}
          </p>
        )}
        {lote.resueltoPor && (
          <p className="text-[11px] text-muted-foreground">
            Resuelto por {lote.resueltoPor}{" "}
            {lote.fechaResolucion ? `· ${formatDateTime(lote.fechaResolucion)}` : ""}
          </p>
        )}
      </div>
    </Card>
  );
}
