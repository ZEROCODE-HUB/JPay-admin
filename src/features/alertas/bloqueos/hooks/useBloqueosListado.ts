import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { descargarCsv } from "@/lib/api/alert-rules";
import {
  acceptBlock,
  listAllBlocks,
  listBlocks,
  releaseBlock,
  type AccountBlock,
  type BlockFilters,
} from "@/lib/api/compliance";
import { useListadoServidor } from "../../comun/hooks/useListadoServidor";
import { nombreCsv } from "../../comun/utils";
import { CSV_CABECERA, filaCsvBloqueo, filtrosBloqueos, mensajeLiberacion } from "../utils";

/** Estado de la pantalla "Listado de bloqueos": filtros, query, diálogos y acciones. */
export function useBloqueosListado() {
  const queryClient = useQueryClient();
  const listado = useListadoServidor();
  const { panel, search, page, pageSize } = listado;

  const filtros: BlockFilters = useMemo(
    () => filtrosBloqueos(panel, search),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mismas dependencias que el original
    [search, panel.enums, panel.dates],
  );

  const lista = useQuery({
    queryKey: ["account_blocks", filtros, page, pageSize],
    queryFn: () => listBlocks({ ...filtros, page, pageSize }),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
  const rows = lista.data?.rows ?? [];
  const total = lista.data?.total ?? 0;

  const [detalle, setDetalle] = useState<AccountBlock | null>(null);
  const [aceptando, setAceptando] = useState<AccountBlock | null>(null);
  const [liberando, setLiberando] = useState<AccountBlock | null>(null);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["account_blocks"] });

  const aceptar = async () => {
    if (!aceptando) return;
    try {
      await acceptBlock(aceptando.id);
      toast.success("Bloqueo aceptado por Compliance (sigue activo hasta liberarlo)");
      await refrescar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAceptando(null);
    }
  };

  const liberar = async () => {
    if (!liberando) return;
    if (notas.trim().length < 5) {
      toast.error("Indicá el motivo de la liberación (al menos 5 caracteres)");
      return;
    }
    setEnviando(true);
    try {
      const r = await releaseBlock(liberando.id, notas.trim());
      toast.success(mensajeLiberacion(r));
      setLiberando(null);
      setDetalle(null);
      await refrescar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const exportar = async () => {
    try {
      const todos = await listAllBlocks(filtros);
      descargarCsv(nombreCsv("bloqueos"), CSV_CABECERA, todos.map(filaCsvBloqueo));
    } catch (e) {
      toast.error(`No se pudo exportar: ${(e as Error).message}`);
    }
  };

  const abrirLiberacion = (b: AccountBlock) => {
    setNotas("");
    setLiberando(b);
  };

  return {
    listado,
    lista,
    rows,
    total,
    detalle,
    setDetalle,
    aceptando,
    setAceptando,
    liberando,
    setLiberando,
    notas,
    setNotas,
    enviando,
    nuevo,
    setNuevo,
    refrescar,
    aceptar,
    liberar,
    exportar,
    abrirLiberacion,
  };
}
