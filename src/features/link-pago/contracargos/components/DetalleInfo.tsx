import type { ReactNode } from "react";
import { ArrowRight, Banknote, Clock, Copy, CreditCard, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import { brand } from "@/brand/brand";
import { Card } from "@/components/portal-shell";
import type { Contra } from "@/lib/api/contracargos";
import { formatDateTime, formatMoney } from "@/shared/format";

/** Banner de simulación: impacto antes de confirmar. */
export function SimulacionBanner({ c }: { c: Contra }) {
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm">
      <div className="font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
        <Clock size={14} /> Simulación — estos valores aún no están aplicados
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {c.impactoNeto != null && (
          <div>
            <span className="text-blue-600">Descuento neto:</span>{" "}
            <span className="font-mono font-semibold">{formatMoney(c.impactoNeto)}</span>
          </div>
        )}
        {c.impactoSaldo != null && (
          <div>
            <span className="text-blue-600">Saldo commerce:</span>{" "}
            <span className="font-mono font-semibold">{formatMoney(c.impactoSaldo)}</span>
          </div>
        )}
        {c.impactoTasa != null && (
          <div>
            <span className="text-blue-600">Tasa {brand.name}:</span>{" "}
            <span className="font-mono">{c.impactoTasa}%</span>
          </div>
        )}
        {c.impactoCierre != null && (
          <div>
            <span className="text-blue-600">Cierre lote:</span>{" "}
            <span className="font-mono">{formatMoney(c.impactoCierre)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FlujoContracargo() {
  return (
    <div className="rounded-lg bg-muted/40 border px-3 py-2 text-xs flex items-center gap-1.5 flex-wrap">
      <span className="font-semibold">Flujo:</span>
      <span>Visa</span> <ArrowRight size={12} /> <span>PayWay</span> <ArrowRight size={12} />{" "}
      <span>{brand.name}</span> <ArrowRight size={12} /> <span>comprador</span>
    </div>
  );
}

export function LinkOriginal({ c }: { c: Contra }) {
  return (
    <Card className="p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
        <Link2 size={12} /> Link de pago original
      </h4>
      {c.urlOrigen ? (
        <a
          href={c.urlOrigen}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-primary-ink underline break-all inline-flex items-center gap-1"
        >
          {c.urlOrigen} <ExternalLink size={10} />
        </a>
      ) : (
        <p className="text-xs text-muted-foreground font-mono">ID link: {c.linkId || "—"}</p>
      )}
    </Card>
  );
}

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/** Cards "Contracargo" y "Datos PayWay". */
export function DatosContracargo({ c }: { c: Contra }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card className="p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
          <Banknote size={12} /> Contracargo
        </h4>
        <div className="space-y-2 text-sm">
          <Dato label="Importe">
            <div className="font-mono font-semibold text-lg text-danger-600">
              -{formatMoney(c.importe)}
            </div>
          </Dato>
          <Dato label="Fecha creación">
            <div className="font-mono text-xs">{formatDateTime(c.createdAt)}</div>
          </Dato>
          {c.fechaTransaccion && (
            <Dato label="Fecha transacción">
              <div className="font-mono text-xs">{formatDateTime(c.fechaTransaccion)}</div>
            </Dato>
          )}
          {c.motivoPayway && (
            <Dato label="Motivo">
              <div className="text-sm">{c.motivoPayway}</div>
            </Dato>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
          <CreditCard size={12} /> Datos PayWay
        </h4>
        <div className="space-y-2 text-sm">
          {c.nroTarjetaMasked && (
            <Dato label="Tarjeta">
              <div className="font-mono">
                {c.nroTarjetaMasked}
                {c.marcaTarjeta && (
                  <span className="ml-2 text-xs text-muted-foreground">({c.marcaTarjeta})</span>
                )}
              </div>
            </Dato>
          )}
          {c.siteTransactionId && (
            <Dato label="TID">
              <div className="font-mono text-xs flex items-center gap-1">
                {c.siteTransactionId}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(c.siteTransactionId!);
                    toast.success("Copiado");
                  }}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  <Copy size={10} />
                </button>
              </div>
            </Dato>
          )}
          {c.siteId && (
            <Dato label="Establecimiento">
              <div className="font-mono text-xs">{c.siteId}</div>
            </Dato>
          )}
          {c.ccoOrigen && (
            <Dato label="Origen (CCO)">
              <div className="text-xs">{c.ccoOrigen}</div>
            </Dato>
          )}
          {c.ticketPayway && (
            <Dato label="Ticket PayWay">
              <div className="font-mono text-xs">{c.ticketPayway}</div>
            </Dato>
          )}
        </div>
      </Card>
    </div>
  );
}
