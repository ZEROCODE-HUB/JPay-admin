import { CheckCircle, FileWarning, ShieldCheck, XCircle } from "lucide-react";
import { formatDateTime, formatMoney } from "@/shared/format";
import { FormDialog } from "@/shared/ui/form-dialog";
import { BtnOutline } from "@/components/portal-shell";
import {
  ALERT_RESOLUTION_LABEL,
  ALERT_STATUS_LABEL,
  type AlertItem,
  type AlertResolution,
} from "@/lib/api/compliance";
import { Campo } from "../../comun/components/Campo";
import { fechaYResponsable } from "../../comun/utils";
import { alertaAbierta } from "../utils";

type Props = {
  detalle: AlertItem;
  onClose: () => void;
  onAceptar: (a: AlertItem) => void;
  onDictamen: (a: AlertItem, r: AlertResolution) => void;
};

export function AlertaDetalleDialog({ detalle, onClose, onAceptar, onDictamen }: Props) {
  return (
    <FormDialog
      open
      onClose={onClose}
      title="Detalle de alerta"
      description={detalle.type}
      onSubmit={onClose}
      submitLabel="Cerrar"
      size="lg"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Campo label="Legajo" value={detalle.legajo} mono />
        <Campo label="Cliente" value={`${detalle.nombre} · ${detalle.correo}`} />
        <Campo label="Estado" value={ALERT_STATUS_LABEL[detalle.status]} />
        <Campo label="Regla" value={detalle.ruleCode ?? "—"} mono />
        <Campo label="Fecha de alerta" value={formatDateTime(detalle.createdAt)} />
        <Campo label="Vencimiento normativo" value={formatDateTime(detalle.dueAt)} />
        <Campo
          label="Aceptada"
          value={fechaYResponsable(detalle.acceptedAt, detalle.acceptedByName)}
        />
        <Campo
          label="Cerrada"
          value={fechaYResponsable(detalle.resolvedAt, detalle.resolvedByName)}
        />
        {detalle.resolution && (
          <Campo label="Resolución" value={ALERT_RESOLUTION_LABEL[detalle.resolution]} />
        )}
        {detalle.resolutionNotes && <Campo label="Dictamen" value={detalle.resolutionNotes} full />}
        <Campo label="Descripción" value={detalle.description} full />
        {detalle.idTxn && (
          <>
            <Campo label="Operación (TXID)" value={detalle.idTxn} mono />
            <Campo
              label="Monto / tipo"
              value={`${formatMoney(detalle.montoOperacion)} · ${detalle.tipoOperacion ?? "—"}`}
            />
          </>
        )}
        {detalle.plaftMatchId != null && (
          <Campo label="Coincidencia PLAFT" value={`#${detalle.plaftMatchId}`} mono />
        )}
        {Object.keys(detalle.details).length > 0 && (
          <div className="col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Datos del evento</div>
            <pre className="rounded-md bg-muted/50 p-3 text-xs overflow-x-auto">
              {JSON.stringify(detalle.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
      {alertaAbierta(detalle) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
          {detalle.status === "pending" && (
            <BtnOutline onClick={() => onAceptar(detalle)}>
              <CheckCircle size={14} /> Aceptar
            </BtnOutline>
          )}
          <BtnOutline onClick={() => onDictamen(detalle, "justified")}>
            <ShieldCheck size={14} /> Justificada
          </BtnOutline>
          <BtnOutline onClick={() => onDictamen(detalle, "ros")}>
            <FileWarning size={14} /> ROS
          </BtnOutline>
          <BtnOutline onClick={() => onDictamen(detalle, "false_positive")}>
            <XCircle size={14} /> Falso positivo
          </BtnOutline>
        </div>
      )}
    </FormDialog>
  );
}
