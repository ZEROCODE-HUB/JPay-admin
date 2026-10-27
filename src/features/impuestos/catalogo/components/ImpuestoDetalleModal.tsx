import type { ReactNode } from "react";
import { X } from "lucide-react";
import { formatDateTime } from "@/shared/format";
import { Badge, BtnOutline } from "@/components/portal-shell";
import type { Impuesto } from "@/lib/api/types";
import { ambitoTone, estadoActivoTone, formatMontoImpuesto } from "../../utils";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

/** Ficha de solo lectura de un impuesto del catálogo. */
export function ImpuestoDetalleModal({ imp, onClose }: { imp: Impuesto; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display text-lg font-semibold">
              Detalle del impuesto: {imp.nombre}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{imp.codigo}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Código" value={<span className="font-mono">{imp.codigo}</span>} />
            <Field label="Nombre" value={imp.nombre} />
            <Field label="Descripción" value={imp.descripcion ?? "—"} />
            <Field
              label="Ámbito"
              value={<Badge tone={ambitoTone(imp.ambito)}>{imp.ambito}</Badge>}
            />
            <Field label="Tipo" value={imp.tipo} />
            <Field
              label="Monto"
              value={
                imp.monto === null ? (
                  "—"
                ) : (
                  <span className="font-mono tabular-nums">
                    {formatMontoImpuesto(imp.tipo, imp.monto)}
                  </span>
                )
              }
            />
            <Field
              label="Estado"
              value={<Badge tone={estadoActivoTone(imp.estado)}>{imp.estado}</Badge>}
            />
            <Field
              label="Creado"
              value={
                <span className="font-mono tabular-nums">{formatDateTime(imp.createdAt)}</span>
              }
            />
            <Field
              label="Actualizado"
              value={
                <span className="font-mono tabular-nums">{formatDateTime(imp.updatedAt)}</span>
              }
            />
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end">
          <BtnOutline type="button" onClick={onClose}>
            Cerrar
          </BtnOutline>
        </div>
      </div>
    </div>
  );
}
