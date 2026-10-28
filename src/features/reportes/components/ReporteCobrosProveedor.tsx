import { Card } from "@/components/portal-shell";
import { useReporteCobrosProveedor } from "@/hooks/usePaises";
import { ReporteCobrosView } from "@/shared/ui/reporte-cobros";
import { useRangoCobros } from "@/shared/use-rango-cobros";

/* ---------- Cobros con Ecart Pay (todos los comercios) ---------- */

export function ReporteCobrosProveedor() {
  const rango = useRangoCobros();
  const { data, isLoading, error } = useReporteCobrosProveedor(rango.rango);
  return (
    <Card>
      <ReporteCobrosView
        rango={rango}
        data={data}
        isLoading={isLoading}
        error={error}
        conComercio
      />
    </Card>
  );
}
