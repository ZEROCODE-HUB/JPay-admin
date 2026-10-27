import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle, Eye, Trash2, XCircle, type LucideIcon } from "lucide-react";
import type { ActionItem } from "@/components/actions-dropdown";
import { useCan } from "@/lib/permissions";
import { deleteQrPos, updateQrEstado } from "@/lib/api/qr-pos";
import type { EstadoQr, PuntoVenta } from "@/lib/api/types";
import { accionesDisponibles, ESTADO_DESTINO, type AccionQr } from "../utils";

export type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

type ConfigAccion = {
  icon: LucideIcon;
  /** Variante del ítem del menú (sin definir = normal). */
  itemVariant?: "danger";
  /** Variante del diálogo de confirmación. */
  confirmVariant: "default" | "danger";
  title: string;
  message: (nombre: string) => string;
};

const CONFIG: Record<AccionQr, ConfigAccion> = {
  Activar: {
    icon: CheckCircle,
    confirmVariant: "default",
    title: "Activar QR",
    message: (n) => `¿Activar ${n}?`,
  },
  Desactivar: {
    icon: Ban,
    itemVariant: "danger",
    confirmVariant: "danger",
    title: "Desactivar QR",
    message: (n) => `¿Desactivar ${n}?`,
  },
  Rechazar: {
    icon: XCircle,
    itemVariant: "danger",
    confirmVariant: "danger",
    title: "Rechazar QR",
    message: (n) => `¿Rechazar ${n}?`,
  },
  Suspender: {
    icon: Ban,
    itemVariant: "danger",
    confirmVariant: "danger",
    title: "Suspender QR",
    message: (n) => `¿Suspender ${n}?`,
  },
  Pendiente: {
    icon: Ban,
    confirmVariant: "default",
    title: "Marcar pendiente QR",
    message: (n) => `¿Marcar ${n} como Pendiente de aprobación?`,
  },
  Eliminar: {
    icon: Trash2,
    itemVariant: "danger",
    confirmVariant: "danger",
    title: "Eliminar QR",
    message: (n) => `¿Eliminar ${n}?`,
  },
};

/** Detalle abierto, confirmaciones y acciones (cambio de estado / borrado) sobre un QR/POS. */
export function useQrAcciones() {
  const qc = useQueryClient();
  const { can } = useCan();
  const puedeModificar = can("modificar", "comercios");
  const puedeBorrar = can("borrar", "comercios");

  const [detail, setDetail] = useState<PuntoVenta | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const mostrarError = (title: string, e: unknown) =>
    setConfirm({
      title,
      message: (e as Error).message,
      confirmLabel: "Cerrar",
      variant: "danger",
      onConfirm: () => setConfirm(null),
    });

  const cambiar = async (row: PuntoVenta, nuevo: EstadoQr) => {
    try {
      await updateQrEstado(row.id, nuevo);
      qc.invalidateQueries({ queryKey: ["qr-pos"] });
    } catch (e) {
      mostrarError("No se pudo actualizar", e);
    }
  };

  const eliminar = async (row: PuntoVenta) => {
    try {
      await deleteQrPos(row.id);
      qc.invalidateQueries({ queryKey: ["qr-pos"] });
    } catch (e) {
      mostrarError("No se pudo eliminar", e);
    }
  };

  const ejecutar = (r: PuntoVenta, accion: AccionQr) => {
    if (accion === "Eliminar") void eliminar(r);
    else void cambiar(r, ESTADO_DESTINO[accion]);
  };

  const getActions = (r: PuntoVenta): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => setDetail(r) },
    ...accionesDisponibles(r.estado).map((accion): ActionItem => {
      const cfg = CONFIG[accion];
      return {
        label: accion,
        icon: cfg.icon,
        disabled: accion === "Eliminar" ? !puedeBorrar : !puedeModificar,
        ...(cfg.itemVariant ? { variant: cfg.itemVariant } : {}),
        onClick: () =>
          setConfirm({
            title: cfg.title,
            message: cfg.message(r.nombre),
            confirmLabel: accion,
            variant: cfg.confirmVariant,
            onConfirm: () => {
              setConfirm(null);
              ejecutar(r, accion);
            },
          }),
      };
    }),
  ];

  return { detail, setDetail, confirm, setConfirm, getActions };
}
