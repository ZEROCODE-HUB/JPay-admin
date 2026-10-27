import { Plus, Trash2 } from "lucide-react";
import { Badge, BtnOutline, BtnPrimary, Card, Input, Label } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FormDialog } from "@/shared/ui/form-dialog";
import { formatPercent } from "@/shared/format";
import { estadoActivoTone } from "../estados";
import type { BanderasComercioState } from "../hooks/useBanderasComercio";
import { esDecimalEnEdicion } from "../utils";

/** Panel de cuotas (TEM) de la bandera seleccionada, con su alta y baja. */
export function CuotasPanel({ s }: { s: BanderasComercioState }) {
  const { cuotasBandera } = s;
  return (
    <>
      {cuotasBandera && (
        <Card className="p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display text-sm font-semibold">
                Cuotas de {cuotasBandera.bandera} (TEM por cuota)
              </h4>
              <p className="text-xs text-muted-foreground">
                Tasa efectiva mensual que se cobra al comercio por cada cantidad de cuotas.
              </p>
            </div>
            <div className="flex gap-2">
              <BtnPrimary type="button" onClick={s.openCuotaForm} className="h-8 text-xs">
                <Plus size={14} /> Agregar cuota
              </BtnPrimary>
              <BtnOutline
                type="button"
                onClick={() => s.setCuotasBandera(null)}
                className="h-8 text-xs"
              >
                Cerrar
              </BtnOutline>
            </div>
          </div>
          {s.cuotasLoading ? (
            <p className="text-sm text-muted-foreground">Cargando cuotas…</p>
          ) : s.cuotas.length === 0 ? (
            <p className="text-sm text-muted-foreground border border-dashed rounded-lg py-6 text-center">
              Sin cuotas configuradas. Agregá la primera.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-3 py-2 font-display font-semibold">Cuotas</th>
                  <th className="px-3 py-2 font-display font-semibold text-right">TEM (%)</th>
                  <th className="px-3 py-2 font-display font-semibold">Estado</th>
                  <th className="px-3 py-2 font-display font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {s.cuotas.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono font-semibold">{c.cuotas}x</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatPercent(c.tasaMensual)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={estadoActivoTone(c.estado)}>{c.estado}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => s.setConfirmDeleteCuota(c)}
                        className="h-7 px-2 rounded-md border border-danger-200 text-danger-600 bg-card text-xs hover:bg-danger-50 inline-flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {s.showCuotaForm && (
        <FormDialog
          open
          onClose={() => s.setShowCuotaForm(false)}
          title={`Agregar cuota a ${cuotasBandera?.bandera}`}
          onSubmit={s.guardarCuota}
          submitLabel={s.savingCuota ? "Guardando…" : "Agregar"}
          isSubmitting={s.savingCuota}
        >
          <div className="space-y-4">
            <div>
              <Label>Número de cuotas</Label>
              <Input
                type="number"
                value={s.cuotaValor}
                onChange={(e) => s.setCuotaValor(e.target.value)}
                min={1}
                max={48}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Ej: 1 = pago único, 3 = 3 cuotas.
              </p>
            </div>
            <div>
              <Label>TEM — Tasa Efectiva Mensual (%)</Label>
              <Input
                value={s.cuotaTasa}
                onChange={(e) => {
                  if (esDecimalEnEdicion(e.target.value)) s.setCuotaTasa(e.target.value);
                }}
                placeholder="0.00"
                className="font-mono"
                inputMode="decimal"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Tasa mensual que se cobra al comercio. No editar TNA.
              </p>
            </div>
            <div>
              <Label>Estado</Label>
              <select
                value={s.cuotaEstado}
                onChange={(e) => s.setCuotaEstado(e.target.value as "Activo" | "Inactivo")}
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </FormDialog>
      )}

      {s.confirmDeleteCuota && (
        <ConfirmDialog
          open
          onClose={() => s.setConfirmDeleteCuota(null)}
          title="Eliminar cuota"
          message={`¿Eliminar la cuota ${s.confirmDeleteCuota.cuotas}x de ${cuotasBandera?.bandera}?`}
          confirmLabel="Eliminar"
          variant="danger"
          onConfirm={s.eliminarCuota}
        />
      )}
    </>
  );
}
