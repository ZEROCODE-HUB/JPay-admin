import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";
import { PageHeader, Card, Stat, Badge } from "@/components/portal-shell";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/modulos")({
  component: Page,
  head: () => ({
    meta: [
      { title: pageTitle("Salud de módulos — Admin") },
      { name: "description", content: "Estado operativo de todos los módulos de la plataforma." },
    ],
  }),
});

type ModuleStatus = {
  name: string;
  status: "operativo" | "degradado" | "caído";
  latency: string;
};

// Sin sistema de monitoreo todavía: vacío hasta que exista una fuente real (antes eran datos de
// ejemplo).
const modules: ModuleStatus[] = [];

const pct = (n: number) => (modules.length ? `${Math.round((n / modules.length) * 100)}%` : "—");

function StatusIcon({ status }: { status: ModuleStatus["status"] }) {
  if (status === "operativo") return <CheckCircle2 size={18} className="text-primary-ink" />;
  if (status === "degradado") return <AlertTriangle size={18} className="text-amber-500" />;
  return <XCircle size={18} className="text-danger-500" />;
}

function statusBadgeTone(status: ModuleStatus["status"]): "success" | "warn" | "danger" {
  if (status === "operativo") return "success";
  if (status === "degradado") return "warn";
  return "danger";
}

function Page() {
  const operativos = modules.filter((m) => m.status === "operativo").length;
  const degradados = modules.filter((m) => m.status === "degradado").length;
  const caidos = modules.filter((m) => m.status === "caído").length;

  return (
    <>
      <PageHeader
        title="Salud de módulos"
        description="Estado operativo de todos los módulos de la plataforma."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat label="Módulos totales" value={String(modules.length)} />
        <Stat label="Operativos" value={String(operativos)} sub={pct(operativos)} />
        <Stat label="Degradados" value={String(degradados)} sub={pct(degradados)} />
        <Stat label="Caídos" value={String(caidos)} sub={pct(caidos)} />
        <Stat label="Latencia promedio" value="—" />
      </div>

      <Card>
        <div className="space-y-1">
          {modules.length === 0 && (
            <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Activity size={14} /> Todavía no hay un sistema de monitoreo conectado.
            </p>
          )}
          {modules.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between py-2.5 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={m.status} />
                <span className="font-medium text-sm">{m.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">{m.latency}</span>
                <Badge tone={statusBadgeTone(m.status)}>{m.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
