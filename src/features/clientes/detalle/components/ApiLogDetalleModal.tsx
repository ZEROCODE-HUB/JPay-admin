import { ModalDialog } from "@/shared/ui/modal-dialog";
import type { ApiUsuarioLog } from "@/lib/api/api-usuarios";

export function ApiLogDetalleModal({
  logDetalle,
  onClose,
}: {
  logDetalle: ApiUsuarioLog | null;
  onClose: () => void;
}) {
  return (
    <ModalDialog open={!!logDetalle} onClose={onClose} title="Detalle de log" size="lg">
      {logDetalle && (
        <div className="space-y-3 text-sm">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Información General
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">ID</span>
              <span className="font-medium">{logDetalle.id}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Usuario ID</span>
              <span className="font-medium">{logDetalle.detalle.usuarioId}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Client ID</span>
              <span className="font-medium">{logDetalle.detalle.clientId ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-medium font-mono">{logDetalle.detalle.ip}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Método HTTP</span>
              <span className="font-medium">{logDetalle.detalle.metodoHttp}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Estado HTTP</span>
              <span className="font-medium">{logDetalle.detalle.estadoHttp}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Endpoint</span>
              <span className="font-medium font-mono break-all">{logDetalle.detalle.endpoint}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Tiempo de Respuesta</span>
              <span className="font-medium">{logDetalle.detalle.tiempoRespuesta}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">User Agent</span>
              <span className="font-medium break-all">{logDetalle.detalle.userAgent}</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-medium">{logDetalle.detalle.fecha}</span>
            </div>
          </div>
          <DetalleJson titulo="Request Headers" data={logDetalle.detalle.requestHeaders} />
          <DetalleJson titulo="Request Params" data={logDetalle.detalle.requestParams} />
          <DetalleJson titulo="Request Query" data={logDetalle.detalle.requestQuery} />
          <DetalleJson titulo="Request Body" data={logDetalle.detalle.requestBody} />
          <DetalleJson titulo="Response Body" data={logDetalle.detalle.responseBody} />
        </div>
      )}
    </ModalDialog>
  );
}

function DetalleJson({ titulo, data }: { titulo: string; data: unknown }) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </p>
      <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
        {text}
      </pre>
    </div>
  );
}
