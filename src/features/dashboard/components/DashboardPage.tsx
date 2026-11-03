import { Activity } from "lucide-react";
import { PageHeader, Stat } from "@/components/portal-shell";
import { brand } from "@/brand/brand";
import { AcreditacionesCard } from "./AcreditacionesCard";
import { ComisionesCard } from "./ComisionesCard";
import { VolumenSistemaRow } from "./VolumenSistemaRow";
import { RegistrosAlertasRow } from "./RegistrosAlertasRow";
import { useDashboardKpis } from "../hooks/useDashboardKpis";
import { formatMoney, formatNumber } from "@/shared/format";

// Los indicadores de arriba salen de la base (`dashboard_kpis`). Sin datos hasta conectar:
// acreditaciones, volumen, estado del sistema, últimos registros y alertas recientes.

const plural = (n: number, uno: string, varios: string) =>
  `${formatNumber(n)} ${n === 1 ? uno : varios}`;

export function DashboardPage() {
  const { data: k, isLoading, isError } = useDashboardKpis();
  const valor = (v: string) => (isLoading ? "…" : isError || !k ? "—" : v);
  const sub = (v: string) => (isLoading ? "Cargando…" : isError || !k ? "No se pudo cargar" : v);
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
        <Stat
          label="Clientes activos"
          value={valor(formatNumber(k?.clientesActivos ?? 0))}
          sub={sub(`de ${plural(k?.clientesTotal ?? 0, "cliente", "clientes")}`)}
        />
        <Stat
          label="Volumen del día"
          value={valor(formatMoney(k?.volumenDia ?? 0, { moneda: k?.moneda }))}
          sub={sub(`${plural(k?.operacionesDia ?? 0, "operación", "operaciones")} hoy`)}
        />
        <Stat
          label="Alertas pendientes"
          value={valor(formatNumber(k?.alertasPendientes ?? 0))}
          sub={sub(
            k?.alertasVencidas
              ? `${plural(k.alertasVencidas, "vencida", "vencidas")}`
              : "Ninguna vencida",
          )}
        />
        <Stat
          label="Altas en revisión"
          value={valor(formatNumber(k?.altasRevision ?? 0))}
          sub={sub(
            k?.altasSinEmail
              ? `${plural(k.altasSinEmail, "sin verificar el correo", "sin verificar el correo")}`
              : "Registradas o preactivadas",
          )}
        />
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
