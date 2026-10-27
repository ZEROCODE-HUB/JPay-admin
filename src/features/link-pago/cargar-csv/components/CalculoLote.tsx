import { ShieldCheck, ShieldOff } from "lucide-react";
import { brand } from "@/brand/brand";
import { Badge, Input, Label } from "@/components/portal-shell";
import type { RetencionDetalle } from "@/lib/api/retenciones-lote";
import type { LoteAcreditacion } from "@/lib/api/types";
import type { PreviewAcreditacion } from "@/lib/liquidaciones/acreditacion";
import { formatMoney } from "@/shared/format";
import type { CargarCsvState } from "../hooks/useCargarCsv";
import { importeNetoFinal, numeroDeInput } from "../utils";

function CalcRow({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "subtract" | "total";
  hint?: string;
}) {
  const color =
    tone === "total"
      ? "font-semibold text-foreground"
      : tone === "subtract"
        ? "text-danger-600"
        : "";
  return (
    <div className="flex items-start justify-between gap-3 text-sm py-1">
      <span className="text-muted-foreground">
        {label}
        {hint && <span className="block text-[11px] opacity-80">{hint}</span>}
      </span>
      <span className={`font-mono tabular-nums whitespace-nowrap ${color}`}>{value}</span>
    </div>
  );
}

const BADGE = "inline-flex items-center gap-1 text-[10px]";

/** Fila de retención calculada por el motor, con el badge de asignación. */
function RetencionRow({
  label,
  detalle,
  monto,
  sinAsignar,
}: {
  label: string;
  detalle: RetencionDetalle;
  monto: number;
  /** Texto del badge cuando no está asignado ("No asignado" / "Manual"). */
  sinAsignar: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm py-1">
      <span className="text-muted-foreground flex-1">
        <div className="flex items-center gap-1.5">
          {label}
          {detalle.exento ? (
            <Badge tone="success" className={BADGE}>
              <ShieldCheck size={10} /> Exento
            </Badge>
          ) : detalle.asignado ? (
            <Badge tone="neutral" className={BADGE}>
              <ShieldCheck size={10} /> Asignado
            </Badge>
          ) : (
            <Badge tone="warn" className={BADGE}>
              <ShieldOff size={10} /> {sinAsignar}
            </Badge>
          )}
        </div>
        <span className="block text-[11px] opacity-80">{detalle.motivo}</span>
      </span>
      <span className="font-mono tabular-nums whitespace-nowrap text-danger-600">
        - {formatMoney(monto)}
      </span>
    </div>
  );
}

/** Modo per-lote: desglose del cálculo (comisiones y retenciones) y parámetros editables. */
export function CalculoLote({
  s,
  lote,
  preview,
}: {
  s: CargarCsvState;
  lote: LoteAcreditacion;
  preview: PreviewAcreditacion;
}) {
  const { retenciones, parametros } = s;
  const { totales } = preview;
  return (
    <div className="rounded-lg border p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Cálculo del lote (vista previa)
      </h4>
      <CalcRow
        label="Neto liquidado por Payway"
        value={formatMoney(totales.netoCsv)}
        hint="TOTAL_NETO del CSV"
      />
      <div className="border-t my-1" />
      <CalcRow
        label={`Comisión ${brand.name}`}
        value={`- ${formatMoney(totales.comisionPropia)}`}
        tone="subtract"
        hint={`${lote.tasaPropiaPct}% sobre el neto`}
      />
      <CalcRow
        label="Comisión de cierre de lote"
        value={`- ${formatMoney(totales.comisionCierre)}`}
        tone="subtract"
        hint={`${parametros.comisionCierreLotePct}% — se guarda como snapshot`}
      />
      {retenciones ? (
        <>
          <RetencionRow
            label="Retención débito y crédito"
            detalle={retenciones.debitoCredito}
            monto={retenciones.debitoCredito.monto}
            sinAsignar="No asignado"
          />
          {/* IVA e IIBB no muestran "Exento" (el motor solo exime Débito/Crédito). */}
          <RetencionRow
            label="Retención IVA"
            detalle={{ ...retenciones.iva, exento: false }}
            monto={retenciones.iva.monto}
            sinAsignar="No asignado"
          />
          <RetencionRow
            label="Retención Ingresos Brutos"
            detalle={{ ...retenciones.iibb, exento: false }}
            monto={s.iibbMontoFinal}
            sinAsignar="Manual"
          />
        </>
      ) : (
        <>
          <CalcRow
            label="Retención débito y crédito"
            value={`- ${formatMoney(totales.retencionDebitoCredito)}`}
            tone="subtract"
            hint={`${parametros.retencionDebitoCreditoPct}% (RG 2111/4172)`}
          />
          <CalcRow
            label="Retención IVA"
            value={`- ${formatMoney(totales.retencionIva)}`}
            tone="subtract"
            hint={`${parametros.retencionIvaPct}% sobre la comisión ${brand.name}`}
          />
          <CalcRow
            label="Retención Ingresos Brutos"
            value={`- ${formatMoney(totales.retencionIibb)}`}
            tone="subtract"
            hint="a completar por el operador"
          />
        </>
      )}
      <div className="border-t mt-1 pt-1" />
      <CalcRow
        label="Importe a acreditar (Pendiente)"
        value={formatMoney(importeNetoFinal(totales, retenciones, s.iibbMontoFinal))}
        tone="total"
        hint="se deposita al confirmar Acreditar"
      />

      <div className="mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <Label htmlFor="p-cierre">% cierre lote</Label>
          <Input
            id="p-cierre"
            value={String(parametros.comisionCierreLotePct)}
            onChange={(e) => s.setParam("comisionCierreLotePct", numeroDeInput(e.target.value))}
            inputMode="decimal"
            className="mt-1 font-mono"
          />
        </div>
        <div>
          <Label htmlFor="p-iibb">
            $ IIBB{" "}
            {retenciones?.iibb.asignado && (
              <span className="text-[10px] text-muted-foreground">(calculado)</span>
            )}
          </Label>
          {retenciones?.iibb.asignado ? (
            <div className="mt-1 h-10 px-3 rounded-md border bg-muted/30 text-sm font-mono flex items-center">
              {formatMoney(retenciones.iibb.monto)}
            </div>
          ) : (
            <Input
              id="p-iibb"
              value={String(parametros.retencionIibbMonto)}
              onChange={(e) => s.setParam("retencionIibbMonto", numeroDeInput(e.target.value))}
              inputMode="decimal"
              className="mt-1 font-mono"
            />
          )}
        </div>
        <div>
          <Label>CUIT</Label>
          <div className="mt-1 h-10 px-3 rounded-md border bg-muted/30 text-sm font-mono flex items-center">
            {retenciones?.cuit ?? lote.comercio?.legajo ?? "—"}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Precargados con las retenciones calculadas para el comercio; podés ajustarlos antes de
        guardar. Lo que quede en estos campos es lo que se guarda.
      </p>
    </div>
  );
}
