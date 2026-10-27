import { formatDateTime, formatMoney, formatPercent } from "@/shared/format";
import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/brand/brand";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Eye, Power, PowerOff, Edit3, Trash2, Plus, X, AlertTriangle, Inbox } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { PageHeader, Badge, BtnOutline, BtnPrimary, Input, Label } from "@/components/portal-shell";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FormDialog } from "@/shared/ui/form-dialog";
import { useImpuestos } from "@/hooks/useImpuestos";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createImpuesto,
  updateImpuesto,
  deleteImpuesto,
  setImpuestoEstado,
} from "@/lib/api/impuestos";
import { DataAccessError } from "@/lib/api/errors";
import { useCan } from "@/lib/permissions";
import { PermissionGuard } from "@/components/permission-guard";
import type { Impuesto, TipoImpuesto, AmbitoImpuesto } from "@/lib/api/types";

export const Route = createFileRoute("/admin/comercios/impuestos/")({
  component: Page,
  head: () => ({
    meta: [{ title: pageTitle("Impuestos — Admin") }],
  }),
});

const PAGE_SIZE = 10;

const TIPOS_IMPUESTO: TipoImpuesto[] = ["Porcentaje", "Fijo", "Otro"];
const AMBITOS_IMPUESTO: AmbitoImpuesto[] = ["Externo", "Interno"];

function estadoTone(estado: "Activo" | "Inactivo"): "success" | "neutral" {
  return estado === "Activo" ? "success" : "neutral";
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}

function MensajeEstado({
  tipo,
  mensaje,
  onRetry,
}: {
  tipo: "error" | "vacio" | "permiso";
  mensaje: string;
  onRetry?: () => void;
}) {
  if (tipo === "permiso") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-6 py-12 text-center text-sm text-amber-800">
        <AlertTriangle size={28} />
        <div>
          <p className="font-semibold">No tenés permiso para ver esto</p>
          <p className="mt-1">{mensaje}</p>
        </div>
      </div>
    );
  }
  if (tipo === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center text-sm text-danger-700">
        <AlertTriangle size={28} />
        <div>
          <p className="font-semibold">Ocurrió un error al cargar los impuestos</p>
          <p className="mt-1">{mensaje}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      <Inbox size={28} />
      <p>No hay impuestos que coincidan con la búsqueda.</p>
    </div>
  );
}

// --- Detalle -----------------------------------------------------------------

function DetalleModal({ imp, onClose }: { imp: Impuesto; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-start z-10">
          <div>
            <h3 className="font-display text-lg font-semibold">
              Detalle del impuesto: {imp.nombre}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{imp.codigo}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Código" value={<span className="font-mono">{imp.codigo}</span>} />
            <Field label="Nombre" value={imp.nombre} />
            <Field label="Descripción" value={imp.descripcion ?? "—"} />
            <Field
              label="�mbito"
              value={
                <Badge tone={imp.ambito === "Interno" ? "success" : "neutral"}>{imp.ambito}</Badge>
              }
            />
            <Field label="Tipo" value={imp.tipo} />
            <Field
              label="Monto"
              value={
                imp.monto === null ? (
                  "—"
                ) : (
                  <span className="font-mono tabular-nums">
                    {imp.tipo === "Porcentaje" ? formatPercent(imp.monto) : formatMoney(imp.monto)}
                  </span>
                )
              }
            />
            <Field
              label="Estado"
              value={<Badge tone={estadoTone(imp.estado)}>{imp.estado}</Badge>}
            />
            <Field
              label="Creado"
              value={
                <span className="font-mono tabular-nums">{formatDateTime(imp.createdAt)}</span>
              }
            />
            <Field
              label="Actualizado"
              value={
                <span className="font-mono tabular-nums">{formatDateTime(imp.updatedAt)}</span>
              }
            />
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end">
          <BtnOutline type="button" onClick={onClose}>
            Cerrar
          </BtnOutline>
        </div>
      </div>
    </div>
  );
}

// --- Form principal -----------------------------------------------------------

type ImpuestoForm = {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: TipoImpuesto;
  monto: string;
  estado: "Activo" | "Inactivo";
  ambito: AmbitoImpuesto;
};

function ImpuestoFormModal({
  impuesto,
  onClose,
  onSave,
}: {
  impuesto: Impuesto | null;
  onClose: () => void;
  onSave: (form: ImpuestoForm) => void;
}) {
  const [form, setForm] = useState<ImpuestoForm>(() => ({
    codigo: impuesto?.codigo ?? "",
    nombre: impuesto?.nombre ?? "",
    descripcion: impuesto?.descripcion ?? "",
    tipo: impuesto?.tipo ?? "Porcentaje",
    monto: impuesto?.monto === null || impuesto?.monto === undefined ? "" : String(impuesto.monto),
    estado: impuesto?.estado ?? "Activo",
    ambito: (impuesto?.ambito as AmbitoImpuesto) ?? "Externo",
  }));

  const necesitaMonto = form.tipo !== "Otro";
  const montoValido = !necesitaMonto || (form.monto.trim() !== "" && Number(form.monto) >= 0);
  const valido = form.codigo.trim() !== "" && form.nombre.trim() !== "" && montoValido;

  const guardar = () => {
    if (!valido) return;
    onSave({
      ...form,
      monto: necesitaMonto ? form.monto : "",
    });
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={impuesto ? "Editar impuesto" : "Nuevo impuesto"}
      description={
        impuesto
          ? `Modificá los datos del impuesto "${impuesto.nombre}".`
          : "Definí el tipo de impuesto y su monto."
      }
      onSubmit={guardar}
      submitLabel={impuesto ? "Guardar cambios" : "Crear impuesto"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="im-codigo">Código</Label>
          <Input
            id="im-codigo"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            placeholder="Ej: IIBB"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Debe ser único entre los impuestos.
          </p>
        </div>
        <div>
          <Label htmlFor="im-nombre">Nombre</Label>
          <Input
            id="im-nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Ingresos Brutos"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="im-desc">Descripción</Label>
          <Input
            id="im-desc"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="im-tipo">Tipo de impuesto</Label>
          <select
            id="im-tipo"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoImpuesto })}
          >
            {TIPOS_IMPUESTO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="im-estado">Estado</Label>
          <select
            id="im-estado"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as "Activo" | "Inactivo" })}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <Label htmlFor="im-ambito">�mbito</Label>
          <select
            id="im-ambito"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={form.ambito}
            onChange={(e) => setForm({ ...form, ambito: e.target.value as AmbitoImpuesto })}
          >
            {AMBITOS_IMPUESTO.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">Externo=neutral, Interno=success</p>
        </div>
        {necesitaMonto && (
          <div className="sm:col-span-2">
            <Label htmlFor="im-monto">Monto {form.tipo === "Porcentaje" ? "(%)" : "($)"}</Label>
            <Input
              id="im-monto"
              type="number"
              step="any"
              min="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              placeholder={form.tipo === "Porcentaje" ? "Ej: 35" : "Ej: 0.60"}
            />
            {form.monto.trim() !== "" && Number(form.monto) < 0 && (
              <p className="text-xs text-danger-600 mt-1">El monto no puede ser negativo.</p>
            )}
          </div>
        )}
      </div>
      {!valido && (
        <p className="text-xs text-muted-foreground">
          Completá el código y el nombre {necesitaMonto ? "y el monto" : ""} para poder guardar.
        </p>
      )}
    </FormDialog>
  );
}

// --- Página --------------------------------------------------------------------

function Page() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [estadoFilter, setEstadoFilter] = useState<"Activo" | "Inactivo" | "">("");
  const [tab, setTab] = useState<"externos" | "internos">("externos");

  const { can } = useCan();
  const puedeCrear = can("crear", "impuestos");
  const puedeModificar = can("modificar", "impuestos");
  const puedeBorrar = can("borrar", "impuestos");

  const { rows, total, isLoading, isFetching, isError, error, isEmpty, refetch } = useImpuestos({
    page,
    pageSize: PAGE_SIZE,
    search,
    estado: estadoFilter || undefined,
  });

  const filteredRows = useMemo(() => {
    const target: AmbitoImpuesto = tab === "internos" ? "Interno" : "Externo";
    return rows.filter((r) => (r.ambito ?? "Externo") === target);
  }, [rows, tab]);

  const externosCount = useMemo(
    () => rows.filter((r) => (r.ambito ?? "Externo") === "Externo").length,
    [rows],
  );
  const internosCount = useMemo(
    () => rows.filter((r) => (r.ambito ?? "Externo") === "Interno").length,
    [rows],
  );

  const err = error instanceof DataAccessError ? error : null;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [detail, setDetail] = useState<Impuesto | null>(null);
  const [editTarget, setEditTarget] = useState<Impuesto | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Impuesto | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    variant: "default" | "danger";
    onConfirm: () => void;
  } | null>(null);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["impuestos"] });

  const toggleEstado = async (row: Impuesto) => {
    try {
      await setImpuestoEstado(row.id, row.estado === "Activo" ? "Inactivo" : "Activo");
      invalidar();
    } catch (e) {
      setConfirmAction({
        title: "No se pudo actualizar",
        message: (e as Error).message,
        confirmLabel: "Cerrar",
        variant: "danger",
        onConfirm: () => setConfirmAction(null),
      });
    }
  };

  const guardar = async (form: ImpuestoForm) => {
    const necesitaMonto = form.tipo !== "Otro";
    const payload = {
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      tipo: form.tipo,
      monto: necesitaMonto ? Number(form.monto) : null,
      estado: form.estado,
      ambito: form.ambito,
    };
    try {
      if (editTarget) {
        await updateImpuesto(editTarget.id, payload);
      } else {
        await createImpuesto(payload);
      }
      invalidar();
      setShowNew(false);
      setEditTarget(null);
    } catch (e) {
      const dErr = e as DataAccessError;
      const esDuplicado = dErr.code === "23505" || /duplicat|unique/i.test(dErr.message);
      setConfirmAction({
        title: "No se pudo guardar",
        message: esDuplicado
          ? `Ya existe un impuesto con el código "${form.codigo.trim()}".`
          : (e as Error).message,
        confirmLabel: "Cerrar",
        variant: "danger",
        onConfirm: () => setConfirmAction(null),
      });
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      await deleteImpuesto(confirmDelete.id);
      invalidar();
    } catch (e) {
      setConfirmAction({
        title: "No se pudo eliminar",
        message: (e as Error).message,
        confirmLabel: "Cerrar",
        variant: "danger",
        onConfirm: () => setConfirmAction(null),
      });
    }
    setConfirmDelete(null);
  };

  const getActions = (row: Impuesto): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => setDetail(row) },
    {
      label: row.estado === "Activo" ? "Desactivar" : "Activar",
      icon: row.estado === "Activo" ? PowerOff : Power,
      disabled: !puedeModificar,
      onClick: () => toggleEstado(row),
    },
    { label: "Editar", icon: Edit3, disabled: !puedeModificar, onClick: () => setEditTarget(row) },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      disabled: !puedeBorrar,
      onClick: () => setConfirmDelete(row),
    },
  ];

  const columns: Column<Impuesto>[] = [
    {
      key: "codigo",
      label: "Código",
      sortable: true,
      render: (r) => <span className="font-mono text-xs font-semibold">{r.codigo}</span>,
    },
    {
      key: "nombre",
      label: "Nombre",
      sortable: true,
      render: (r) => <span className="font-medium">{r.nombre}</span>,
    },
    {
      key: "descripcion",
      label: "Descripción",
      render: (r) => r.descripcion ?? "—",
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (r) => r.tipo,
    },
    {
      key: "monto",
      label: "Monto",
      sortable: true,
      render: (r) =>
        r.monto === null ? (
          "—"
        ) : (
          <span className="font-mono tabular-nums">
            {r.tipo === "Porcentaje" ? formatPercent(r.monto) : formatMoney(r.monto)}
          </span>
        ),
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (r) => <Badge tone={estadoTone(r.estado)}>{r.estado}</Badge>,
    },
  ];

  return (
    <PermissionGuard recurso="impuestos">
      <PageHeader
        title="Impuestos"
        description="Catálogo de tipos de impuestos de la plataforma y su monto."
        action={
          <BtnPrimary type="button" onClick={() => setShowNew(true)} disabled={!puedeCrear}>
            <Plus size={14} /> Nuevo impuesto
          </BtnPrimary>
        }
      />

      <div className="flex gap-1 border-b border-border mb-4">
        <button
          type="button"
          onClick={() => {
            setTab("externos");
            setPage(0);
          }}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "externos"
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Externos {externosCount > 0 ? "(" + externosCount + ")" : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("internos");
            setPage(0);
          }}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "internos"
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Internos {internosCount > 0 ? "(" + internosCount + ")" : ""}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="buscar">Buscar</Label>
          <Input
            id="buscar"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
            placeholder="Código, nombre o descripción…"
          />
        </div>
        <div>
          <Label htmlFor="f-estado">Estado</Label>
          <select
            id="f-estado"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value as "Activo" | "Inactivo" | "");
              setPage(0);
            }}
          >
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <span className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
          Cargando impuestos…
        </div>
      ) : isError ? (
        <MensajeEstado
          tipo={err?.permission ? "permiso" : "error"}
          mensaje={err?.message ?? "Error desconocido"}
          onRetry={() => refetch()}
        />
      ) : isEmpty ? (
        <MensajeEstado tipo="vacio" mensaje="" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredRows}
            keyExtractor={(r) => r.id}
            pageSize={PAGE_SIZE}
            showDownloadButton={false}
            actions={(r) => <ActionsDropdown actions={getActions(r)} />}
          />
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              {total} impuesto(s) · página {page + 1} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPaginas || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-9 items-center rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {detail && <DetalleModal imp={detail} onClose={() => setDetail(null)} />}

      {(showNew || editTarget) && (
        <ImpuestoFormModal
          impuesto={editTarget}
          onClose={() => {
            setShowNew(false);
            setEditTarget(null);
          }}
          onSave={guardar}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Eliminar impuesto"
        message={`¿Estás seguro de eliminar el impuesto "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={eliminar}
      />

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          variant={confirmAction.variant}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </PermissionGuard>
  );
}
