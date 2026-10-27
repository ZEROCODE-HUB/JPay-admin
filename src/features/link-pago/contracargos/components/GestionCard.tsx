import { FileText, Ticket } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { Contra, EstadoContra } from "@/lib/api/contracargos";
import { formatMoney } from "@/shared/format";
import { ESTADO_LABEL, ESTADO_OPTIONS_UI, enMediacion } from "../estados";
import type { ContracargoDetalleState } from "../hooks/useContracargoDetalle";

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function LoteSelector({ d }: { d: ContracargoDetalleState }) {
  return (
    <div>
      <label className="text-xs font-semibold">Lote a aplicar</label>
      {d.loadingLotes ? (
        <p className="text-xs text-muted-foreground mt-1">Buscando lotes…</p>
      ) : d.lotes.length === 0 ? (
        <p className="text-xs text-amber-700 mt-1">
          Este comercio no tiene lotes en Programado/Pendiente. El contracargo quedará cerrado pero
          sin impacto.
        </p>
      ) : (
        <select
          value={d.loteId}
          onChange={(e) => d.setLoteId(e.target.value)}
          className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
        >
          {d.lotes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.codigo} · {l.estado} · {l.fecha} · neto {formatMoney(l.importeNeto)}
              {l.esSugerido ? "  ★ sugerido" : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/** Formulario de gestión (estado, ticket, notas, resolución) y botones. */
export function GestionCard({
  c,
  d,
  onClose,
}: {
  c: Contra;
  d: ContracargoDetalleState;
  onClose: () => void;
}) {
  const { estado, puedeGestionar, puedeBorrar, saving } = d;
  return (
    <Card className="p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Gestión
      </h4>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold">Estado</label>
          <select
            value={estado}
            onChange={(e) => d.setEstado(e.target.value as EstadoContra)}
            className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
            disabled={!puedeGestionar}
          >
            {ESTADO_OPTIONS_UI.map((s) => (
              <option key={s} value={s}>
                {ESTADO_LABEL[s]}
              </option>
            ))}
          </select>
          {enMediacion(estado) && !c.fechaLimite && (
            <p className="text-xs text-muted-foreground mt-1">
              Al guardar se calculará el plazo (10 días hábiles).
            </p>
          )}
          {estado === "Simulado" && (
            <p className="text-xs text-blue-600 mt-1">Simulación — sin impacto en caja ni lotes.</p>
          )}
          {estado === "Cerrado_retenido" && (
            <p className="text-xs text-danger-600 mt-1">
              ⚠ Aplicará un descuento al lote seleccionado abajo.
            </p>
          )}
        </div>

        {estado === "Cerrado_retenido" && <LoteSelector d={d} />}

        <div>
          <label className="text-xs font-semibold flex items-center gap-1">
            <Ticket size={12} /> Ticket PayWay
          </label>
          <input
            value={d.ticket}
            onChange={(e) => d.setTicket(e.target.value)}
            placeholder="Ej: PW-TKT-88421"
            className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm font-mono"
            disabled={!puedeGestionar}
          />
        </div>
        <div>
          <label className="text-xs font-semibold flex items-center gap-1">
            <FileText size={12} /> Documentación (notas)
          </label>
          <textarea
            value={d.doc}
            onChange={(e) => d.setDoc(e.target.value)}
            rows={3}
            placeholder="Comprobante, factura, KYC, entrega…"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            disabled={!puedeGestionar}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Resolución</label>
          <textarea
            value={d.resolucion}
            onChange={(e) => d.setResolucion(e.target.value)}
            rows={2}
            placeholder="Cómo se resolvió…"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            disabled={!puedeGestionar}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          {c.esSimulacion && puedeGestionar && (
            <button
              type="button"
              onClick={d.onConfirmarSimulacion}
              disabled={saving}
              className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm inline-flex items-center gap-1.5"
            >
              <CheckCircleIcon /> Confirmar simulación
            </button>
          )}
          {c.esSimulacion && puedeBorrar && (
            <button
              type="button"
              onClick={d.onEliminarSimulacion}
              className="h-9 px-3 rounded-md border border-danger-200 text-danger-600 text-sm"
            >
              Eliminar simulación
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-md border bg-card text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={d.guardar}
            disabled={saving || !puedeGestionar}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {saving && (
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </Card>
  );
}
