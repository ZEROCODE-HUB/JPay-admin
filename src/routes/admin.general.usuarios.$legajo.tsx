import { createFileRoute } from "@tanstack/react-router";
import { PermissionGuard } from "@/components/permission-guard";
import { pageTitle } from "@/brand/brand";
import { useClienteDetalle } from "@/features/clientes/detalle/hooks/useClienteDetalle";
import { useClienteDetalleUi } from "@/features/clientes/detalle/hooks/useClienteDetalleUi";
import {
  ClienteCargando,
  ClienteError,
  ClienteNoEncontrado,
} from "@/features/clientes/detalle/components/ClienteEstados";
import { ClienteDetalle } from "@/features/clientes/detalle/components/ClienteDetalle";

export const Route = createFileRoute("/admin/general/usuarios/$legajo")({
  head: () => ({
    meta: [{ title: pageTitle("Ficha de cliente — Admin") }],
  }),
  component: ClienteDetailPage,
});

function ClienteDetailPage() {
  const { legajo } = Route.useParams();
  const data = useClienteDetalle(legajo);
  const ui = useClienteDetalleUi();
  const { cliente, isLoading, isError, error, refetch } = data;

  if (isLoading) return <ClienteCargando />;
  if (isError) return <ClienteError error={error} refetch={() => refetch()} />;
  if (!cliente) return <ClienteNoEncontrado legajo={legajo} />;

  return (
    <PermissionGuard recurso="usuarios">
      <ClienteDetalle legajo={legajo} cliente={cliente} data={data} ui={ui} />
    </PermissionGuard>
  );
}
