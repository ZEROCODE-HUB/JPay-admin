import { Edit3, Plus, Trash2 } from "lucide-react";
import { brand } from "@/brand/brand";
import { Badge, BtnOutline, BtnPrimary, Card } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { formatPercent } from "@/shared/format";
import { estadoActivoTone } from "../estados";
import { useBanderasComercio } from "../hooks/useBanderasComercio";
import { BanderaFormDialog } from "./BanderaFormDialog";
import { CuotasPanel } from "./CuotasPanel";

const TH = "px-3 py-2.5 font-display font-semibold text-foreground";
const BTN_ACCION =
  "h-7 px-2 rounded-md border bg-card text-xs hover:bg-accent inline-flex items-center gap-1";

/** Banderas habilitadas de un comercio con sus comisiones y cuotas. */
export function BanderasSection({ comercioId }: { comercioId: string }) {
  const s = useBanderasComercio(comercioId);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Banderas
        </h4>
        <BtnPrimary type="button" onClick={s.openCreate} className="h-8 px-3 text-xs">
          <Plus size={14} /> Agregar bandera
        </BtnPrimary>
      </div>
      {s.loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Cargando banderas…</div>
      ) : s.error ? (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-3 text-sm text-danger-700 flex items-center justify-between">
          <span>{s.error}</span>
          <BtnOutline type="button" onClick={s.cargar} className="h-7 text-xs">
            Reintentar
          </BtnOutline>
        </div>
      ) : s.banderas.length === 0 ? (
        <div className="border border-dashed rounded-lg py-8 text-center text-sm text-muted-foreground">
          Sin banderas habilitadas para este comercio.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className={TH}>Bandera</th>
                <th className={TH}>Método</th>
                <th className={`${TH} text-right`}>% Comisión {brand.name}</th>
                <th className={`${TH} text-right`}>% Comisión PayWay</th>
                <th className={`${TH} text-right`}>% Neto</th>
                <th className={TH}>Estado</th>
                <th className={`${TH} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {s.banderas.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="px-3 py-2.5 font-medium">{b.bandera}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {b.metodoKey || "-"}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {formatPercent(b.comisionPropia)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {formatPercent(b.comisionPayway)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums font-semibold">
                    {formatPercent(b.comisionNeta)}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={estadoActivoTone(b.estado)}>{b.estado}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => s.cargarCuotas(b)}
                        className={BTN_ACCION}
                      >
                        Cuotas
                      </button>
                      <button type="button" onClick={() => s.openEdit(b)} className={BTN_ACCION}>
                        <Edit3 size={12} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => s.setConfirmDelete(b)}
                        className="h-7 px-2 rounded-md border border-danger-200 text-danger-600 bg-card text-xs hover:bg-danger-50 inline-flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.showForm && <BanderaFormDialog s={s} />}
      {s.confirmDelete && (
        <ConfirmDialog
          open
          onClose={() => s.setConfirmDelete(null)}
          title="Eliminar bandera"
          message={`¿Eliminar la bandera "${s.confirmDelete.bandera}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          variant="danger"
          onConfirm={s.eliminar}
        />
      )}

      <CuotasPanel s={s} />
    </Card>
  );
}
