import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, FilterX, Layers, ShieldAlert } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { MovimientoDetail, type Movimiento } from "@/components/movimiento-detail";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useCambiarEstadoMovimiento } from "@/hooks/useMovimientoActions";
import { useEstadosMovimiento } from "@/hooks/useEstados";
import type { LineaMovimiento } from "@/lib/api/lineas-movimiento";
import { getMovimiento } from "@/lib/api/movimientos";
import { useCan } from "@/lib/permissions";
import { CambiarEstadoDialog } from "../../comun/components/CambiarEstadoDialog";
import { CargandoMovimientos, ErrorMovimientos } from "../../comun/components/EstadosCarga";
import { toViewMovimiento, type EstadoTarget } from "../../comun/utils";
import { useMovimientosListado } from "../hooks/useMovimientosListado";
import { fmtFecha, PAGE_SIZES, type Fila } from "../utils";
import { buildColumns } from "./columns";
import { FiltroActivoBanner } from "./FiltroActivoBanner";
import { FiltrosExtra } from "./FiltrosExtra";

/** Todos los movimientos: una fila por línea del ledger, agrupable por TXID. */
export function MovimientosPage({ legajo, txidUrl }: { legajo?: string; txidUrl?: string }) {
  const navigate = useNavigate();
  const l = useMovimientosListado({ legajo, txidInicial: txidUrl });
  const { total, isLoading, isFetching, isError, error, refetch } = l.query;

  const { data: estados = [] } = useEstadosMovimiento();
  const [detail, setDetail] = useState<Movimiento | null>(null);
  const [estadoTarget, setEstadoTarget] = useState<EstadoTarget | null>(null);
  const cambiarEstado = useCambiarEstadoMovimiento();
  const { can } = useCan();
  const puedeModificar = can("modificar", "movimientos");

  const verDetalle = async (row: LineaMovimiento) => {
    const m = await getMovimiento(row.transactionId);
    if (m) setDetail(toViewMovimiento(m, estados, fmtFecha));
  };

  const getActions = (row: Fila): ActionItem[] => [
    { label: "Ver detalle de la operación", icon: Eye, onClick: () => void verDetalle(row) },
    {
      label: "Ver todas las líneas del TXID",
      icon: Layers,
      onClick: () => l.filtrarTxid(row.idTxn),
    },
    {
      label: "Cambiar estado",
      icon: ShieldAlert,
      disabled: !puedeModificar || row.ledgerStatus === "legacy",
      onClick: () =>
        setEstadoTarget({
          dbId: row.transactionId,
          estadoActual: row.estadoCodigo,
          nuevoId: row.estadoId,
        }),
    },
    {
      label: "Ver movimientos del cliente",
      icon: FilterX,
      onClick: () => navigate({ to: "/admin/general/movimientos", search: { legajo: row.legajo } }),
    },
  ];

  const columns = buildColumns({
    filtrarTxid: l.filtrarTxid,
    toggle: l.toggle,
    abiertos: l.abiertos,
    agrupar: l.agrupar,
  });

  const totalPaginas = Math.max(1, Math.ceil((total || 0) / l.pageSize));

  return (
    <PermissionGuard recurso="movimientos">
      <PageHeader
        title="Todos los movimientos"
        description="Una fila por concepto (ingreso, comisión, impuesto), contabilizada en el ledger. Las líneas de una misma operación comparten el TXID."
      />

      {(legajo || l.txid) && (
        <FiltroActivoBanner
          legajo={legajo}
          txid={l.txid}
          onLimpiar={() => {
            l.setTxid("");
            navigate({ to: "/admin/general/movimientos", search: {} });
          }}
        />
      )}

      {isLoading ? (
        <CargandoMovimientos texto="Cargando movimientos…" />
      ) : isError ? (
        <ErrorMovimientos error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={l.data}
            keyExtractor={(r) => r.lineId + ":" + r.lineNo}
            actions={(r) => <ActionsDropdown actions={getActions(r)} />}
            hidePagination
            extraFilters={
              <FiltrosExtra
                txid={l.txid}
                onTxid={l.filtrarTxid}
                cuit={l.cuit}
                onCuit={l.setCuit}
                cvu={l.cvu}
                onCvu={l.setCvu}
                operacion={l.operacion}
                onOperacion={l.setOperacion}
                agrupar={l.agrupar}
                onAgrupar={l.setAgrupar}
              />
            }
            serverFilterState={l.filtrosPanel}
            onServerFilterChange={l.aplicarFiltros}
            serverResultCount={total}
            emptyMessage="No hay movimientos que coincidan con los filtros aplicados."
          />
          <Pagination
            page={l.page + 1}
            totalPages={totalPaginas}
            pageSize={l.pageSize}
            total={total}
            countLabel="línea(s)"
            pageSizes={PAGE_SIZES}
            disabled={isFetching}
            onPageChange={(p) => l.setPage(p - 1)}
            onPageSizeChange={l.setPageSize}
          />
        </>
      )}

      {detail && <MovimientoDetail m={detail} onClose={() => setDetail(null)} />}

      {estadoTarget && (
        <CambiarEstadoDialog
          target={estadoTarget}
          setTarget={setEstadoTarget}
          estados={estados}
          cambiarEstado={cambiarEstado}
          title="Cambiar estado de la operación"
          description={`Cambia el estado de toda la operación (todas sus líneas). Rechazar o reembolsar una operación contabilizada genera su reverso en el ledger. Estado actual: ${estadoTarget.estadoActual}.`}
          selectId="nuevo-estado"
        />
      )}
    </PermissionGuard>
  );
}
