import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, FileUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import {
  createSubcuenta,
  deleteSubcuenta,
  listSubcuentas,
  updateSubcuenta,
  type Subcuenta,
  type SubcuentaEstado,
  type SubcuentaTipo,
  type SubcuentaUpdate,
} from "@/lib/api/subcuentas";
import { SubcuentaDetalleModal, TablaSubcuentas } from "@/components/subcuentas-tab";
import { CargaMasivaSubcuentas } from "./CargaMasivaSubcuentas";
import { KpiCard } from "./KpiCard";
import { Seccion } from "./Seccion";

export function SubcuentasTab({
  legajo,
  onEximirCuit,
}: {
  legajo: string;
  onEximirCuit: () => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [masivaOpen, setMasivaOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    cbu: "",
    tipo: "Operativa" as SubcuentaTipo,
    estado: "Activa" as SubcuentaEstado,
  });

  const query = useQuery({
    queryKey: ["subcuentas", legajo],
    queryFn: () => listSubcuentas(legajo),
    enabled: !!legajo,
  });

  const subcuentas = query.data ?? [];
  const totalSubcuentas = subcuentas.length;

  const [subDetalle, setSubDetalle] = useState<Subcuenta | null>(null);
  const [subAEliminar, setSubAEliminar] = useState<Subcuenta | null>(null);

  const aplicarCambio = async (sub: Subcuenta, patch: SubcuentaUpdate) => {
    try {
      await updateSubcuenta(legajo, sub.id, patch);
      await queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onVerDetalles = (sub: Subcuenta) => setSubDetalle(sub);
  const onValidar = async (sub: Subcuenta) => {
    await aplicarCambio(sub, { validada: true });
    toast.success(`Subcuenta "${sub.nombre}" validada`);
  };
  const onSuspender = async (sub: Subcuenta) => {
    await aplicarCambio(sub, { estado: "Pausada" });
    toast.success(`Subcuenta "${sub.nombre}" suspendida`);
  };
  const onReactivar = async (sub: Subcuenta) => {
    await aplicarCambio(sub, { estado: "Activa" });
    toast.success(`Subcuenta "${sub.nombre}" reactivada`);
  };
  const onEliminar = (sub: Subcuenta) => setSubAEliminar(sub);
  const confirmarEliminar = async () => {
    if (!subAEliminar) return;
    try {
      await deleteSubcuenta(legajo, subAEliminar.id);
      await queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
      toast.success("Subcuenta eliminada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubAEliminar(null);
    }
  };

  const guardar = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      setErr("Nombre y email son obligatorios.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await createSubcuenta(legajo, {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        cbu: form.cbu,
        tipo: form.tipo,
        estado: form.estado,
      });
      await queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
      setOpen(false);
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        cbu: "",
        tipo: "Operativa",
        estado: "Activa",
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Seccion
      titulo="Subcuentas y CVUs"
      loading={query.isLoading}
      error={query.isError ? query.error : null}
      onRetry={() => query.refetch()}
      vacio={!query.isLoading && (query.data?.length ?? 0) === 0}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="CVUs informadas" value={String(totalSubcuentas)} />
        <KpiCard label="Máximo de subcuentas" value="—" />
        <KpiCard label="Redirección automática" value="Inactiva" tone="muted" />
        <KpiCard label="Presión operativa" value="Sin tope" tone="muted" />
      </div>

      <div className="flex flex-wrap justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={onEximirCuit}
          className="inline-flex items-center gap-1.5 h-9 rounded-md border border-input px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Ban size={16} /> Eximir CUIT principal
        </button>
        <button
          type="button"
          onClick={() => setMasivaOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 rounded-md border border-input px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <FileUp size={16} /> Carga masiva de subcuentas
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          <Plus size={16} /> Cargar subcuenta
        </button>
      </div>

      <CargaMasivaSubcuentas
        open={masivaOpen}
        legajo={legajo}
        onClose={() => setMasivaOpen(false)}
        onDone={() => {
          setMasivaOpen(false);
          queryClient.invalidateQueries({ queryKey: ["subcuentas", legajo] });
        }}
      />
      {open && (
        <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Nombre *"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Apellido"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="rounded-md border border-input px-3 py-2 text-sm"
            placeholder="CVU"
            value={form.cbu}
            onChange={(e) => setForm({ ...form, cbu: e.target.value })}
          />
          <select
            className="rounded-md border border-input px-3 py-2 text-sm"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as SubcuentaTipo })}
          >
            <option value="Operativa">Operativa</option>
            <option value="Recaudacion">Recaudación</option>
            <option value="Garantias">Garantías</option>
            <option value="Sueldos">Sueldos</option>
          </select>
          <select
            className="rounded-md border border-input px-3 py-2 text-sm"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as SubcuentaEstado })}
          >
            <option value="Activa">Activa</option>
            <option value="Pausada">Pausada</option>
          </select>
          {err && <p className="text-sm text-danger-600 md:col-span-2">{err}</p>}
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 rounded-md border border-input px-3 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={saving}
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}
      <TablaSubcuentas
        rows={query.data ?? []}
        onVerDetalles={onVerDetalles}
        onValidar={onValidar}
        onSuspender={onSuspender}
        onReactivar={onReactivar}
        onEliminar={onEliminar}
      />

      {subDetalle && (
        <SubcuentaDetalleModal
          subcuenta={subDetalle}
          legajo={legajo}
          onClose={() => setSubDetalle(null)}
          onValidar={onValidar}
          onSuspender={onSuspender}
          onReactivar={onReactivar}
          onEliminar={onEliminar}
        />
      )}

      <ConfirmDialog
        open={!!subAEliminar}
        title="Eliminar subcuenta"
        message={`¿Estás seguro de eliminar la subcuenta "${subAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onClose={() => setSubAEliminar(null)}
      />
    </Seccion>
  );
}
