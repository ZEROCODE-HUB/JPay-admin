import type { ReactNode } from "react";
import { XCircle } from "lucide-react";
import { Badge, BtnOutline, Card } from "@/components/portal-shell";
import { LegajoCell } from "@/components/legajo-label";
import type { Comercio } from "@/lib/api/types";
import { formatDate } from "@/shared/format";
import { estadoComercioTone } from "../estados";
import { BanderasSection } from "./BanderasSection";

const TITULO_SECCION =
  "font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

/** Modal de solo lectura con la ficha del comercio y sus banderas. */
export function ComercioDetalle({
  comercio,
  onClose,
}: {
  comercio: Comercio;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display text-lg font-semibold">Detalle de comercio</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {comercio.usuario} · {comercio.legajo}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <XCircle size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {comercio.estado === "Pendiente de aprobación" && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">Comercio pendiente de aprobación</p>
              <p className="text-xs mt-1">
                Este comercio no puede operar hasta que se le asigne CVU y comisión. El estado
                actual no permite transacciones ni acreditaciones.
              </p>
            </div>
          )}

          <Card className="p-5">
            <h4 className={`${TITULO_SECCION} mb-4`}>Información general</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Usuario" value={comercio.usuario} />
              <Field
                label="Legajo"
                value={
                  <span className="inline-flex items-center gap-1">
                    <LegajoCell legajo={comercio.legajo} />
                  </span>
                }
              />
              <Field label="Nombre del comercio" value={comercio.nombreComercio ?? "—"} />
              <Field label="Cliente" value={comercio.cliente?.nombre ?? "—"} />
              <Field
                label="CUIT del cliente"
                value={
                  <span className="font-mono tabular-nums text-xs">
                    {comercio.cliente?.cuit ?? "—"}
                  </span>
                }
              />
              <Field
                label="Categoría"
                value={
                  comercio.categoria ? (
                    <span className="font-mono tabular-nums">
                      {comercio.categoria.codigo} · {comercio.categoria.nombre}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <Field label="Nivel" value={comercio.nivel} />
              <Field
                label="site_id (Payway)"
                value={<span className="font-mono text-xs">{comercio.siteId ?? "—"}</span>}
              />
              <Field
                label="Estado"
                value={<Badge tone={estadoComercioTone(comercio.estado)}>{comercio.estado}</Badge>}
              />
              <Field
                label="Fecha de registro"
                value={
                  <span className="font-mono text-xs tabular-nums">
                    {formatDate(comercio.createdAt)}
                  </span>
                }
              />
            </div>
          </Card>

          <BanderasSection comercioId={comercio.id} />

          {/* Impuestos por pagar: todavía no hay fuente real (antes salía de datos de ejemplo). */}
          <Card className="p-5">
            <h4 className={`${TITULO_SECCION} mb-3`}>Impuestos por pagar — lote de acreditación</h4>
            <div className="text-sm text-muted-foreground">
              Sin impuestos pendientes para este comercio según lotes de acreditación.
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 pt-5 pb-1">
              <h4 className={TITULO_SECCION}>Resumen</h4>
            </div>
            <div className="px-5 pb-5 pt-3 text-sm text-muted-foreground">
              Los puntos de venta / QR se gestionan en{" "}
              <span className="font-semibold">Pagos con QR</span> y los enlaces en{" "}
              <span className="font-semibold">Enlaces de pago</span>.
            </div>
          </Card>
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
