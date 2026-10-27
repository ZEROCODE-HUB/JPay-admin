import type { ReactNode } from "react";
import { X } from "lucide-react";
import { formatDateTime } from "@/shared/format";
import { Badge, BtnOutline, Card } from "@/components/portal-shell";
import type { ApiUsuario } from "@/lib/api/types";
import { estadoUsuarioApiTone } from "../estados";

export function UsuarioDetalleModal({ usr, onClose }: { usr: ApiUsuario; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display text-lg font-semibold">Detalle de integración</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {usr.usuario} · Código {usr.codigoUsuarioApi}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <Card className="p-5">
            <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Información general
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Código de usuario API" value={usr.codigoUsuarioApi} />
              <Field label="Usuario" value={usr.usuario} />
              <Field label="Nombre completo" value={usr.nombreCompleto} />
              <Field
                label="Estado"
                value={<Badge tone={estadoUsuarioApiTone(usr.estado)}>{usr.estado}</Badge>}
              />
              <Field
                label="Fecha de creación"
                value={
                  <span className="font-mono tabular-nums">{formatDateTime(usr.createdAt)}</span>
                }
              />
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

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
