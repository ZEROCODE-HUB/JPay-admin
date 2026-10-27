import { Badge, Card } from "@/components/portal-shell";
import type { PoolRecaudacion } from "@/lib/api/adelantos";
import type { EstadoAdelanto } from "@/lib/api/types";
import { formatMoney } from "@/shared/format";
import { CUPO_BORDE, CUPO_TEXTO, ESTADOS, nivelCupoPool, toneAdelanto } from "../estados";
import type { TotalEstado } from "../utils";

/**
 * Cards de Pool de Recaudación (KPIs globales). Siempre visibles en la
 * cabecera para que el operador vea el estado del pool antes de evaluar
 * acreditar cualquier adelanto.
 */
export function PoolKpis({ pool }: { pool: PoolRecaudacion | undefined }) {
  const nivel = nivelCupoPool(pool?.cupoDisponiblePool ?? 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <Card className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          Pool de Recaudación (plataforma)
        </div>
        <div className="font-mono text-2xl font-semibold mt-1">
          {pool ? formatMoney(pool.poolRecaudacionTotal) : "—"}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Suma de saldo_disponible de todas las subcuentas tipo=Recaudación. Es la única fuente de
          fondeo para los adelantos.
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          Adelantos en curso
        </div>
        <div className="font-mono text-2xl font-semibold mt-1">
          {pool ? formatMoney(pool.adelantosEnCurso) : "—"}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Capital prestado pendiente de reponer: Aprobados (aún no desembolsados) + Acreditados (aún
          no repuestos por el lote real de Payway).
        </div>
      </Card>
      <Card className={"p-4 border-l-4 " + CUPO_BORDE[nivel]}>
        <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center justify-between">
          <span>Cupo disponible del pool</span>
          {nivel === "sin-liquidez" && (
            <span className="text-danger-600 font-semibold">⚠ Sin liquidez</span>
          )}
        </div>
        <div className={"font-mono text-2xl font-semibold mt-1 " + CUPO_TEXTO[nivel]}>
          {pool ? formatMoney(pool.cupoDisponiblePool) : "—"}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Pool − Adelantos en curso. Define si se puede seguir Acreditando.
        </div>
      </Card>
    </div>
  );
}

/** Cards de totales por estado (cantidad + monto reservado). */
export function TotalesEstadoKpis({ totales }: { totales: Record<EstadoAdelanto, TotalEstado> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      {ESTADOS.map((s) => {
        const t = totales[s];
        return (
          <Card key={s} className="p-3">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{s}</span>
              <Badge tone={toneAdelanto(s)}>{t.cantidad}</Badge>
            </div>
            <div className="font-mono text-lg font-semibold mt-1">
              {t.monto > 0 ? formatMoney(t.monto) : "—"}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
