import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
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
import { TAB_KEYS, type TabKey } from "@/features/clientes/detalle/utils";

type Busqueda = { tab?: TabKey; ecartpay?: "conectado" | "error"; motivo?: string };

export const Route = createFileRoute("/admin/general/usuarios/$legajo")({
  validateSearch: (s: Record<string, unknown>): Busqueda => ({
    tab: (TAB_KEYS as readonly string[]).includes(String(s.tab)) ? (s.tab as TabKey) : undefined,
    ecartpay: s.ecartpay === "conectado" || s.ecartpay === "error" ? s.ecartpay : undefined,
    motivo: typeof s.motivo === "string" ? s.motivo : undefined,
  }),
  head: () => ({
    meta: [{ title: pageTitle("Ficha de cliente — Admin") }],
  }),
  component: ClienteDetailPage,
});

function ClienteDetailPage() {
  const { legajo } = Route.useParams();
  const { tab, ecartpay, motivo } = Route.useSearch();
  const navigate = useNavigate();
  const data = useClienteDetalle(legajo);
  const ui = useClienteDetalleUi(tab);

  // Vuelta desde Ecart Pay (vinculación iniciada en la pestaña Conexiones): avisar y limpiar la URL.
  useEffect(() => {
    if (!ecartpay) return;
    if (ecartpay === "conectado") toast.success("Cobros con tarjeta vinculados");
    else toast.error(`No se pudo vincular la cuenta${motivo ? `: ${motivo}` : ""}`);
    void navigate({
      to: "/admin/general/usuarios/$legajo",
      params: { legajo },
      search: { tab: "cobre" },
      replace: true,
    });
  }, [ecartpay, motivo, legajo, navigate]);
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
