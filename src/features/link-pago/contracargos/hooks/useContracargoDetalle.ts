import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  agregarAdjunto,
  cerrarComoRetenido,
  confirmarSimulacion,
  deleteContracargo,
  enviarAPayway,
  listLotesParaCerrarRetenido,
  quitarAdjunto,
  updateContracargo,
  type Contra,
  type EstadoContra,
  type LoteCerrarRetenido,
} from "@/lib/api/contracargos";
import { useCan } from "@/lib/permissions";
import { getAdjuntoSignedUrl } from "@/lib/storage/contracargos";
import { formatMoney } from "@/shared/format";

/** Formulario y acciones del modal de gestión de un contracargo. */
export function useContracargoDetalle(c: Contra, onClose: () => void) {
  const qc = useQueryClient();
  const { can } = useCan();
  const puedeGestionar = can("modificar", "comercios");
  const puedeBorrar = can("borrar", "comercios");

  const [estado, setEstado] = useState<EstadoContra>(c.estado);
  const [ticket, setTicket] = useState(c.ticketPayway ?? "");
  const [doc, setDoc] = useState(c.documentacion ?? "");
  const [resolucion, setResolucion] = useState(c.resolucion ?? "");
  const [saving, setSaving] = useState(false);
  const [archivos, setArchivos] = useState(c.archivosAdjuntos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lote destino (solo si va a Cerrado_retenido)
  const [lotes, setLotes] = useState<LoteCerrarRetenido[]>([]);
  const [loteId, setLoteId] = useState<string>(c.loteSugeridoId ?? "");
  const [loadingLotes, setLoadingLotes] = useState(false);

  // Cuando el operador elige Cerrado_retenido, cargamos los lotes
  // disponibles. También si el contracargo ya está en ese estado.
  useEffect(() => {
    if (estado !== "Cerrado_retenido") return;
    let alive = true;
    setLoadingLotes(true);
    listLotesParaCerrarRetenido(c.comercioId, c.loteSugeridoId)
      .then((ls) => {
        if (!alive) return;
        setLotes(ls);
        // Si el sugerido no está, tomar el primero disponible.
        if (!loteId && ls.length > 0) setLoteId(ls[0].id);
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => alive && setLoadingLotes(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, c.comercioId, c.loteSugeridoId]);

  const guardar = async () => {
    setSaving(true);
    try {
      // Camino especial: Cerrado_retenido → RPC con impacto en lote
      if (estado === "Cerrado_retenido" && loteId) {
        const r = await cerrarComoRetenido(c.id, loteId);
        toast.success(
          `Contracargo retenido. Se descontaron ${formatMoney(r.importeDescontado)} del lote ${r.loteCodigo || r.loteId.slice(0, 8)}.`,
        );
      } else {
        await updateContracargo(c.id, {
          estado,
          ticketPayway: ticket || null,
          documentacion: doc || null,
          resolucion: resolucion || null,
          esSimulacion: estado === "Simulado",
        });
        toast.success("Contracargo actualizado");
      }
      qc.invalidateQueries({ queryKey: ["contracargos"] });
      qc.invalidateQueries({ queryKey: ["lotes"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onConfirmarSimulacion = async () => {
    setSaving(true);
    try {
      const actualizado = await confirmarSimulacion(c.id);
      toast.success(
        actualizado.loteSugeridoId
          ? "Simulación confirmada. Se sugirió un lote para aplicar el impacto."
          : "Simulación confirmada. Sin lote sugerido: aplicar manualmente al cerrar.",
      );
      qc.invalidateQueries({ queryKey: ["contracargos"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onEliminarSimulacion = async () => {
    if (!confirm("¿Eliminar esta simulación?")) return;
    try {
      await deleteContracargo(c.id);
      qc.invalidateQueries({ queryKey: ["contracargos"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onSubirArchivo = async (file: File) => {
    setUploading(true);
    try {
      const r = await agregarAdjunto(c, file);
      setArchivos(r.contra.archivosAdjuntos);
      qc.invalidateQueries({ queryKey: ["contracargos"] });
      toast.success("Archivo adjunto");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onQuitarArchivo = async (path: string) => {
    if (!confirm("¿Quitar este archivo?")) return;
    try {
      const actualizado = await quitarAdjunto(c, path);
      setArchivos(actualizado.archivosAdjuntos);
      qc.invalidateQueries({ queryKey: ["contracargos"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onEnviarPayway = async () => {
    try {
      await enviarAPayway(c.id);
      toast.success("Marcado como enviado a PayWay");
      qc.invalidateQueries({ queryKey: ["contracargos"] });
      // refrescar el modal: re-leemos del server
      qc.setQueryData(["contracargos"], (old: unknown) => old); // noop, sólo para forzar re-render abajo
      onClose();
      // Reabrimos con el contra actualizado
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["contracargos"] });
      }, 100);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onVerArchivo = async (path: string) => {
    try {
      const url = await getAdjuntoSignedUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return {
    puedeGestionar,
    puedeBorrar,
    estado,
    setEstado,
    ticket,
    setTicket,
    doc,
    setDoc,
    resolucion,
    setResolucion,
    saving,
    archivos,
    uploading,
    fileInputRef,
    lotes,
    loteId,
    setLoteId,
    loadingLotes,
    guardar,
    onConfirmarSimulacion,
    onEliminarSimulacion,
    onSubirArchivo,
    onQuitarArchivo,
    onEnviarPayway,
    onVerArchivo,
  };
}

export type ContracargoDetalleState = ReturnType<typeof useContracargoDetalle>;
