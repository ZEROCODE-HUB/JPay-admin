import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCan } from "@/lib/permissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDcExcepciones } from "@/hooks/useDcExcepciones";
import { useImpuestos } from "@/hooks/useImpuestos";
import {
  createDcExcepcion,
  createDcExcepcionAmbos,
  setDcExcepcionEstado,
} from "@/lib/api/dc-excepciones";
import type { DcExcepcion } from "@/lib/api/types";
import type { ConfirmActionState, EstadoFiltro } from "../../types";
import { dialogoError } from "../../utils";
import {
  PAGE_SIZE,
  altaBase,
  altaVacia,
  esAltaValida,
  esErrorCheck,
  mensajeAltaCreada,
  type AltaForm,
} from "../utils";

/** Listado de excepciones débito/crédito, alta manual y cambio de estado. */
export function useDebitosCreditos() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>("");

  const { can } = useCan();
  const puedeCrear = can("crear", "impuestos");
  const puedeModificar = can("modificar", "impuestos");

  const listado = useDcExcepciones({
    page,
    pageSize: PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
  });

  // Alta manual
  const [showAlta, setShowAlta] = useState(false);
  const [alta, setAlta] = useState<AltaForm>(() => altaVacia(new Date()));
  const [altaGuardando, setAltaGuardando] = useState(false);
  const { rows: impuestos } = useImpuestos({ page: 0, pageSize: 100, estado: "Activo" });

  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const cerrarDialogo = () => setConfirmAction(null);

  const invalidarExcepciones = () =>
    queryClient.invalidateQueries({ queryKey: ["dc_excepciones"] });

  const cambiarBusqueda = (v: string) => {
    setSearchInput(v);
    setPage(0);
  };
  const cambiarEstado = (v: EstadoFiltro) => {
    setEstadoFilter(v);
    setPage(0);
  };

  const toggleEstado = async (row: DcExcepcion) => {
    try {
      await setDcExcepcionEstado(row.id, row.estado === "Activo" ? "Inactivo" : "Activo");
      invalidarExcepciones();
    } catch (e) {
      setConfirmAction(dialogoError("No se pudo actualizar", (e as Error).message, cerrarDialogo));
    }
  };

  const altaValido = esAltaValida(alta);

  const guardarAlta = async () => {
    if (!altaValido || altaGuardando) return;
    setAltaGuardando(true);
    const base = altaBase(alta);
    try {
      let cantidad: number;
      if (alta.direccion === "Ambos") {
        const creadas = await createDcExcepcionAmbos(base); // 2 INSERTs: Entrantes + Salientes
        cantidad = creadas.length;
      } else {
        await createDcExcepcion({ ...base, direccion: alta.direccion });
        cantidad = 1;
      }
      invalidarExcepciones();
      setShowAlta(false);
      setAlta(altaVacia(new Date()));
      setBanner(mensajeAltaCreada(cantidad));
    } catch (e) {
      const mensaje = esErrorCheck(e)
        ? "Los datos no cumplen las validaciones de la base (verificá el CUIT de 11 dígitos)."
        : (e as Error).message;
      setConfirmAction(dialogoError("No se pudo guardar", mensaje, cerrarDialogo));
    }
    setAltaGuardando(false);
  };

  return {
    listado,
    page,
    setPage,
    searchInput,
    cambiarBusqueda,
    estadoFilter,
    cambiarEstado,
    puedeCrear,
    puedeModificar,
    showAlta,
    setShowAlta,
    alta,
    setAlta,
    altaValido,
    altaGuardando,
    guardarAlta,
    impuestos,
    confirmAction,
    cerrarDialogo,
    banner,
    setBanner,
    toggleEstado,
  };
}

export type DebitosCreditosState = ReturnType<typeof useDebitosCreditos>;
