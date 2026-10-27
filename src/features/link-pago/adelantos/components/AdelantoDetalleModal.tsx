import { Wallet } from "lucide-react";
import { Badge, Card } from "@/components/portal-shell";
import { toneAdelanto } from "../estados";
import { useAdelantoDetalle } from "../hooks/useAdelantoDetalle";
import { shortId, type AdelantoUI } from "../utils";
import { PoolBanner, TopeBanner } from "./DetalleBanners";
import { GestionAdelanto } from "./GestionAdelanto";
import { MovimientoSaldoCard, SolicitudCard } from "./SolicitudCard";

/** Modal de gestión de un adelanto. */
export function AdelantoDetalleModal({
  a,
  onClose,
  onSave,
  onAcreditado,
}: {
  a: AdelantoUI;
  onClose: () => void;
  onSave: () => void;
  onAcreditado: () => void;
}) {
  const d = useAdelantoDetalle(a, { onClose, onSave, onAcreditado });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Wallet size={18} /> Adelanto {shortId(a.fullId)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {a.comercio} · {a.legajo}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={toneAdelanto(a.estado)}>{a.estado}</Badge>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {d.tope != null && <TopeBanner tope={d.tope} importe={a.importeSolicitado} />}

          {a.estado === "Aprobado" && d.pool && (
            <PoolBanner
              pool={d.pool}
              insuficiente={d.poolInsuficiente}
              importe={a.importeSolicitado}
            />
          )}

          <SolicitudCard a={a} />

          {!d.readOnly && <GestionAdelanto a={a} d={d} onClose={onClose} />}

          {d.readOnly && (
            <Card className="p-4 text-sm text-muted-foreground">
              {a.estado === "Acreditado" ? (
                <p>
                  Este adelanto ya fue acreditado. Los fondos se depositaron en la subcuenta{" "}
                  <span className="font-mono">Operativa</span> del legajo{" "}
                  <span className="font-mono">{a.legajo}</span> el {a.fechaAcreditacion}.
                </p>
              ) : (
                <p>
                  Este adelanto fue cancelado por el comercio. No se pueden revertir las acciones.
                </p>
              )}
            </Card>
          )}

          {a.estado === "Acreditado" && a.fechaAcreditacion && <MovimientoSaldoCard a={a} />}
        </div>
      </div>
    </div>
  );
}
