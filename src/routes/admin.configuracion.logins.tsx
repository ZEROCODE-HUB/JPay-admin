import { formatNumber } from "@/shared/format";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { PageHeader, Badge } from "@/components/portal-shell";
import { useIntegraciones } from "@/hooks/useIntegraciones";
import { PermissionGuard } from "@/components/permission-guard";
import type { Integracion } from "@/lib/api/types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/configuracion/logins")({
  component: Page,
  head: () => ({
    meta: [
      { title: pageTitle("Logins configurados — Admin") },
      { name: "description", content: "Logins de integraciones configurados en la plataforma." },
    ],
  }),
});

type Salud = "ok" | "warning" | "error";

// Métricas operativas por integración: vacías hasta que exista el sistema de monitoreo/cron
// que las informe (antes eran datos de ejemplo).
const mockSalud: Record<string, Salud> = {};

const mockUltimaEjecucion: Record<string, string> = {};

const mockProximaEjecucion: Record<string, string> = {};

const mockTiempoRestante: Record<string, string> = {};

const mockEjecuciones: Record<string, number> = {};

const mockProgramacion: Record<string, string> = {};

type LoginConfig = {
  nombre: string;
  negocio: string;
  programacion: string;
  ultimaEjecucion: string;
  proximaEjecucion: string;
  tiempoRestante: string;
  ejecuciones: number;
  salud: Salud;
};

function Page() {
  const { rows: integraciones } = useIntegraciones({
    page: 0,
    pageSize: 100,
  });

  const buildUI = (i: Integracion): LoginConfig => ({
    nombre: i.id,
    negocio: i.nombre,
    programacion: mockProgramacion[i.id] ?? "—",
    ultimaEjecucion: mockUltimaEjecucion[i.id] ?? "—",
    proximaEjecucion: mockProximaEjecucion[i.id] ?? "—",
    tiempoRestante: mockTiempoRestante[i.id] ?? "—",
    ejecuciones: mockEjecuciones[i.id] ?? 0,
    salud: mockSalud[i.id] ?? "ok",
  });

  const loginsConfigurados = integraciones.map(buildUI);

  const saludMeta: Record<
    Salud,
    { label: string; tone: "success" | "warn" | "danger"; icon: typeof CheckCircle2 }
  > = {
    ok: { label: "Funcionando correctamente", tone: "success", icon: CheckCircle2 },
    warning: { label: "Ejecución reciente con demoras", tone: "warn", icon: AlertTriangle },
    error: { label: "Última ejecución fallida", tone: "danger", icon: XCircle },
  };

  const columns: Column<LoginConfig>[] = [
    {
      key: "nombre",
      label: "Nombre",
      sortable: true,
      filterable: true,
      render: (r) => (
        <div>
          <div className="font-mono text-xs font-semibold">{r.nombre}</div>
          <div className="text-[11px] text-muted-foreground">{r.negocio}</div>
        </div>
      ),
    },
    {
      key: "programacion",
      label: "Programación",
      sortable: true,
      render: (r) => <span className="font-mono text-xs">{r.programacion}</span>,
    },
    {
      key: "ultimaEjecucion",
      label: "Última ejecución",
      sortable: true,
      filterable: "date",
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.ultimaEjecucion}</span>,
    },
    {
      key: "proximaEjecucion",
      label: "Próxima ejecución",
      sortable: true,
      filterable: "date",
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.proximaEjecucion}</span>,
    },
    {
      key: "tiempoRestante",
      label: "Tiempo restante",
      sortable: true,
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.tiempoRestante}</span>,
    },
    {
      key: "ejecuciones",
      label: "Ejecuciones",
      sortable: true,
      render: (r) => (
        <span className="font-semibold tabular-nums">{formatNumber(r.ejecuciones)}</span>
      ),
    },
    {
      key: "salud",
      label: "Estado",
      sortable: true,
      render: (r) => {
        const meta = saludMeta[r.salud];
        return (
          <Badge tone={meta.tone} className="gap-1">
            <meta.icon size={12} />
            {meta.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <PermissionGuard recurso="gestor_integraciones">
      <div className="space-y-2">
        <PageHeader
          title="Logins configurados"
          description="Logins de integraciones configurados en la plataforma."
        />
        <DataTable
          columns={columns}
          data={loginsConfigurados}
          keyExtractor={(r) => r.nombre}
          pageSize={10}
          showDownloadButton={false}
        />
      </div>
    </PermissionGuard>
  );
}
