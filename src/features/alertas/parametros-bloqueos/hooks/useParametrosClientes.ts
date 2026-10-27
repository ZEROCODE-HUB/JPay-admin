import { useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TableServerFilters } from "@/shared/ui/data-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  deleteClientBlockParameter,
  descargarCsv,
  listAllClientBlockParameters,
  listClientBlockParameters,
  saveClientBlockParameter,
  type ClientBlockParameter,
} from "@/lib/api/alert-rules";
import {
  CSV_CABECERA,
  type Draft,
  draftDeParametro,
  filasCsv,
  vacio,
  validarDraft,
} from "../utils";

/** Parámetros individuales por cliente: grilla paginada, alta/edición, detalle y baja. */
export function useParametrosClientes() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filtros, setFiltros] = useState<TableServerFilters>({ global: "", enums: {}, dates: {} });
  const search = useDebouncedValue(filtros.global.trim(), 350);

  const lista = useQuery({
    queryKey: ["client_block_parameters", page, pageSize, search],
    queryFn: () => listClientBlockParameters({ page, pageSize, search: search || undefined }),
    placeholderData: keepPreviousData,
  });
  const filas = lista.data?.rows ?? [];
  const total = lista.data?.total ?? 0;

  const [dialogo, setDialogo] = useState<"nuevo" | "editar" | null>(null);
  const [draft, setDraft] = useState<Draft>(vacio);
  const [errDraft, setErrDraft] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [viendo, setViendo] = useState<ClientBlockParameter | null>(null);
  const [borrando, setBorrando] = useState<ClientBlockParameter | null>(null);

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["client_block_parameters"] });

  const abrirNuevo = () => {
    setDraft(vacio);
    setErrDraft(null);
    setDialogo("nuevo");
  };
  const abrirEditar = (r: ClientBlockParameter) => {
    setDraft(draftDeParametro(r));
    setErrDraft(null);
    setDialogo("editar");
  };

  const guardarDraft = async () => {
    const v = validarDraft(draft);
    if (!v.ok) {
      setErrDraft(v.error);
      return;
    }
    setGuardando(true);
    setErrDraft(null);
    try {
      await saveClientBlockParameter({
        id: draft.id,
        legajo: draft.legajo,
        individualMinWages: v.individualMinWages,
        companyMinWages: v.companyMinWages,
      });
      await refrescar();
      toast.success(
        dialogo === "nuevo"
          ? "Parámetros del cliente agregados"
          : "Parámetros del cliente actualizados",
      );
      setDialogo(null);
    } catch (err) {
      setErrDraft((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!borrando) return;
    try {
      await deleteClientBlockParameter(borrando.id);
      await refrescar();
      toast.success(
        "Configuración individual eliminada: el cliente vuelve a usar los valores generales",
      );
    } catch (err) {
      toast.error(`No se pudo eliminar: ${(err as Error).message}`);
    } finally {
      setBorrando(null);
    }
  };

  const exportar = async () => {
    try {
      const todas = await listAllClientBlockParameters(search || undefined);
      descargarCsv(
        `parametros-bloqueos-${new Date().toISOString().slice(0, 10)}.csv`,
        CSV_CABECERA,
        filasCsv(todas),
      );
    } catch (err) {
      toast.error(`No se pudo exportar: ${(err as Error).message}`);
    }
  };

  const cambiarFiltros = (f: TableServerFilters) => {
    setPage(0);
    setFiltros(f);
  };
  const cambiarPageSize = (s: number) => {
    setPageSize(s);
    setPage(0);
  };

  return {
    lista,
    filas,
    total,
    page,
    setPage,
    pageSize,
    cambiarPageSize,
    filtros,
    cambiarFiltros,
    totalPaginas: Math.max(1, Math.ceil(total / pageSize)),
    dialogo,
    setDialogo,
    draft,
    setDraft,
    errDraft,
    guardando,
    viendo,
    setViendo,
    borrando,
    setBorrando,
    abrirNuevo,
    abrirEditar,
    guardarDraft,
    eliminar,
    exportar,
  };
}

export type ParametrosClientes = ReturnType<typeof useParametrosClientes>;
