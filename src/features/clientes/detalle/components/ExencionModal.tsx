import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { crearExencion, type ExencionDireccion } from "@/lib/api/detalle-cliente";

export function ExencionModal({
  open,
  onClose,
  legajo,
  cuitDefault,
}: {
  open: boolean;
  onClose: () => void;
  legajo: string;
  cuitDefault: string;
}) {
  const queryClient = useQueryClient();
  const [cuit, setCuit] = useState(cuitDefault);
  const [direccion, setDireccion] = useState<ExencionDireccion>("Ambos");
  const [motivo, setMotivo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    setSaving(true);
    setErr(null);
    try {
      await crearExencion(legajo, {
        cuit: cuit || cuitDefault,
        direccion,
        motivo,
        vigenciaDesde: desde || null,
        vigenciaHasta: hasta || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["dc_excepciones"] });
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Nueva excención de Débitos y Créditos"
      size="lg"
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">CUIT</label>
          <input
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            placeholder="CUIT"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Dirección
          </label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value as ExencionDireccion)}
          >
            <option value="Entrantes">Entrantes</option>
            <option value="Salientes">Salientes</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Motivo</label>
          <textarea
            className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo de la exención"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Vigencia desde
          </label>
          <input
            type="date"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Vigencia hasta
          </label>
          <textarea
            className="min-h-[56px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            placeholder="Vigencia hasta"
          />
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Si no completás la fecha desde, el backend toma la fecha actual. Si no completás la
            fecha hasta, la exención queda abierta.
          </span>
        </div>
        {err && <p className="text-sm text-danger-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-input px-3 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Creando…" : "Crear exención"}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
