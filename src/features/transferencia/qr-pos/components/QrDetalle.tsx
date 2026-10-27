import { Download, Printer, QrCode, XCircle } from "lucide-react";
import { formatDate } from "@/shared/format";
import { Badge, Card } from "@/components/portal-shell";
import type { PuntoVenta } from "@/lib/api/types";
import { estadoQrTone } from "../estados";
import { qrValue as qrValueDe } from "../utils";
import { descargarQrPng, imprimirQr } from "../descargas";
import { useQrDataUrl } from "../hooks/useQrDataUrl";

export function QrDetalle({ qr, onClose }: { qr: PuntoVenta; onClose: () => void }) {
  const qrValue = qrValueDe(qr);
  const qrDataUrl = useQrDataUrl(qrValue);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-start">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <QrCode size={18} /> Detalle QR/POS
            </h3>
            <p className="text-sm text-muted-foreground">
              QR: {qr.nombre} · POS asociado: {qr.nombre}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <XCircle size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Card className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              QR — claramente identificado
            </h4>
            <div className="grid grid-cols-[1fr_auto] gap-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre QR/POS</span>
                  <div className="font-semibold">{qr.nombre}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo</span>
                  <div className="font-semibold">{qr.tipo ?? "QR"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Alias</span>
                  <div className="font-mono text-xs">{qr.alias ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado</span>
                  <div>
                    <Badge tone={estadoQrTone(qr.estado)}>{qr.estado}</Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">QR URL</span>
                  <div className="font-mono text-xs break-all">{qrValue}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cajero</span>
                  <div className="font-semibold">{qr.cajero ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ID</span>
                  <div className="font-mono text-xs">{qr.id.slice(0, 8)}</div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="border-2 rounded-xl p-2 bg-white">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR" className="w-32 h-32" />
                  ) : (
                    <div className="w-32 h-32 bg-muted animate-pulse rounded" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground text-center">
                  QR para cobro
                  <br />
                  {qr.nombre}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => descargarQrPng(qrDataUrl, qr.id)}
                    className="h-7 px-2 rounded border text-xs flex items-center gap-1"
                  >
                    <Download size={12} />
                    PNG
                  </button>
                  <button
                    onClick={() => imprimirQr(qrDataUrl)}
                    className="h-7 px-2 rounded border text-xs flex items-center gap-1"
                  >
                    <Printer size={12} />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              POS asociado
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nombre POS</span>
                <div className="font-semibold">{qr.nombre}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha creación</span>
                <div className="font-mono text-xs">{formatDate(qr.createdAt)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Comercio</span>
                <div className="font-semibold">{qr.comercio?.usuario ?? "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">ID POS</span>
                <div className="font-mono text-xs">{qr.id.slice(0, 8)}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Comercio / Usuario
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Comercio</span>
                <div className="font-semibold">{qr.comercio?.usuario ?? "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Legajo comercio</span>
                <div className="font-mono text-xs">{qr.comercio?.legajo ?? "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Usuario</span>
                <div className="font-semibold">
                  {qr.comercio?.clienteCorreo ?? qr.comercio?.usuario ?? "—"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Cliente</span>
                <div className="font-semibold">{qr.comercio?.clienteNombre ?? "—"}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
