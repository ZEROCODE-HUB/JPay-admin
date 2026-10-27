import { AlertTriangle, Eye, Plus, UploadCloud } from "lucide-react";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { ImportarContracargosModal } from "@/components/importar-contracargos-modal";
import { PermissionGuard } from "@/components/permission-guard";
import { Card, PageHeader } from "@/components/portal-shell";
import type { Contra, EstadoContra } from "@/lib/api/contracargos";
import { DataTable } from "@/shared/ui/data-table";
import { ESTADO_LABEL, ESTADO_OPTIONS_UI } from "../estados";
import { useContracargos } from "../hooks/useContracargos";
import { contracargosColumns } from "./columns";
import { ContracargoDetalleModal } from "./ContracargoDetalleModal";
import { CrearSimulacionModal } from "./CrearSimulacionModal";

/** Pantalla "Contracargos" de links de pago. */
export function ContracargosPage() {
  const s = useContracargos();

  const getActions = (r: Contra): ActionItem[] => {
    const base: ActionItem[] = [
      { label: "Ver / gestionar", icon: Eye, onClick: () => s.setDetail(r) },
    ];
    if (r.estado === "Simulado" && s.puedeGestionar) {
      base.push({
        label: "Confirmar (Aplicar)",
        icon: AlertTriangle,
        onClick: () => s.setDetail(r),
      });
    }
    return base;
  };

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Contracargos"
        description="Gestión de contracargos de links de pago. Simular impacto → confirmar para aplicar."
      />
      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground mb-4">
        <strong>Flujo:</strong> Simular (carga manual) → Confirmar (aplica descuento al lote) → En
        mediación (doc) → Cerrado acreditado / retenido. Los contracargos de simulación no afectan
        la caja ni los lotes.
      </div>

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={s.estadoFilter}
            onChange={(e) => s.setEstadoFilter(e.target.value as EstadoContra | "")}
            className="h-8 px-2 rounded-md border bg-background text-xs"
          >
            <option value="">Todos los estados</option>
            {ESTADO_OPTIONS_UI.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {s.puedeGestionar && (
            <button
              onClick={() => s.setShowImportar(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border bg-card text-xs font-semibold hover:bg-muted"
              title="Importar reporte de Alertas Tempranas de PayWay"
            >
              <UploadCloud size={14} /> Importar PayWay
            </button>
          )}
          {s.puedeGestionar && (
            <button
              onClick={() => s.setShowCrear(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
            >
              <Plus size={14} /> Simular contracargo
            </button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {ESTADO_OPTIONS_UI.map((e) => (
          <Card key={e} className="p-3">
            <div className="text-xs text-muted-foreground">{ESTADO_LABEL[e]}</div>
            <div className="font-mono text-xl font-semibold mt-1">{s.kpis[e] ?? 0}</div>
          </Card>
        ))}
      </div>

      <DataTable
        columns={contracargosColumns}
        data={s.rows}
        loading={s.isLoading}
        keyExtractor={(r) => r.id}
        actions={(r) => <ActionsDropdown actions={getActions(r)} />}
      />

      {s.detail && <ContracargoDetalleModal c={s.detail} onClose={() => s.setDetail(null)} />}
      {s.showCrear && <CrearSimulacionModal onClose={() => s.setShowCrear(false)} />}
      {s.showImportar && <ImportarContracargosModal onClose={() => s.setShowImportar(false)} />}
    </PermissionGuard>
  );
}
