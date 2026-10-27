import { Activity } from "lucide-react";
import { PageHeader, Stat } from "@/components/portal-shell";
import { brand } from "@/brand/brand";
import { AcreditacionesCard } from "./AcreditacionesCard";
import { ComisionesCard } from "./ComisionesCard";
import { VolumenSistemaRow } from "./VolumenSistemaRow";
import { RegistrosAlertasRow } from "./RegistrosAlertasRow";

// Sin datos hasta conectar con la base: KPIs, acreditaciones, volumen, estado del sistema,
// últimos registros y alertas recientes eran valores de ejemplo escritos a mano.

export function DashboardPage() {
  return (
    <div className="bg-white -m-4 md:-m-6 lg:-mx-8 lg:-my-6 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
      <PageHeader
        title="Dashboard administrativo"
        description={`Estado global de la plataforma ${brand.shortName}.`}
        action={
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <Activity size={14} className="text-primary-ink" /> Sistema operativo
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Clientes activos" value="—" sub="Sin datos" />
        <Stat label="Volumen del dia" value="—" sub="Sin datos" />
        <Stat label="Alertas pendientes" value="—" sub="Sin datos" />
        <Stat label="Altas en revision" value="—" sub="Sin datos" />
      </div>

      {/* Acreditaciones — formato operación */}
      <AcreditacionesCard />

      <ComisionesCard />

      {/* Volume chart + system health */}
      <VolumenSistemaRow />

      {/* Lower row */}
      <RegistrosAlertasRow />
    </div>
  );
}
