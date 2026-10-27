import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, FilterX, Inbox, ShieldAlert } from "lucide-react";
import { DataTable } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { MovimientoDetail, type Movimiento } from "@/components/movimiento-detail";
import { PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useCambiarEstadoMovimiento } from "@/hooks/useMovimientoActions";
import { useCan } from "@/lib/permissions";
import { CambiarEstadoDialog } from "../../comun/components/CambiarEstadoDialog";
import { CargandoMovimientos, ErrorMovimientos } from "../../comun/components/EstadosCarga";
import type { EstadoTarget } from "../../comun/utils";
import { useMovimientosSubRuta } from "../hooks/useMovimientosSubRuta";
import { columnaVisible, insertarDespues, PAGE_SIZE } from "../utils";
import { columnaPayway, columnasSubRuta } from "./columns";

/**
 * Grilla de movimientos compartida por las sub-rutas de Movimientos.
 * - Con `tipoCode` fija el tipo server-side (no editable en UI) y acota los
 *   estados del filtro y del cambio de estado a los válidos para ese tipo
 *   (estados_por_tipo × catálogo).
 * - `soloConImpuesto`: vista transversal de retenciones al cliente
 *   (columna impuesto > 0), todos los tipos.
 * - `soloConComision`: vista transversal de comisiones cobradas
 *   (columna comision > 0), todos los tipos.
 */
export function MovimientosSubRoute({
  titulo,
  descripcion,
  tipoCode,
  soloConImpuesto = false,
  soloConComision = false,
}: {
  titulo: string;
  descripcion: string;
  tipoCode?: string;
  soloConImpuesto?: boolean;
  soloConComision?: boolean;
}) {
  const navigate = useNavigate();
  const s = useMovimientosSubRuta({ tipoCode, soloConImpuesto, soloConComision });
  const { total, isLoading, isFetching, isError, error, isEmpty, refetch, isEstimated } = s.query;
  const { isTarjeta, banderasLookup, loteSnapshotMap } = s;

  const [detail, setDetail] = useState<Movimiento | null>(null);
  const [estadoTarget, setEstadoTarget] = useState<EstadoTarget | null>(null);
  const cambiarEstado = useCambiarEstadoMovimiento();

  const { can } = useCan();
  const puedeModificar = can("modificar", "movimientos");

  const getActions = (row: Movimiento): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => setDetail(row) },
    {
      label: "Cambiar estado",
      icon: ShieldAlert,
      disabled: !puedeModificar,
      onClick: () => {
        const db = s.byTxn.get(row.id);
        if (db)
          setEstadoTarget({
            dbId: db.id,
            estadoActual: row.estado,
            nuevoId: db.estadoId,
          });
      },
    },
    {
      label: "Ver movimientos del cliente",
      icon: FilterX,
      onClick: () => navigate({ to: "/admin/general/movimientos", search: { legajo: row.legajo } }),
    },
  ];

  const totalPaginas = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  const allColumns = useMemo(() => {
    if (!isTarjeta) return columnasSubRuta;
    return insertarDespues(
      columnasSubRuta,
      "comision",
      columnaPayway(loteSnapshotMap, banderasLookup),
    );
  }, [isTarjeta, banderasLookup, loteSnapshotMap]);

  const visibles = allColumns.filter((c) =>
    columnaVisible(c.key, { tipoCode, soloConComision, isTarjeta }),
  );

  return (
    <PermissionGuard recurso="movimientos">
      <PageHeader title={titulo} description={descripcion} />

      {isLoading ? (
        <CargandoMovimientos texto="Cargando…" />
      ) : isError ? (
        <ErrorMovimientos error={error} onRetry={() => refetch()} />
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          <Inbox size={28} />
          <p>No hay movimientos que coincidan con los filtros aplicados.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={visibles}
            data={s.data}
            keyExtractor={(r) => r.id}
            actions={(r) => <ActionsDropdown actions={getActions(r)} />}
            hidePagination
            serverFilterState={s.filtrosPanel}
            onServerFilterChange={s.aplicarFiltros}
            serverResultCount={total}
          />
          <Pagination
            variant="compact"
            page={s.page + 1}
            totalPages={totalPaginas}
            pageSize={PAGE_SIZE}
            total={total}
            countLabel="movimiento(s)"
            disabled={isFetching}
            estimated={isEstimated}
            onPageChange={(p) => s.setPage(p - 1)}
          />
        </>
      )}

      {detail && <MovimientoDetail m={detail} onClose={() => setDetail(null)} />}

      {estadoTarget && (
        <CambiarEstadoDialog
          target={estadoTarget}
          setTarget={setEstadoTarget}
          estados={s.destinosEstado}
          cambiarEstado={cambiarEstado}
          title="Cambiar estado del movimiento"
          description={`Transición atómica registrada en el historial (origen = manual). Estado actual: ${estadoTarget.estadoActual}.`}
          selectId="nuevo-estado-sub"
        />
      )}
    </PermissionGuard>
  );
}
