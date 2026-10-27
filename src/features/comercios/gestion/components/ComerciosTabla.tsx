import { CheckCircle, Edit3, Eye, XCircle } from "lucide-react";
import { Badge } from "@/components/portal-shell";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { LegajoCell } from "@/components/legajo-label";
import type { Comercio } from "@/lib/api/types";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { formatDate } from "@/shared/format";
import { estadoComercioTone } from "../estados";
import type { ComerciosGestionState } from "../hooks/useComerciosGestion";
import { PAGE_SIZES } from "../utils";

const SIN_DATO = <span className="text-muted-foreground">—</span>;

const COLUMNS: Column<Comercio>[] = [
  {
    key: "usuario",
    label: "Usuario",
    sortable: true,
    minWidth: 160,
    maxWidth: 280,
    render: (r) => (
      <div>
        <div className="font-semibold">{r.usuario}</div>
        {r.cliente?.nombre && (
          <div className="text-xs text-muted-foreground">{r.cliente.nombre}</div>
        )}
        <LegajoCell legajo={r.legajo} className="text-xs" />
      </div>
    ),
  },
  {
    key: "cliente",
    label: "Nombre comercial",
    sortable: true,
    minWidth: 200,
    maxWidth: 320,
    render: (r) => r.nombreComercio ?? SIN_DATO,
  },
  {
    key: "categoria",
    label: "Categoría",
    sortable: true,
    minWidth: 140,
    render: (r) =>
      r.categoria ? (
        <span className="font-mono tabular-nums">
          {r.categoria.codigo} · {r.categoria.nombre}
        </span>
      ) : (
        SIN_DATO
      ),
  },
  { key: "nivel", label: "Nivel", sortable: true, minWidth: 100, render: (r) => r.nivel },
  {
    key: "ejecutivo",
    label: "Ejecutivo",
    sortable: true,
    minWidth: 160,
    render: (r) =>
      r.ejecutivo ? (
        <div className="text-sm">
          <div className="font-medium truncate max-w-[140px]">{r.ejecutivo.nombre}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[140px]">
            {r.ejecutivo.email}
          </div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Sin asignar</span>
      ),
  },
  {
    key: "puntosVenta",
    label: "Puntos de venta",
    sortable: false,
    minWidth: 120,
    render: (r) => <span className="font-mono tabular-nums text-xs">{r.puntosVenta.length}</span>,
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    minWidth: 120,
    render: (r) => <Badge tone={estadoComercioTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "createdAt",
    label: "Registro",
    sortable: true,
    minWidth: 120,
    render: (r) => (
      <span className="font-mono text-xs tabular-nums">{formatDate(r.createdAt)}</span>
    ),
  },
];

/** Tabla paginada (server-side) de comercios con su menú de acciones. */
export function ComerciosTabla({ s }: { s: ComerciosGestionState }) {
  const { rows, total, isFetching } = s.listado;
  const totalPaginas = Math.max(1, Math.ceil(total / s.pageSize));

  const getActions = (row: Comercio): ActionItem[] => {
    const items: ActionItem[] = [
      { label: "Ver detalle", icon: Eye, onClick: () => s.setDetail(row) },
      {
        label: "Editar",
        icon: Edit3,
        disabled: !s.puedeModificar,
        onClick: () => s.setEditTarget(row),
      },
    ];
    // Solo habilitar/deshabilitar (estados de comercio). Sin gestion de medios de pago.
    // Deshabilitar pide motivo (queda registrado); habilitar es directo.
    if (row.estado === "Activado") {
      items.push({
        label: "Deshabilitar",
        icon: XCircle,
        variant: "danger",
        disabled: !s.puedeModificar,
        onClick: () => s.setConfirmDelete(row),
      });
    } else {
      items.push({
        label: "Habilitar",
        icon: CheckCircle,
        disabled: !s.puedeModificar,
        onClick: () => s.cambiarEstado(row, "Activado"),
      });
    }
    return items;
  };

  return (
    <>
      <DataTable
        columns={COLUMNS}
        data={rows}
        keyExtractor={(r) => r.id}
        pageSize={s.pageSize}
        showDownloadButton={false}
        showGlobalFilter={false}
        dateFilterColumns={[]}
        hidePagination
        actions={(r) => <ActionsDropdown actions={getActions(r)} />}
      />
      <Pagination
        page={s.page + 1}
        totalPages={totalPaginas}
        pageSize={s.pageSize}
        total={total}
        countLabel="comercio(s)"
        pageSizes={PAGE_SIZES}
        disabled={isFetching}
        onPageChange={(p) => s.setPage(p - 1)}
        onPageSizeChange={(size) => {
          s.setPageSize(size);
          s.setPage(0);
        }}
      />
    </>
  );
}
