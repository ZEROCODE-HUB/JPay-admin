import { Activity } from "lucide-react";
import { PageHeader, Stat } from "@/components/portal-shell";
import { brand } from "@/brand/brand";
import { ComisionesCard } from "./ComisionesCard";
import { VolumenSistemaRow } from "./VolumenSistemaRow";
import { RegistrosAlertasRow } from "./RegistrosAlertasRow";
import { useDashboardKpis } from "../hooks/useDashboardKpis";
import { useDashboardDetalle } from "../hooks/useDashboardDetalle";
import { CobrosProveedorCard } from "./CobrosProveedorCard";
import { AprobacionesPendientesCard } from "./AprobacionesPendientesCard";
import { usePaisConModulos } from "@/shared/modulos-pais";
import { useRealtimeInvalidate } from "@/shared/realtime";
import { formatMoney, formatNumber } from "@/shared/format";

// Indicadores (`dashboard_kpis`) y el resto del inicio (`dashboard_detalle`) salen de la base.
// Los cobros salen de Ecart Pay.

const plural = (n: number, uno: string, varios: string) =>
  `${formatNumber(n)} ${n === 1 ? uno : varios}`;

export function DashboardPage() {
  const { data: k, isLoading, isError } = useDashboardKpis();
  const detalle = useDashboardDetalle();
  // Tiempo real: cualquier cambio en estas tablas vuelve a pedir los datos del inicio.
  useRealtimeInvalidate("realtime-dashboard", {
    transactions: [["dashboard"]],
    pagos: [["dashboard"]],
    alerts: [["dashboard"]],
    clientes: [["dashboard"]],
    cobros_recurrentes: [["dashboard"]],
  });
  const pais = usePaisConModulos();
  const det = { d: detalle.data, isLoading: detalle.isLoading, isError: detalle.isError };
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
          info="Clientes con la cuenta activada, de la base de JPay. El total de abajo cuenta a todos los clientes registrados, en cualquier estado, salvo los eliminados. Se actualiza cada minuto."
          value={valor(formatNumber(k?.clientesActivos ?? 0))}
          sub={sub(`de ${plural(k?.clientesTotal ?? 0, "cliente", "clientes")}`)}
        />
        <Stat
          label="Volumen del día"
          info="Suma de todas las operaciones contabilizadas hoy en el libro contable de JPay (depósitos, retiros, transferencias, etc.), solo en la moneda del país (MXN). «Hoy» se cuenta desde las 00:00 hora de México. Montos brutos, sin descontar comisiones."
          value={valor(formatMoney(k?.volumenDia ?? 0, { moneda: k?.moneda }))}
          sub={sub(`${plural(k?.operacionesDia ?? 0, "operación", "operaciones")} hoy`)}
        />
        <Stat
          label="Alertas pendientes"
          info="Alertas de monitoreo en estado pendiente o en revisión (todavía sin resolver ni descartar). «Vencidas» son las que ya pasaron su plazo de atención."
          value={valor(formatNumber(k?.alertasPendientes ?? 0))}
          sub={sub(
            k?.alertasVencidas
              ? `${plural(k.alertasVencidas, "vencida", "vencidas")}`
              : "Ninguna vencida",
          )}
        />
        <Stat
          label="Altas en revisión"
          info="Clientes registrados o preactivados que esperan la revisión del backoffice para activarse. Abajo se cuentan aparte los que se registraron pero todavía no verifican su correo (no están incluidos en el número grande)."
          value={valor(formatNumber(k?.altasRevision ?? 0))}
          sub={sub(
            k?.altasSinEmail
              ? `${plural(k.altasSinEmail, "sin verificar el correo", "sin verificar el correo")}`
              : "Registradas o preactivadas",
          )}
        />
      </div>

      {pais.modulos.transferencias_cobre && <AprobacionesPendientesCard />}

      {pais.modulos.pagos_proveedor && <CobrosProveedorCard {...det} />}

      <ComisionesCard />

      {/* Volume chart + system health */}
      <VolumenSistemaRow {...det} />

      {/* Lower row */}
      <RegistrosAlertasRow {...det} />
    </div>
  );
}
