import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  getAdelantosPorDia,
  getExportDia,
  type AdelantoParaCalendario,
  type CalendarioAcreditacion,
} from "@/lib/api/calendario-acreditaciones";
import { exportExcel, exportPdf } from "../exportar";
import { fechaLarga, tieneAdelantoActivo } from "../utils";

/** Adelantos de los comercios del día, export y navegación a Adelantos. */
export function useDiaDetalle(fecha: string, items: CalendarioAcreditacion[]) {
  const navigate = useNavigate();
  const fechaFormateada = fechaLarga(fecha);
  const [exporting, setExporting] = useState<"xlsx" | "pdf" | null>(null);

  // En general todos los items del día son del mismo comercio, pero
  // puede haber varios. Hacemos un map por comercioId.
  const comerciosDelDia = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.comercioId);
    return Array.from(set);
  }, [items]);

  const { data: adelantosPorComercio } = useQuery({
    queryKey: ["calendario-adelantos-dia", fecha, comerciosDelDia],
    queryFn: async () => {
      const out: Record<string, AdelantoParaCalendario[]> = {};
      for (const id of comerciosDelDia) {
        out[id] = await getAdelantosPorDia(id, fecha);
      }
      return out;
    },
  });

  const adelantosDe = (comercioId: string) => adelantosPorComercio?.[comercioId] ?? [];

  // Por comercio del día, ¿hay adelanto aprobado?
  const tieneAdelantoAprobado = (comercioId: string): boolean =>
    tieneAdelantoActivo(adelantosDe(comercioId));

  const irAAdelantos = (comercioId: string, adelantoId?: string) => {
    const search: Record<string, string> = { comercio: comercioId };
    if (adelantoId) search.adelanto = adelantoId;
    void navigate({
      to: "/admin/comercios/link-pago/adelantos",
      search,
    } as never);
  };

  const onExport = async (formato: "xlsx" | "pdf") => {
    setExporting(formato);
    try {
      const comercioId = comerciosDelDia.length === 1 ? comerciosDelDia[0] : null;
      const rows = await getExportDia(fecha, comercioId);
      if (rows.length === 0) {
        toast.error("No hay filas para exportar");
        return;
      }
      if (formato === "xlsx") exportExcel(fechaFormateada, rows);
      else exportPdf(fechaFormateada, rows);
      toast.success(`Exportación ${formato.toUpperCase()} lista`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setExporting(null);
    }
  };

  return {
    fechaFormateada,
    exporting,
    onExport,
    adelantosDe,
    tieneAdelantoAprobado,
    irAAdelantos,
  };
}
