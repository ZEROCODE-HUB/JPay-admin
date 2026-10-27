import { Plus, X } from "lucide-react";
import { Input, Label } from "@/components/portal-shell";
import { useCrearSimulacion } from "../hooks/useCrearSimulacion";

/** Modal "Simular contracargo": carga manual sin impacto en caja ni lotes. */
export function CrearSimulacionModal({ onClose }: { onClose: () => void }) {
  const f = useCrearSimulacion(onClose);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-md shadow-xl">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-center">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Plus size={18} /> Simular contracargo
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            Cargá los datos del contracargo para simular el impacto sin afectar la caja ni los
            lotes.
          </p>
          <div>
            <Label>Comercio</Label>
            <select
              value={f.comercioId}
              onChange={(e) => f.setComercioId(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Seleccionar comercio…</option>
              {f.comerciosList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombreComercio ?? c.usuario} ({c.legajo})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Importe del contracargo</Label>
            <Input
              value={f.importe}
              onChange={(e) => f.setImporte(e.target.value)}
              placeholder="Ej: 15000,00"
              className="font-mono"
            />
          </div>
          <div>
            <Label>
              Ticket PayWay <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              value={f.ticket}
              onChange={(e) => f.setTicket(e.target.value)}
              placeholder="PW-TKT-xxxxx"
              className="font-mono"
            />
          </div>
          <div>
            <Label>
              Motivo <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              value={f.motivo}
              onChange={(e) => f.setMotivo(e.target.value)}
              placeholder="Motivo del contracargo"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="h-9 px-3 rounded-md border bg-card text-sm">
              Cancelar
            </button>
            <button
              onClick={f.crear}
              disabled={f.saving}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
            >
              {f.saving ? "Creando…" : "Simular impacto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
