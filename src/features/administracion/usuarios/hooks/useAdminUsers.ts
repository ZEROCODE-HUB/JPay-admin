import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { listAdminUsers } from "@/lib/api/admin-users";
import { crearAdminUser } from "@/lib/api/edge";
import { DataAccessError } from "@/lib/api/errors";
import { listRoles } from "@/lib/api/roles-permisos";
import type { AdminUser } from "@/lib/api/types";
import type { NuevoAdminUser } from "../utils";

/** Listado paginado de usuarios de backoffice, roles y alta. */
export function useAdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [filtrosPanel, setFiltrosPanel] = useState<TableServerFilters>({
    global: "",
    enums: {},
    dates: {},
  });
  const search = useDebouncedValue(filtrosPanel.global.trim(), 350);
  const aplicarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setFiltrosPanel(f);
  };

  const rolesQ = useQuery({ queryKey: ["roles"], queryFn: listRoles });
  const roles = rolesQ.data ?? [];
  const rolNombre = new Map<string, string>(roles.map((r) => [r.id, r.nombre]));

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["admin-users", page, pageSize, search],
    queryFn: () => listAdminUsers({ page, pageSize, search: search || undefined }),
  });

  const rows: AdminUser[] = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));

  const createMut = useMutation({
    mutationFn: (vars: NuevoAdminUser) => crearAdminUser(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setShowNew(false);
      setSaveError(null);
    },
    onError: (e) =>
      setSaveError(e instanceof DataAccessError ? e.message : "Error al crear usuario"),
  });

  return {
    page,
    setPage,
    pageSize,
    cambiarPageSize: (s: number) => {
      setPageSize(s);
      setPage(0);
    },
    detail,
    setDetail,
    showNew,
    setShowNew,
    abrirNuevo: () => {
      setSaveError(null);
      setShowNew(true);
    },
    saveError,
    filtrosPanel,
    aplicarFiltros,
    rolesLoading: rolesQ.isLoading,
    roles,
    rolNombre,
    rows,
    total,
    totalPaginas,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    createMut,
  };
}
