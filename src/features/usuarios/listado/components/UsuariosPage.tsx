import type { Cliente } from "@/lib/api/types";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ClientesListadoContenido } from "../../comun/components/ClientesListadoContenido";
import { ConfirmAccionDialog } from "../../comun/components/ConfirmAccionDialog";
import { useClientesListado } from "../../comun/hooks/useClientesListado";
import { useUsuariosAcciones } from "../hooks/useUsuariosAcciones";
import { toUsuario, type Usuario } from "../utils";
import { visibleColumns } from "./columns";

/** Listado de personas físicas. */
export function UsuariosPage() {
  // Enrichment paralelo: riesgo PLAFT + CVUs + KYC + consumo del mes.
  const listado = useClientesListado({
    tipoPersona: "fisica",
    enrichmentKey: "clientes-enrichment",
  });
  const { getActions, confirmAction, cerrarConfirm } = useUsuariosAcciones();

  const data: Usuario[] = listado.rows.map((c: Cliente) =>
    toUsuario(c, listado.enrichmentMap[c.legajo]),
  );

  return (
    <PermissionGuard recurso="usuarios">
      <PageHeader
        title="Usuarios de la plataforma"
        description="Personas físicas — flujo homologado: Pendiente → Registrado → Preactivado → Activado."
      />

      <ClientesListadoContenido
        listado={listado}
        columns={visibleColumns}
        data={data}
        getActions={getActions}
        cargandoTexto="Cargando usuarios…"
        errorTitulo="Ocurrió un error al cargar los usuarios"
        vacioTexto="No hay usuarios que coincidan con la búsqueda."
        agruparMensaje
        countLabel="usuario(s)"
      />

      <ConfirmAccionDialog confirmAction={confirmAction} onClose={cerrarConfirm} />
    </PermissionGuard>
  );
}
