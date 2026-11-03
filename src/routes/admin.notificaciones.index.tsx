import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { PageHeader, Card, Badge, BtnOutline } from "@/components/portal-shell";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { DeveloperModeToggle } from "@/components/developer-mode-toggle";
import { pageTitle } from "@/brand/brand";
import { useEventosNotificacion } from "@/hooks/useEventosNotificacion";
import type { EventoNotificacion } from "@/lib/api/types";
import { formatDateTime } from "@/shared/format";

export const Route = createFileRoute("/admin/notificaciones/")({
  component: Page,
  head: () => ({
    meta: [
      { title: pageTitle("Centro de Notificaciones — Admin") },
      { name: "description", content: "Eventos de negocio y su estado de notificación." },
    ],
  }),
});

type Destinatarios = "Admin" | "Cliente" | "Ambos";
type Canal = "Email" | "Telegram" | "WhatsApp";

type Evento = {
  id: string;
  evento: string;
  afecta: string;
  fecha: string;
  destinatarios: Destinatarios;
  canal: Canal;
  entregado: boolean;
};

/** Evento de `eventos_notificacion` en el formato de la tabla. */
function aEvento(n: EventoNotificacion): Evento {
  const afecta = n.metadata?.afecta;
  return {
    id: n.id,
    evento: n.titulo,
    afecta: typeof afecta === "string" && afecta ? afecta : n.mensaje,
    fecha: formatDateTime(n.fecha),
    destinatarios: n.audiencia,
    canal: n.canal,
    entregado: n.estadoEntrega === "enviado",
  };
}

const destinatarioTone: Record<Destinatarios, "neutral" | "success" | "warn"> = {
  Admin: "neutral",
  Cliente: "success",
  Ambos: "warn",
};

const canalTone: Record<Canal, "neutral" | "success" | "warn"> = {
  Email: "neutral",
  Telegram: "success",
  WhatsApp: "warn",
};

function Page() {
  const q = useEventosNotificacion({ page: 0, pageSize: 200 });
  const eventos = q.rows.map(aEvento);

  const getActions = (_r: Evento): ActionItem[] => [
    {
      label: "Ver detalle",
      icon: Eye,
      onClick: () => {},
    },
  ];

  const columns: Column<Evento>[] = [
    {
      key: "evento",
      label: "Evento",
      sortable: true,
      filterable: true,
      render: (r) => <span className="font-medium">{r.evento}</span>,
    },
    {
      key: "afecta",
      label: "Afecta a",
      sortable: true,
      filterable: true,
      render: (r) => <span className="text-xs text-muted-foreground">{r.afecta}</span>,
    },
    {
      key: "fecha",
      label: "Cuándo",
      sortable: true,
      filterable: "date",
      render: (r) => <span className="font-mono text-xs tabular-nums">{r.fecha}</span>,
    },
    {
      key: "destinatarios",
      label: "Destinatarios",
      sortable: true,
      filterable: "enum",
      filterOptions: ["Admin", "Cliente", "Ambos"],
      render: (r) => <Badge tone={destinatarioTone[r.destinatarios]}>{r.destinatarios}</Badge>,
    },
    {
      key: "canal",
      label: "Canal",
      sortable: true,
      filterable: "enum",
      filterOptions: ["Email", "Telegram", "WhatsApp"],
      render: (r) => <Badge tone={canalTone[r.canal]}>{r.canal}</Badge>,
    },
    {
      key: "entregado",
      label: "Estado de entrega",
      sortable: true,
      filterable: "enum",
      filterOptions: ["Entregado", "Fallido"],
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r.entregado ? (
            <CheckCircle2 size={14} className="text-emerald-500" />
          ) : (
            <XCircle size={14} className="text-danger-500" />
          )}
          <Badge tone={r.entregado ? "success" : "danger"}>
            {r.entregado ? "Entregado" : "Fallido"}
          </Badge>
        </div>
      ),
    },
  ];

  const entregadas = eventos.filter((e) => e.entregado).length;
  const fallidas = eventos.length - entregadas;
  const conCliente = eventos.filter((e) => e.destinatarios !== "Admin").length;

  return (
    <>
      <PageHeader
        title="Centro de Notificaciones"
        description="Qué pasó, a quién afectó y si se notificó correctamente."
        action={<DeveloperModeToggle />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Notificaciones
          </div>
          <div className="font-display text-xl md:text-2xl font-semibold mt-1 tabular-nums">
            {eventos.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {q.isLoading ? "Cargando…" : "últimos eventos registrados"}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Entregadas</div>
          <div className="font-display text-xl md:text-2xl font-semibold mt-1 tabular-nums text-emerald-600">
            {entregadas}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round((entregadas / Math.max(1, eventos.length)) * 100)}% de entrega
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Fallidas</div>
          <div className="font-display text-xl md:text-2xl font-semibold mt-1 tabular-nums text-danger-600">
            {fallidas}
          </div>
          <div className="text-xs text-muted-foreground mt-1">requieren revisión</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Con destinatario Cliente
          </div>
          <div className="font-display text-xl md:text-2xl font-semibold mt-1 tabular-nums">
            {conCliente}
          </div>
          <div className="text-xs text-muted-foreground mt-1">visibles en Cliente Empresa</div>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display font-semibold text-lg">Eventos recientes</h3>
          <BtnOutline type="button" className="h-8 text-xs px-3">
            Exportar historial
          </BtnOutline>
        </div>
        <DataTable
          columns={columns}
          data={eventos}
          keyExtractor={(r) => r.id}
          pageSize={10}
          actions={(r) => <ActionsDropdown actions={getActions(r)} />}
        />
      </div>
    </>
  );
}
