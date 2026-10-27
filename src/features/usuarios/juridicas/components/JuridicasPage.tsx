import type { Cliente } from "@/lib/api/types";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ClientesListadoContenido } from "../../comun/components/ClientesListadoContenido";
import { ConfirmAccionDialog } from "../../comun/components/ConfirmAccionDialog";
import { useClientesListado } from "../../comun/hooks/useClientesListado";
import { useJuridicasAcciones } from "../hooks/useJuridicasAcciones";
import { toJuridicaRow, type JuridicaRow } from "../utils";
import { columns } from "./columns";

/** Listado de personas jurídicas. */
export function JuridicasPage() {
  // Enrichment paralelo: comercios y CVUs por legajo (mismo patrón que Personas Físicas).
  const listado = useClientesListado({
    tipoPersona: "juridica",
    enrichmentKey: "clientes-enrichment-juridicas",
  });
  const { getActions, confirmAction, cerrarConfirm } = useJuridicasAcciones();

  const data: JuridicaRow[] = listado.rows.map((c: Cliente) =>
    toJuridicaRow(c, listado.enrichmentMap[c.legajo]),
  );

  return (
    <PermissionGuard recurso="usuarios">
      <PageHeader
        title="Personas jurídicas"
        description="Empresas y organizaciones — flujo homologado con personas físicas."
      />

      <ClientesListadoContenido
        listado={listado}
        columns={columns}
        data={data}
        getActions={getActions}
        cargandoTexto="Cargando…"
        errorTitulo="Ocurrió un error al cargar las personas jurídicas"
        vacioTexto="No hay personas jurídicas que coincidan con la búsqueda."
        countLabel="resultado(s)"
      />

      <ConfirmAccionDialog confirmAction={confirmAction} onClose={cerrarConfirm} />
    </PermissionGuard>
  );
}
