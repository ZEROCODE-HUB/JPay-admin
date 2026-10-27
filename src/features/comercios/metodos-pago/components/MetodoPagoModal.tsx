import { X } from "lucide-react";
import { BtnOutline, BtnPrimary, Card, Input, Label } from "@/components/portal-shell";
import type { Bandera } from "@/lib/api/banderas";
import { ESTADOS } from "../estados";
import { useMetodoPagoForm } from "../hooks/useMetodoPagoForm";
import { TIPOS_METODO, type MetodoPagoForm } from "../utils";
import { CuotasTabla } from "./CuotasTabla";

const SELECT_CLS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Alta / edición de un método de pago con sus cuotas. */
export function MetodoPagoModal({
  metodo,
  onClose,
  onSave,
  onDelete,
}: {
  metodo: Bandera | null;
  onClose: () => void;
  onSave: (m: MetodoPagoForm) => void;
  onDelete?: () => void;
}) {
  const f = useMetodoPagoForm(metodo, onSave);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display text-lg font-semibold">
              {metodo ? "Editar método de pago" : "Crear método de pago"}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {metodo
                ? `Configuración del método de pago "${metodo.nombre}".`
                : "Complete los datos del nuevo método de pago."}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4">
              <div>
                <Label htmlFor="mp-id">ID</Label>
                <Input id="mp-id" value={metodo?.id ?? "—"} readOnly className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="mp-nombre">Nombre</Label>
                <Input
                  id="mp-nombre"
                  value={f.nombre}
                  onChange={(e) => f.setNombre(e.target.value)}
                  placeholder="Ej: Visa Débito"
                />
              </div>
              <div>
                <Label htmlFor="mp-tipo">Tipo</Label>
                <select
                  id="mp-tipo"
                  className={SELECT_CLS}
                  value={f.tipo}
                  onChange={(e) => f.setTipo(e.target.value)}
                >
                  {TIPOS_METODO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="mp-dias">Días hábiles acreditación</Label>
                <Input
                  id="mp-dias"
                  type="number"
                  min={1}
                  value={f.diasHabiles}
                  onChange={(e) => f.setDiasHabiles(Number(e.target.value))}
                />
              </div>
            </div>
            {metodo && (
              <div className="mt-4">
                <Label htmlFor="mp-estado">Estado</Label>
                <select
                  id="mp-estado"
                  className={SELECT_CLS}
                  value={f.estado}
                  onChange={(e) => f.setEstado(e.target.value as typeof f.estado)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          <CuotasTabla
            cuotas={f.cuotas}
            loading={f.loadingCuotas}
            onAdd={f.addCuota}
            onUpdate={f.updateCuota}
            onRemove={f.removeCuota}
          />
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between gap-2">
          <div>
            {metodo && onDelete && (
              <BtnOutline
                type="button"
                onClick={onDelete}
                className="text-danger-600 hover:bg-danger-50"
              >
                Eliminar
              </BtnOutline>
            )}
          </div>
          <div className="flex gap-2">
            <BtnOutline type="button" onClick={onClose}>
              Cancelar
            </BtnOutline>
            <BtnPrimary type="button" onClick={f.guardar}>
              {metodo ? "Guardar" : "Crear método de pago"}
            </BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
