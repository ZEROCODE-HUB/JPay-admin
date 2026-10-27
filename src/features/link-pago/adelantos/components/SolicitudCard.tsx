import { Banknote, Building2, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/portal-shell";
import { formatMoney } from "@/shared/format";
import { interesAdelanto, type AdelantoUI } from "../utils";

/** Datos de la solicitud de adelanto. */
export function SolicitudCard({ a }: { a: AdelantoUI }) {
  return (
    <Card className="p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Solicitud
      </h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground flex items-center gap-1">
            <Building2 size={12} /> Comercio
          </span>
          <div className="font-semibold truncate">{a.comercio}</div>
          <div className="font-mono text-xs text-muted-foreground">{a.legajo}</div>
        </div>
        <div>
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> Fecha solicitud
          </span>
          <div className="font-mono">{a.fechaSolicitud}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Importe solicitado</span>
          <div className="font-mono font-semibold text-base">
            {formatMoney(a.importeSolicitado)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock size={12} /> Plazo solicitado
          </span>
          <div className="font-semibold">{a.plazoSolicitado}</div>
          <div className="text-xs text-muted-foreground">Contractual: {a.plazoContractual}</div>
        </div>
        {a.motivo && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Motivo</span>
            <div className="text-sm whitespace-pre-wrap">{a.motivo}</div>
          </div>
        )}
        {a.fechaResolucion && (
          <div>
            <span className="text-muted-foreground">Fecha resolución</span>
            <div className="font-mono text-xs">{a.fechaResolucion}</div>
          </div>
        )}
        {a.fechaAcreditacion && (
          <div>
            <span className="text-muted-foreground">Fecha acreditación</span>
            <div className="font-mono text-xs">{a.fechaAcreditacion}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

/** Detalle del movimiento de saldo — sólo visible si ya se acreditó. */
export function MovimientoSaldoCard({ a }: { a: AdelantoUI }) {
  const interes = interesAdelanto(a.importeSolicitado, a.tasaInteresPct ?? 0);
  return (
    <Card className="p-4 border-l-4 border-l-emerald-500">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
        <Banknote size={14} className="text-emerald-600" /> Movimiento de saldo
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-muted-foreground">Origen (Recaudación)</div>
        <div className="font-mono text-danger-600 text-right">
          - {formatMoney(a.importeSolicitado)}
        </div>
        <div className="text-muted-foreground">Interés (TEM {a.tasaInteresPct ?? 0}%)</div>
        <div className="font-mono text-danger-600 text-right">- {formatMoney(interes)}</div>
        <div className="text-muted-foreground font-semibold">Neto a Operativa</div>
        <div className="font-mono text-emerald-700 text-right font-semibold">
          + {formatMoney(a.importeSolicitado - interes)}
        </div>
      </div>
    </Card>
  );
}
