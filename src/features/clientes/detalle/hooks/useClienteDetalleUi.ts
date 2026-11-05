import { useState } from "react";
import type { GestionAlerta } from "@/components/alerta-gestion";
import type { ComisionCliente } from "@/lib/api/types";
import type { Movimiento as DetailMovimiento } from "@/components/movimiento-detail";
import type { ConfirmActionState, EstadoTarget, TabKey } from "../utils";

/** Estado de UI de la ficha (pestaña activa, sub-pestañas, modales abiertos, gestiones locales). */
export function useClienteDetalleUi() {
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("identificacion");
  const [riesgoSub, setRiesgoSub] = useState<"alertas" | "bloqueos">("alertas");
  const [modulosSub, setModulosSub] = useState<"productos" | "links" | "api" | null>(null);

  const [editAlertasOpen, setEditAlertasOpen] = useState(false);
  const [editBloqueosOpen, setEditBloqueosOpen] = useState(false);
  const [editRiesgoOpen, setEditRiesgoOpen] = useState(false);
  const [editPerfilOpen, setEditPerfilOpen] = useState(false);

  const [linksOpen, setLinksOpen] = useState(false);
  const [apiDetalleId, setApiDetalleId] = useState<string | null>(null);
  const apiDetalleOpen = !!apiDetalleId;

  const [movDetail, setMovDetail] = useState<DetailMovimiento | null>(null);
  const [comisionDetail, setComisionDetail] = useState<ComisionCliente | null>(null);
  const [estadoTarget, setEstadoTarget] = useState<EstadoTarget | null>(null);

  const [gestionTarget, setGestionTarget] = useState<{ id: string; resumen: string } | null>(null);
  const [gestiones, setGestiones] = useState<Record<string, GestionAlerta>>({});

  return {
    confirmAction,
    setConfirmAction,
    activeTab,
    setActiveTab,
    riesgoSub,
    setRiesgoSub,
    modulosSub,
    setModulosSub,
    editAlertasOpen,
    setEditAlertasOpen,
    editBloqueosOpen,
    setEditBloqueosOpen,
    editRiesgoOpen,
    setEditRiesgoOpen,
    editPerfilOpen,
    setEditPerfilOpen,
    linksOpen,
    setLinksOpen,
    apiDetalleId,
    setApiDetalleId,
    apiDetalleOpen,
    movDetail,
    setMovDetail,
    comisionDetail,
    setComisionDetail,
    estadoTarget,
    setEstadoTarget,
    gestionTarget,
    setGestionTarget,
    gestiones,
    setGestiones,
  };
}

export type ClienteDetalleUi = ReturnType<typeof useClienteDetalleUi>;
