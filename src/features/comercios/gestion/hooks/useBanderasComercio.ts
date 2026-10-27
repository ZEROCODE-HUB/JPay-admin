import { useEffect, useState } from "react";
import type { Bandera } from "@/lib/api/banderas";
import type { ComercioBandera, ComercioBanderaCuota, ComercioBanderaEstado } from "@/lib/api/types";
import { parseDecimal } from "../utils";

/**
 * Estado y acciones de la sección "Banderas" de un comercio: listado, alta/edición,
 * baja y cuotas (TEM) por bandera. Las APIs se cargan con import dinámico para no
 * sumar peso a la pantalla principal.
 */
export function useBanderasComercio(comercioId: string) {
  const [banderas, setBanderas] = useState<ComercioBandera[]>([]);
  const [banderasCatalogo, setBanderasCatalogo] = useState<Bandera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ComercioBandera | null>(null);
  const [formBanderaId, setFormBanderaId] = useState("");
  const [formBanderaCustom, setFormBanderaCustom] = useState("");
  const [formComisionPropia, setFormComisionPropia] = useState("");
  const [formPayway, setFormPayway] = useState("");
  const [formEstado, setFormEstado] = useState<ComercioBanderaEstado>("Activo");
  const [formMetodoKey, setFormMetodoKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ComercioBandera | null>(null);
  const [cuotasBandera, setCuotasBandera] = useState<ComercioBandera | null>(null);
  const [cuotas, setCuotas] = useState<ComercioBanderaCuota[]>([]);
  const [cuotasLoading, setCuotasLoading] = useState(false);
  const [showCuotaForm, setShowCuotaForm] = useState(false);
  const [cuotaValor, setCuotaValor] = useState("1");
  const [cuotaTasa, setCuotaTasa] = useState("");
  const [cuotaEstado, setCuotaEstado] = useState<"Activo" | "Inactivo">("Activo");
  const [savingCuota, setSavingCuota] = useState(false);
  const [confirmDeleteCuota, setConfirmDeleteCuota] = useState<ComercioBanderaCuota | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const [comercioBanderasMod, banderasMod] = await Promise.all([
        import("@/lib/api/comercio-banderas"),
        import("@/lib/api/banderas"),
      ]);
      const [data, catalog] = await Promise.all([
        comercioBanderasMod.listByComercio(comercioId),
        banderasMod.listBanderas(),
      ]);
      setBanderas(data);
      setBanderasCatalogo(catalog.filter((b: Bandera) => b.estado === "Activo"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comercioId]);

  const openCreate = () => {
    setEditing(null);
    setFormBanderaId(banderasCatalogo[0]?.id || "");
    setFormBanderaCustom("");
    setFormComisionPropia("");
    setFormPayway("");
    setFormEstado("Activo");
    setFormMetodoKey(banderasCatalogo[0]?.metodoKey || "");
    setShowForm(true);
  };

  const openEdit = (b: ComercioBandera) => {
    setEditing(b);
    setFormBanderaId(b.banderaId || "");
    setFormBanderaCustom("");
    setFormComisionPropia(String(b.comisionPropia));
    setFormPayway(String(b.comisionPayway));
    setFormEstado(b.estado);
    setFormMetodoKey(b.metodoKey || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const guardar = async () => {
    const selectedBandera = banderasCatalogo.find((b) => b.id === formBanderaId);
    const banderaFinal = selectedBandera?.nombre || formBanderaCustom.trim();
    if (!banderaFinal) return;
    const comisionPlataforma = parseDecimal(formComisionPropia);
    const payway = parseDecimal(formPayway);
    setSaving(true);
    try {
      const mod = await import("@/lib/api/comercio-banderas");
      const datos = {
        bandera: banderaFinal,
        comisionPropia: comisionPlataforma,
        comisionPayway: payway,
        estado: formEstado,
        // "__custom__" es la opción "Otra (texto libre)": no corresponde a una bandera del catálogo.
        banderaId: formBanderaId && formBanderaId !== "__custom__" ? formBanderaId : undefined,
        metodoKey: formMetodoKey || undefined,
      };
      if (editing) {
        await mod.updateBandera(editing.id, datos);
      } else {
        await mod.createBandera(comercioId, datos);
      }
      setShowForm(false);
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      const mod = await import("@/lib/api/comercio-banderas");
      await mod.deleteBandera(confirmDelete.id);
      setConfirmDelete(null);
      await cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const neto = parseDecimal(formComisionPropia) - parseDecimal(formPayway);

  // --- Cuotas por bandera ---
  const cargarCuotas = async (bandera: ComercioBandera) => {
    setCuotasBandera(bandera);
    setCuotasLoading(true);
    try {
      const { listCuotasByComercioBandera } = await import("@/lib/api/comercio-banderas-cuotas");
      const data = await listCuotasByComercioBandera(bandera.id);
      setCuotas(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCuotasLoading(false);
    }
  };

  const openCuotaForm = () => {
    setCuotaValor("1");
    setCuotaTasa("");
    setCuotaEstado("Activo");
    setShowCuotaForm(true);
  };

  const guardarCuota = async () => {
    if (!cuotasBandera || !cuotaValor.trim()) return;
    setSavingCuota(true);
    try {
      const { createComercioBanderaCuota } = await import("@/lib/api/comercio-banderas-cuotas");
      await createComercioBanderaCuota({
        comercioBanderaId: cuotasBandera.id,
        cuotas: parseInt(cuotaValor) || 1,
        tasaMensual: parseDecimal(cuotaTasa),
        estado: cuotaEstado,
      });
      setShowCuotaForm(false);
      setCuotaValor("1");
      setCuotaTasa("");
      setCuotaEstado("Activo");
      await cargarCuotas(cuotasBandera);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingCuota(false);
    }
  };

  const eliminarCuota = async () => {
    if (!confirmDeleteCuota) return;
    try {
      const { deleteComercioBanderaCuota } = await import("@/lib/api/comercio-banderas-cuotas");
      await deleteComercioBanderaCuota(confirmDeleteCuota.id);
      setConfirmDeleteCuota(null);
      if (cuotasBandera) await cargarCuotas(cuotasBandera);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return {
    banderas,
    banderasCatalogo,
    loading,
    error,
    cargar,
    // formulario de bandera
    showForm,
    editing,
    openCreate,
    openEdit,
    closeForm,
    formBanderaId,
    setFormBanderaId,
    formBanderaCustom,
    setFormBanderaCustom,
    formComisionPropia,
    setFormComisionPropia,
    formPayway,
    setFormPayway,
    formEstado,
    setFormEstado,
    formMetodoKey,
    setFormMetodoKey,
    neto,
    saving,
    guardar,
    confirmDelete,
    setConfirmDelete,
    eliminar,
    // cuotas
    cuotasBandera,
    setCuotasBandera,
    cuotas,
    cuotasLoading,
    cargarCuotas,
    showCuotaForm,
    setShowCuotaForm,
    openCuotaForm,
    cuotaValor,
    setCuotaValor,
    cuotaTasa,
    setCuotaTasa,
    cuotaEstado,
    setCuotaEstado,
    savingCuota,
    guardarCuota,
    confirmDeleteCuota,
    setConfirmDeleteCuota,
    eliminarCuota,
  };
}

export type BanderasComercioState = ReturnType<typeof useBanderasComercio>;
