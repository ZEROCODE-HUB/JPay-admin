import { type ReactNode } from "react";
import { Badge, BtnOutline, BtnPrimary, Card } from "@/components/portal-shell";
import type { Impuesto } from "@/features/reportes/utils/impuestos";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

// Modal a mano (no ModalDialog): rounded-xl, cierre "×" y footer sticky con acciones.
export function ImpuestoDetalleModal({
  impuesto,
  onClose,
  onMarcarPresentado,
  onMarcarPagado,
}: {
  impuesto: Impuesto;
  onClose: () => void;
  onMarcarPresentado: (id: string) => void;
  onMarcarPagado: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display font-semibold text-lg">Detalle del reporte</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{impuesto.reporte}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Card className="p-5">
            <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Información del reporte
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="ID" value={<span className="font-mono">{impuesto.id}</span>} />
              <Field label="Reporte" value={impuesto.reporte} />
              <Field label="Período" value={impuesto.periodo} />
              <Field label="Tramo" value={impuesto.tramo} />
              <Field
                label="Fecha de creación"
                value={<span className="font-mono tabular-nums">{impuesto.creado}</span>}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              KPIs
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
              <Field label="Total de registros" value={impuesto.totalRegistros} />
              <Field label="Total de movimientos" value={impuesto.totalMovimientos} />
              <Field
                label="Total de monto"
                value={<span className="font-mono">{impuesto.totalMonto}</span>}
              />
              <Field
                label="Total de retenciones"
                value={<span className="font-mono">{impuesto.totalRetenciones}</span>}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Estado
            </h4>
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Presentado
                </div>
                <div className="mt-1">
                  <Badge tone={impuesto.presentado === "Sí" ? "success" : "danger"}>
                    {impuesto.presentado}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Pagado</div>
                <div className="mt-1">
                  <Badge tone={impuesto.pagado === "Sí" ? "success" : "danger"}>
                    {impuesto.pagado}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex flex-wrap justify-end gap-2">
          {impuesto.presentado === "No" && (
            <BtnPrimary className="h-9 text-sm" onClick={() => onMarcarPresentado(impuesto.id)}>
              Marcar como presentado
            </BtnPrimary>
          )}
          {impuesto.pagado === "No" && (
            <BtnOutline className="h-9 text-sm" onClick={() => onMarcarPagado(impuesto.id)}>
              Marcar como pagado
            </BtnOutline>
          )}
          <BtnOutline className="h-9 text-sm" onClick={onClose}>
            Cerrar
          </BtnOutline>
        </div>
      </div>
    </div>
  );
}
