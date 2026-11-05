import { createFileRoute } from "@tanstack/react-router";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { Badge } from "@/components/portal-shell";
import { pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/admin/configuracion/configuraciones")({
  component: Page,
  head: () => ({
    meta: [
      { title: pageTitle("Configuraciones de login — Admin") },
      { name: "description", content: "Configuraciones de los logins de las integraciones." },
    ],
  }),
});

type ConfiguracionLogin = { nombre: string; url: string; metodo: string };

// Pendiente de conectar a la base (antes eran datos de ejemplo).
const configuraciones: ConfiguracionLogin[] = [];

const columns: Column<ConfiguracionLogin>[] = [
  {
    key: "nombre",
    label: "Nombre",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-mono text-xs font-semibold">{r.nombre}</span>,
  },
  {
    key: "url",
    label: "URL",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.url}</span>,
  },
  {
    key: "metodo",
    label: "Método",
    sortable: true,
    filterable: "enum",
    filterOptions: ["GET", "POST", "PUT", "PATCH"],
    render: (r) => <Badge tone="neutral">{r.metodo}</Badge>,
  },
];

function Page() {
  return (
    <div className="space-y-2">
      <h3 className="font-display font-semibold text-lg">Configuraciones de Login</h3>
      <DataTable
        columns={columns}
        data={configuraciones}
        keyExtractor={(r) => r.nombre}
        pageSize={10}
      />
    </div>
  );
}
