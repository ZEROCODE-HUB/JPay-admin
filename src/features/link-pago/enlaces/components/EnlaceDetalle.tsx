import { CheckCircle, Copy, Link2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatMoney } from "@/shared/format";
import { Badge, Card } from "@/components/portal-shell";
import type { EnlacePago } from "@/lib/api/enlaces-pago";
import { toneEnlace } from "../estados";
import { montoNumero, vencimientoEnlace } from "../utils";

/** Modal con el detalle del enlace y, si se pagó, la información del pago. */
export function EnlaceDetalle({ enlace, onClose }: { enlace: EnlacePago; onClose: () => void }) {
  const pago = enlace.pago;
  const esPagado = enlace.estado === "Pagado";
  const vencimiento = vencimientoEnlace(enlace.expiraEn);
  const esContracargo = enlace.estado === "Contracargo";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Link2 size={18} /> Enlace de pago
            </h3>
            <p className="text-sm text-muted-foreground break-all">{enlace.url ?? "—"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md shrink-0">
            <XCircle size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Enlace */}
          <Card className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Enlace
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <span className="text-muted-foreground">URL</span>
                <div className="font-mono text-xs break-all flex items-center gap-2">
                  {enlace.url ?? "—"}{" "}
                  {enlace.url && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(enlace.url!);
                        toast.success("Copiado");
                      }}
                      className="h-6 px-2 rounded border text-xs shrink-0"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Comercio</span>
                <div className="font-semibold">{enlace.comercioNombre}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Usuario / Legajo</span>
                <div className="font-semibold break-all">
                  {enlace.usuario ?? enlace.clienteLegajo}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Estado</span>
                <div>
                  <Badge tone={toneEnlace(enlace.estado)}>{enlace.estado}</Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Monto</span>
                <div className="font-mono font-semibold">
                  {formatMoney(montoNumero(enlace.monto))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Referencia</span>
                <div className="font-mono text-xs break-all">{enlace.referencia ?? "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Expira</span>
                <div className="font-mono text-xs">
                  {enlace.expiraEn ? formatDate(enlace.expiraEn) : "—"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Pagos parciales</span>
                <div>{enlace.pagosParciales ? "Sí" : "No"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Métodos habilitados</span>
                <div className="text-xs">{enlace.metodosPago?.join(", ") ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Notas</span>
                <div className="text-xs">{enlace.notas ?? "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Vistas</span>
                <div className="font-mono">{enlace.vistas}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pagos</span>
                <div className="font-mono">{enlace.pagos}</div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground border-t pt-3 mt-1">
                <span className="font-semibold">Ciclo:</span> PayWay crea → Pendiente de aprobación
                → Activado (sin cobro) → Pagado / Expirado (24h) / Desactivado (comercio) /
                Contracargo (comprador desconoce)
              </div>
            </div>
          </Card>

          {/* Pago — solo si Pagado o Contracargo, como pide el spec */}
          {(esPagado || esContracargo) && pago && (
            <Card className="p-4 border-primary/20">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-600" /> Información del pago{" "}
                {esContracargo && (
                  <Badge tone="danger" className="ml-2">
                    Contracargo
                  </Badge>
                )}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Método de pago</span>
                  <div className="font-semibold">{pago.metodoPago}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo</span>
                  <div className="font-semibold">{pago.tipoTarjeta}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Marca / Tarjeta</span>
                  <div className="font-semibold">{pago.marcaTarjeta ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cuotas</span>
                  <div className="font-mono font-semibold">
                    {pago.cuotas} {pago.cuotas === 1 ? "cuota (pago único)" : "cuotas"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Importe pagado</span>
                  <div className="font-mono font-semibold">
                    {formatMoney(montoNumero(pago.importePagado))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha de pago</span>
                  <div className="font-mono text-xs">
                    {pago.fechaPago ? formatDateTime(pago.fechaPago) : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Autorización</span>
                  <div className="font-mono text-xs">{pago.autorizacion ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Link vencimiento</span>
                  <div className="text-xs">
                    {vencimiento ? (
                      <>
                        <span className="font-mono">{vencimiento.fecha}</span>
                        {vencimiento.vencido && (
                          <Badge tone="danger" className="ml-2">
                            Vencido
                          </Badge>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
                {esContracargo && (
                  <div className="col-span-2 rounded-lg bg-danger-50 border border-danger-200 px-3 py-2 text-xs text-danger-800 mt-1">
                    Este pago entró en flujo de <strong>contracargo</strong> (desconocimiento). Ver
                    pestaña <strong>Contracargos</strong> para ticket PayWay y documentación.
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Leyenda estados para quien consulta un link */}
          {!pago && (
            <p className="text-xs text-muted-foreground">
              El detalle de método/tarjeta/cuotas aparece cuando el link está en estado{" "}
              <strong>Pagado</strong> (o <strong>Contracargo</strong>). Permite entender cómo se
              realizó el pago.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
