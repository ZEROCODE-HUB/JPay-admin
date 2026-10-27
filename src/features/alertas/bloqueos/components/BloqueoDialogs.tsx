import { formatDateTime, formatMoney } from "@/shared/format";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { AccountBlock } from "@/lib/api/compliance";
import { Campo } from "../../comun/components/Campo";
import { fechaYResponsable } from "../../comun/utils";
import { ALCANCE_LABEL, COMPLIANCE_LABEL, ESTADO_LABEL, alcanceDetalle } from "../utils";

export function BloqueoDetalleDialog({
  detalle,
  onClose,
}: {
  detalle: AccountBlock;
  onClose: () => void;
}) {
  return (
    <FormDialog
      open
      onClose={onClose}
      title="Detalle del bloqueo"
      description={`${detalle.legajo} · ${detalle.nombre}`}
      onSubmit={onClose}
      submitLabel="Cerrar"
      size="lg"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Campo label="Cliente" value={`${detalle.nombre} · ${detalle.correo}`} />
        <Campo
          label="Origen"
          value={detalle.origin === "rule" ? `Regla: ${detalle.ruleName ?? "—"}` : "Manual"}
        />
        <Campo label="Alcance" value={alcanceDetalle(detalle)} />
        <Campo
          label="Estado"
          value={`${ESTADO_LABEL[detalle.blockStatus]} · Compliance ${COMPLIANCE_LABEL[detalle.complianceStatus].toLowerCase()}`}
        />
        <Campo
          label="Bloqueado"
          value={`${formatDateTime(detalle.blockedAt)} · ${detalle.blockedByName ?? "Sistema"}`}
        />
        <Campo
          label="Aceptado"
          value={fechaYResponsable(detalle.acceptedAt, detalle.acceptedByName)}
        />
        <Campo
          label="Liberado"
          value={fechaYResponsable(detalle.releasedAt, detalle.releasedByName)}
        />
        <Campo label="Fondos retenidos" value={formatMoney(detalle.heldAmount)} />
        <Campo label="Motivo" value={detalle.reason} full />
        {detalle.releaseNotes && (
          <Campo label="Motivo de liberación" value={detalle.releaseNotes} full />
        )}
        {detalle.idTxn && <Campo label="Operación (TXID)" value={detalle.idTxn} mono />}
      </div>
    </FormDialog>
  );
}

export function LiberarBloqueoDialog({
  liberando,
  notas,
  onNotasChange,
  enviando,
  onClose,
  onSubmit,
}: {
  liberando: AccountBlock;
  notas: string;
  onNotasChange: (v: string) => void;
  enviando: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <FormDialog
      open
      onClose={onClose}
      title="Desbloquear"
      description={`${liberando.legajo} · ${ALCANCE_LABEL[liberando.scope]}`}
      onSubmit={onSubmit}
      submitLabel={enviando ? "Liberando…" : "Desbloquear"}
    >
      {liberando.heldAmount > 0 && (
        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Se liberarán {formatMoney(liberando.heldAmount)} de depósitos retenidos: pasan de saldo
          retenido a disponible con su asiento contable.
        </div>
      )}
      <label className="text-xs font-semibold text-foreground mb-1.5 block">
        Motivo de la liberación
      </label>
      <textarea
        value={notas}
        onChange={(e) => onNotasChange(e.target.value)}
        className="w-full h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 resize-none"
      />
    </FormDialog>
  );
}
