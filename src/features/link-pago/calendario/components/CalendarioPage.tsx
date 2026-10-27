import { Loader2 } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import { PageHeader } from "@/components/portal-shell";
import { useCalendario } from "../hooks/useCalendario";
import { CalendarioGrilla, CalendarioLeyenda } from "./CalendarioGrilla";
import { CalendarioToolbar } from "./CalendarioToolbar";
import { DiaDetalleModal } from "./DiaDetalleModal";
import { SaldosKpis } from "./SaldosKpis";

/** Pantalla "Calendario de Acreditaciones" de links de pago. */
export function CalendarioPage() {
  const s = useCalendario();

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title="Calendario de Acreditaciones"
        description="Cuándo se acredita cada lote y cuánto tenés disponible para nuevos adelantos."
      />

      <SaldosKpis resumen={s.resumen} loading={s.loadingResumen} />

      <CalendarioToolbar s={s} />

      {s.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin mr-2" />
          Cargando calendario…
        </div>
      ) : (
        <CalendarioGrilla
          dias={s.dias}
          porFecha={s.acreditacionesPorFecha}
          estadoFilter={s.estadoFilter}
          minMonto={s.minMonto}
          onDiaClick={s.handleDiaClick}
        />
      )}

      <CalendarioLeyenda />

      {s.selectedFecha && s.selectedItems.length > 0 && (
        <DiaDetalleModal
          fecha={s.selectedFecha}
          items={s.selectedItems}
          onClose={s.cerrarDia}
          minMonto={s.minMonto}
        />
      )}
    </PermissionGuard>
  );
}
