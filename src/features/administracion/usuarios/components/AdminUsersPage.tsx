import { AlertTriangle, Eye, Inbox, Loader2, Plus } from "lucide-react";
import { formatDate } from "@/shared/format";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { Pagination } from "@/shared/ui/pagination";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { Badge, PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { DataAccessError } from "@/lib/api/errors";
import type { AdminUser } from "@/lib/api/types";
import { useCan } from "@/lib/permissions";
import { estadoAdminTone } from "../estados";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { estadoAdminLabel, PAGE_SIZES } from "../utils";
import { AdminUserDetalle, NuevoAdminUserModal } from "./AdminUserDialogs";

function buildColumns(rolNombre: Map<string, string>): Column<AdminUser>[] {
  return [
    { key: "legajo", label: "Legajo", sortable: true, filterable: true, render: (r) => r.legajo },
    { key: "nombre", label: "Nombre", sortable: true, filterable: true, render: (r) => r.nombre },
    { key: "email", label: "Email", sortable: true, filterable: true, render: (r) => r.email },
    {
      key: "rolId",
      label: "Rol",
      sortable: true,
      filterable: false,
      render: (r) => rolNombre.get(r.rolId) ?? r.rolId,
    },
    {
      key: "activo",
      label: "Estado",
      sortable: true,
      filterable: false,
      render: (r) => <Badge tone={estadoAdminTone(r.activo)}>{estadoAdminLabel(r.activo)}</Badge>,
    },
    {
      key: "createdAt",
      label: "Creado",
      sortable: true,
      filterable: false,
      render: (r) => formatDate(r.createdAt),
    },
  ];
}

/** Administración de personal: usuarios del backoffice. */
export function AdminUsersPage() {
  const s = useAdminUsers();
  const { can } = useCan();
  const puedeCrear = can("crear", "usuarios_backoffice");

  const getActions = (r: AdminUser): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => s.setDetail(r) },
  ];

  const err = s.error instanceof DataAccessError ? s.error : null;

  return (
    <PermissionGuard recurso="usuarios_backoffice">
      <PageHeader
        title="Administración de personal"
        description="Gestión de usuarios del backoffice (datos reales de la base de datos)."
        action={
          <button
            onClick={s.abrirNuevo}
            disabled={!puedeCrear}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Nuevo usuario
          </button>
        }
      />

      {s.isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="mr-2 animate-spin" /> Cargando usuarios…
        </div>
      ) : s.isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
          <AlertTriangle size={28} />
          <p className="font-semibold">
            {err?.permission
              ? "No tenés permiso para ver esto"
              : "Ocurrió un error al cargar los usuarios"}
          </p>
          <p>{err?.message ?? "Error desconocido"}</p>
          <button
            type="button"
            onClick={() => s.refetch()}
            className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : s.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          <Inbox size={28} />
          <p>No hay usuarios que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={buildColumns(s.rolNombre)}
            data={s.rows}
            keyExtractor={(r) => r.id}
            pageSize={s.pageSize}
            hidePagination
            serverFilterState={s.filtrosPanel}
            onServerFilterChange={s.aplicarFiltros}
            serverResultCount={s.total}
            actions={(r) => <ActionsDropdown actions={getActions(r)} />}
          />
          <Pagination
            page={s.page + 1}
            totalPages={s.totalPaginas}
            pageSize={s.pageSize}
            total={s.total}
            countLabel="usuario(s)"
            pageSizes={PAGE_SIZES}
            disabled={s.isFetching}
            onPageChange={(p) => s.setPage(p - 1)}
            onPageSizeChange={s.cambiarPageSize}
          />
        </>
      )}

      {s.detail && (
        <AdminUserDetalle
          detail={s.detail}
          rolNombre={s.rolNombre}
          onClose={() => s.setDetail(null)}
        />
      )}

      {s.showNew && (
        <NuevoAdminUserModal
          rolesLoading={s.rolesLoading}
          roles={s.roles}
          submitting={s.createMut.isPending}
          error={s.saveError}
          onSubmit={(vars) => s.createMut.mutate(vars)}
          onClose={() => s.setShowNew(false)}
        />
      )}
    </PermissionGuard>
  );
}
