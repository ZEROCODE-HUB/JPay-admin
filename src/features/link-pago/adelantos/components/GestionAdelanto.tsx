import { Banknote, CheckCircle2, XCircle } from "lucide-react";
import { BtnOutline, BtnPrimary, Card, Input, Label } from "@/components/portal-shell";
import { formatMoney, formatPercent } from "@/shared/format";
import type { AdelantoDetalleState } from "../hooks/useAdelantoDetalle";
import { tnaDesdeTem, type AdelantoUI } from "../utils";

/** Acciones del admin según estado (aprobar / acreditar / rechazar). */
export function GestionAdelanto({
  a,
  d,
  onClose,
}: {
  a: AdelantoUI;
  d: AdelantoDetalleState;
  onClose: () => void;
}) {
  const { busy, poolInsuficiente, tasaPctNum } = d;
  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Gestión (Admin)
      </h4>

      {/* TEM — siempre editable cuando el adelanto no está cerrado */}
      <div>
        <Label htmlFor="tasa-interes">
          Tasa de interés (TEM) — {a.estado === "Aprobado" ? "ajuste" : "requerida para aprobar"}
        </Label>
        <Input
          id="tasa-interes"
          value={d.tasaInteres}
          onChange={(e) => d.setTasaInteres(e.target.value)}
          placeholder="Ej: 4.5"
          className="h-9"
          inputMode="decimal"
        />
        {tasaPctNum != null && tasaPctNum > 0 && (
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-3">
            <span>
              Interés:{" "}
              <span className="font-mono font-semibold text-danger-600">
                - {formatMoney(d.interesEstimado)}
              </span>
            </span>
            <span>
              Neto a depositar:{" "}
              <span className="font-mono font-semibold text-emerald-700">
                {formatMoney(d.netoEstimado)}
              </span>
            </span>
            <span>
              TNA: <span className="font-mono">{formatPercent(tnaDesdeTem(tasaPctNum), 1)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Notas: se concatenan al motivo del adelanto */}
      <div>
        <Label htmlFor="notas">Notas / motivo</Label>
        <textarea
          id="notas"
          value={d.notas}
          onChange={(e) => d.setNotas(e.target.value)}
          rows={2}
          placeholder="Ej. tasa preferencial por volumen, rechazo por tope agotado, etc."
          className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {/* Aprobar (sólo Pendiente) */}
        {a.estado === "Pendiente" && (
          <BtnPrimary disabled={busy} onClick={d.handleAprobar}>
            <CheckCircle2 size={14} className="mr-1" /> Aprobar y ofrecer TEM
          </BtnPrimary>
        )}

        {/* Acreditar (sólo Aprobado) — mueve plata */}
        {a.estado === "Aprobado" && (
          <BtnPrimary
            disabled={busy || poolInsuficiente}
            onClick={d.handleAcreditar}
            className={
              poolInsuficiente
                ? "bg-danger-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }
            title={
              poolInsuficiente
                ? "Pool de Recaudación insuficiente para financiar este adelanto. La RPC rechazará la operación."
                : "Descuenta de la subcuenta Recaudación (pool global) y acredita el neto en la Operativa del comercio"
            }
          >
            <Banknote size={14} className="mr-1" />
            {poolInsuficiente ? "Pool insuficiente" : "Acreditar y mover saldo"}
          </BtnPrimary>
        )}

        {/* Rechazar (Pendiente o Aprobado) */}
        {(a.estado === "Pendiente" || a.estado === "Aprobado") && (
          <BtnOutline
            disabled={busy}
            onClick={d.handleRechazar}
            className="text-danger-600 border-danger-200 hover:bg-danger-50"
          >
            <XCircle size={14} className="mr-1" /> Rechazar
          </BtnOutline>
        )}

        <BtnOutline disabled={busy} onClick={onClose}>
          Cerrar
        </BtnOutline>
      </div>
    </Card>
  );
}
