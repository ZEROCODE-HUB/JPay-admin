import { Card } from "@/components/portal-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import type { TabAsignaciones } from "../hooks/useAsignacionesImpuestos";

const tabCls = (activa: boolean) =>
  `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activa ? "border-primary text-primary-ink" : "border-transparent text-muted-foreground hover:text-foreground"}`;

/** Pestañas "Asignaciones" / "Impuestos por cobrar". */
export function AsignacionesTabs({
  tab,
  onChange,
}: {
  tab: TabAsignaciones;
  onChange: (t: TabAsignaciones) => void;
}) {
  return (
    <div className="flex gap-2 mb-4 border-b">
      <button onClick={() => onChange("asignaciones")} className={tabCls(tab === "asignaciones")}>
        Asignaciones
      </button>
      <button onClick={() => onChange("por_cobrar")} className={tabCls(tab === "por_cobrar")}>
        Impuestos por cobrar
      </button>
    </div>
  );
}

/**
 * Impuestos por cobrar por lote de acreditación. Todavía no hay fuente real
 * (antes mostraba datos de ejemplo), así que queda en estado vacío.
 */
export function ImpuestosPorCobrarTab() {
  return (
    <Card>
      <EmptyState
        title="Sin datos"
        description="Los impuestos por cobrar por lote de acreditación todavía no están conectados a la base."
      />
    </Card>
  );
}
