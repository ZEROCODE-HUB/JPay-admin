import { AlertTriangle, Calendar, X } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { Contra } from "@/lib/api/contracargos";
import { muestraAdjuntos, muestraPlazo } from "../estados";
import { useContracargoDetalle } from "../hooks/useContracargoDetalle";
import { AdjuntosCard } from "./AdjuntosCard";
import { DatosContracargo, FlujoContracargo, LinkOriginal, SimulacionBanner } from "./DetalleInfo";
import { GestionCard } from "./GestionCard";
import { PlazoMediacion } from "./PlazoMediacion";

/** Modal de gestión de un contracargo. */
export function ContracargoDetalleModal({ c, onClose }: { c: Contra; onClose: () => void }) {
  const d = useContracargoDetalle(c, onClose);
  const { estado } = d;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-start z-10">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <AlertTriangle
                size={18}
                className={c.esSimulacion ? "text-blue-600" : "text-danger-600"}
              />
              Contracargo {c.id.slice(0, 8)}…
            </h3>
            <p className="text-sm text-muted-foreground">
              {c.comercioNombre} · {c.comercioLegajo}
              {c.clienteLegajo && (
                <>
                  {" "}
                  · Legajo cliente <span className="font-mono">{c.clienteLegajo}</span>
                </>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Simulación: mostrar impacto antes de confirmar */}
          {c.esSimulacion && <SimulacionBanner c={c} />}

          <FlujoContracargo />

          {(c.urlOrigen || c.linkId) && <LinkOriginal c={c} />}

          <DatosContracargo c={c} />

          {/* Plazo de mediación (solo si está en mediación) */}
          {muestraPlazo(estado) && (
            <Card className="p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <Calendar size={12} /> Plazo de mediación
              </h4>
              <PlazoMediacion fechaLimite={c.fechaLimite} enviadoAt={c.enviadoPaywayAt} />
            </Card>
          )}

          {muestraAdjuntos(estado) && <AdjuntosCard c={c} d={d} />}

          <GestionCard c={c} d={d} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
