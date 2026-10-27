import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createBandera,
  deleteBandera,
  listBanderas,
  updateBandera,
  type Bandera,
} from "@/lib/api/banderas";
import type { MetodoPagoForm } from "../utils";

/** Listado de métodos de pago (banderas) con alta, edición y baja. */
export function useMetodosPago() {
  const [data, setData] = useState<Bandera[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ metodo: Bandera | null } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Bandera | null>(null);

  useEffect(() => {
    listBanderas()
      .then(setData)
      .catch(() => toast.error("Error cargando métodos de pago"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (m: MetodoPagoForm) => {
    try {
      if (m.id) {
        const updated = await updateBandera(m.id, {
          nombre: m.nombre,
          tipo: m.tipo,
          diasHabilesAcreditacion: m.diasHabiles,
          estado: m.estado as "Activo" | "Inactivo",
        });
        setData((prev) => prev.map((d) => (d.id === m.id ? updated : d)));
        toast.success("Método de pago actualizado");
      } else {
        const created = await createBandera({
          nombre: m.nombre,
          tipo: m.tipo,
          diasHabilesAcreditacion: m.diasHabiles,
        });
        setData((prev) => [...prev, created]);
        toast.success("Método de pago creado");
      }
      setModal(null);
    } catch {
      toast.error("Error al guardar método de pago");
    }
  };

  const handleDelete = async (b: Bandera) => {
    try {
      await deleteBandera(b.id);
      setData((prev) => prev.filter((d) => d.id !== b.id));
      setConfirmDelete(null);
      setModal(null);
      toast.success("Método de pago eliminado");
    } catch {
      toast.error("Error al eliminar método de pago");
    }
  };

  return {
    data,
    loading,
    modal,
    setModal,
    confirmDelete,
    setConfirmDelete,
    handleSave,
    handleDelete,
  };
}
