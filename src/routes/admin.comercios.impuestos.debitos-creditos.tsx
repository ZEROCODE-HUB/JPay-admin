import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { pageTitle } from "@/brand/brand";
import { BtnPrimary, PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { ActionsDropdown } from "@/components/actions-dropdown";
import { DataTable } from "@/shared/ui/data-table";
import { useDebitosCreditos } from "@/features/impuestos/debitos-creditos/hooks/useDebitosCreditos";
import { ExcepcionesFiltros } from "@/features/impuestos/debitos-creditos/components/ExcepcionesFiltros";
import { AltaExcepcionModal } from "@/features/impuestos/debitos-creditos/components/AltaExcepcionModal";
import {
  accionesExcepcion,
  columnasExcepciones,
} from "@/features/impuestos/debitos-creditos/components/columns";
import { PAGE_SIZE } from "@/features/impuestos/debitos-creditos/utils";
import { ListadoPaginado } from "@/features/impuestos/components/ListadoPaginado";
import { ConfirmActionDialog } from "@/features/impuestos/components/ConfirmActionDialog";
import type { ErrorListado } from "@/features/impuestos/types";

export const Route = createFileRoute("/admin/comercios/impuestos/debitos-creditos")({
  head: () => ({ meta: [{ title: pageTitle("Débitos y créditos — Admin") }] }),
  component: Page,
});

function Page() {
  const s = useDebitosCreditos();
  const { listado } = s;

  return (
    <PermissionGuard recurso="impuestos">
      <PageHeader
        title="Débitos y créditos"
        description="Excepciones manuales de impuestos débito/crédito. Este impuesto se presenta una vez por semana."
        action={
          <BtnPrimary type="button" onClick={() => s.setShowAlta(true)} disabled={!s.puedeCrear}>
            <Plus size={14} /> Nueva excepción
          </BtnPrimary>
        }
      />

      <ExcepcionesFiltros s={s} />

      <ListadoPaginado
        isLoading={listado.isLoading}
        isError={listado.isError}
        isEmpty={listado.isEmpty}
        isFetching={listado.isFetching}
        error={(listado.error ?? null) as ErrorListado}
        onRetry={() => listado.refetch()}
        page={s.page}
        setPage={s.setPage}
        total={listado.total}
        pageSize={PAGE_SIZE}
        textos={{
          cargando: "Cargando excepciones…",
          errorTitulo: "Ocurrió un error al cargar las excepciones",
          vacio: "No hay excepciones que coincidan con la búsqueda.",
          contador: "excepcion(es)",
        }}
      >
        <DataTable
          columns={columnasExcepciones}
          data={listado.rows}
          keyExtractor={(r) => r.id}
          pageSize={PAGE_SIZE}
          showDownloadButton={false}
          actions={(r) => <ActionsDropdown actions={accionesExcepcion(s, r)} />}
        />
      </ListadoPaginado>

      {s.showAlta && <AltaExcepcionModal s={s} />}

      <ConfirmActionDialog action={s.confirmAction} onClose={s.cerrarDialogo} />
    </PermissionGuard>
  );
}
