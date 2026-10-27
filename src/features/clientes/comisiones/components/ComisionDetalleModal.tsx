import type { ReactNode } from "react";
import { formatPercent } from "@/shared/format";
import { FormDialog } from "@/shared/ui/form-dialog";
import { LegajoCell } from "@/components/legajo-label";
import { configLabel, desgloseDe, type Comision } from "../utils";
import { DesglosePreview } from "./DesglosePreview";

function Dato({ label, children, ancho }: { label: string; children: ReactNode; ancho?: boolean }) {
  return (
    <div className={ancho ? "col-span-2" : undefined}>
      <span className="text-muted-foreground">{label}:</span> {children}
    </div>
  );
}

/** Ficha de solo lectura de una comisión, con el desglose de ejemplo. */
export function ComisionDetalleModal({
  viewing,
  onClose,
}: {
  viewing: Comision;
  onClose: () => void;
}) {
  return (
    <FormDialog
      open={!!viewing}
      onClose={onClose}
      title="Detalle de comisión"
      description={`Comisión ${viewing.legajo} — ${viewing.operacion}`}
      onSubmit={onClose}
      submitLabel="Cerrar"
      size="lg"
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Dato label="Legajo">
          <LegajoCell legajo={viewing.legajo} />
        </Dato>
        <Dato label="Correo">
          <span className="font-medium">{viewing.correo}</span>
        </Dato>
        <Dato label="CUIT">
          <span className="font-mono tabular-nums">{viewing.cuit}</span>
        </Dato>
        <Dato label="CVU">
          {viewing.cvu ? (
            <span className="font-medium font-mono tabular-nums">{viewing.cvu}</span>
          ) : (
            <span className="font-medium">Toda la cuenta (respaldo del cliente)</span>
          )}
        </Dato>
        <Dato label="Tipo de operación">
          <span className="font-medium">{viewing.tipo}</span>
        </Dato>
        <Dato label="Código de operación">
          <span className="font-medium font-mono tabular-nums">{viewing.operacion}</span>
        </Dato>
        <Dato label="Modalidad">
          <span className="font-medium">{viewing.modalidad}</span>
        </Dato>
        <Dato label="Configuración">
          <span className="font-medium font-mono tabular-nums">{configLabel(viewing)}</span>
        </Dato>
        <Dato label="% Impuesto (IVA)">
          <span className="font-medium font-mono tabular-nums">
            {formatPercent(viewing.porcentajeImpuesto)}
          </span>
        </Dato>
        <Dato label="Estado">
          <span className="font-medium">
            {viewing.estado === "Habilitado" ? "Activa" : "Inactiva"}
          </span>
        </Dato>
        <Dato label="Descripción" ancho>
          <span className="font-medium">{viewing.descripcion}</span>
        </Dato>
        <div className="col-span-2">
          <DesglosePreview desglose={desgloseDe(viewing)} />
        </div>
      </div>
    </FormDialog>
  );
}
