import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Edit3, XCircle, CheckCircle, ChevronDown } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AlertaGestionModal, type GestionAlerta } from "@/components/alerta-gestion";
import { FormDialog } from "@/components/form-dialog";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { Badge, PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/admin/general/alertas/")({
  head: () => ({
    meta: [{ title: "Listado de alertas — Admin" }],
  }),
  component: ListadoAlertas,
});

type TransaccionOrigen = {
  email: string;
  cvu: string;
  legajo: string;
};

type TransaccionDestino = {
  nombreCompleto: string;
  cuitCuil: string;
  cvu: string;
};

type Transaccion = {
  tipo: string;
  monto: string;
  codigo: string;
  origen: TransaccionOrigen;
  destino: TransaccionDestino;
};

type Alerta = {
  legajo: string;
  correo: string;
  nombre: string;
  tipo: string;
  estado: string;
  activo: string;
  fechaAlerta: string;
  fechaAceptacion?: string;
  transacciones: Transaccion[];
};

const todayISO = new Date().toISOString().slice(0, 10);

// Sin datos hasta conectar con la tabla `alerts` (antes eran datos de ejemplo).
const initialData: Alerta[] = [];

function AlertaFields({ alerta, onChange }: { alerta: Alerta; onChange: (a: Alerta) => void }) {
  const set = (patch: Partial<Alerta>) => onChange({ ...alerta, ...patch });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Legajo</label>
        <input
          value={alerta.legajo}
          onChange={(e) => set({ legajo: e.target.value })}
          className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Correo</label>
        <input
          value={alerta.correo}
          onChange={(e) => set({ correo: e.target.value })}
          className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Nombre</label>
        <input
          value={alerta.nombre}
          onChange={(e) => set({ nombre: e.target.value })}
          className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Tipo de alerta</label>
        <input
          value={alerta.tipo}
          onChange={(e) => set({ tipo: e.target.value })}
          className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Estado</label>
        <select
          className="w-full h-9 rounded-md border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring/40"
          value={alerta.estado}
          onChange={(e) => set({ estado: e.target.value })}
        >
          <option>Pendiente</option>
          <option>Revisado</option>
          <option>Resuelto</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">Activo</label>
        <select
          className="w-full h-9 rounded-md border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring/40"
          value={alerta.activo}
          onChange={(e) => set({ activo: e.target.value })}
        >
          <option>Sí</option>
          <option>No</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          Fecha de la alerta
        </label>
        <input
          type="date"
          value={alerta.fechaAlerta}
          onChange={(e) => set({ fechaAlerta: e.target.value })}
          className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          Fecha de aceptación
        </label>
        <input
          type="date"
          value={alerta.fechaAceptacion ?? ""}
          onChange={(e) => set({ fechaAceptacion: e.target.value || undefined })}
          className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
    </div>
  );
}

function TransaccionRow({ t }: { t: Transaccion }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
      >
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
        />
        <span className="font-medium text-foreground">{t.tipo}</span>
        <span className="font-mono tabular-nums font-semibold">{t.monto}</span>
        <span className="text-muted-foreground text-xs ml-auto truncate">Código: {t.codigo}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 border-t border-border/60 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Código</span>
            <span className="font-mono tabular-nums font-medium">{t.codigo}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-muted/40 p-3">
              <h5 className="text-xs font-semibold text-muted-foreground mb-2">Origen</h5>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium text-right break-all">{t.origen.email}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">CVU</dt>
                  <dd className="font-mono tabular-nums text-right">{t.origen.cvu}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Legajo</dt>
                  <dd className="font-mono tabular-nums font-medium">{t.origen.legajo}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <h5 className="text-xs font-semibold text-muted-foreground mb-2">Destino</h5>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Nombre completo</dt>
                  <dd className="font-medium text-right">{t.destino.nombreCompleto}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">CUIT/CUIL</dt>
                  <dd className="font-mono tabular-nums text-right">{t.destino.cuitCuil}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">CVU</dt>
                  <dd className="font-mono tabular-nums text-right">{t.destino.cvu}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-border/60">
            <span className="text-sm text-muted-foreground">Monto</span>
            <span className="font-mono tabular-nums font-semibold">{t.monto}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ListadoAlertas() {
  const [data, setData] = useState(initialData);
  const [viewing, setViewing] = useState<Alerta | null>(null);
  const [editTarget, setEditTarget] = useState<Alerta | null>(null);
  const [gestionTarget, setGestionTarget] = useState<Alerta | null>(null);
  const [gestiones, setGestiones] = useState<Record<string, GestionAlerta>>({});
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    variant: "default" | "danger";
    onConfirm: () => void;
  } | null>(null);

  const getActions = (row: Alerta): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => setViewing({ ...row }) },
    { label: "Editar", icon: Edit3, onClick: () => setEditTarget({ ...row }) },
    {
      label: "Gestionar",
      icon: Edit3,
      onClick: () => setGestionTarget(row),
    },
    ...(!row.fechaAceptacion
      ? [
          {
            label: "Aceptar alerta",
            icon: CheckCircle,
            onClick: () =>
              setConfirmAction({
                title: "Aceptar alerta",
                message: `¿Estás seguro de aceptar la alerta de ${row.nombre}? Se registrará la fecha de aceptación.`,
                confirmLabel: "Aceptar alerta",
                variant: "default" as const,
                onConfirm: () =>
                  setData((prev) =>
                    prev.map((a) =>
                      a.legajo === row.legajo
                        ? { ...a, estado: "Revisado", fechaAceptacion: todayISO }
                        : a,
                    ),
                  ),
              }),
          },
        ]
      : []),
    {
      label: row.activo === "Sí" ? "Desactivar" : "Activar",
      icon: row.activo === "Sí" ? XCircle : CheckCircle,
      onClick: () =>
        setConfirmAction({
          title: row.activo === "Sí" ? "Desactivar alerta" : "Activar alerta",
          message: `¿Estás seguro de ${row.activo === "Sí" ? "desactivar" : "activar"} la alerta de ${row.nombre}?`,
          confirmLabel: row.activo === "Sí" ? "Desactivar" : "Activar",
          variant: row.activo === "Sí" ? "danger" : "default",
          onConfirm: () =>
            setData((prev) =>
              prev.map((a) =>
                a.legajo === row.legajo ? { ...a, activo: row.activo === "Sí" ? "No" : "Sí" } : a,
              ),
            ),
        }),
    },
  ];

  const columns: Column<Alerta>[] = [
    {
      key: "legajo",
      label: "Legajo",
      filterable: true,
      render: (r) => <span className="font-mono tabular-nums">{r.legajo}</span>,
    },
    { key: "correo", label: "Correo", filterable: true, render: (r) => r.correo },
    { key: "nombre", label: "Nombre", filterable: true, render: (r) => r.nombre },
    { key: "tipo", label: "Tipo de alerta", filterable: true, render: (r) => r.tipo },
    {
      key: "estado",
      label: "Estado",
      filterable: "enum",
      filterOptions: ["Pendiente", "Revisado", "Resuelto"],
      render: (row) => {
        const tone =
          row.estado === "Resuelto" ? "success" : row.estado === "Revisado" ? "neutral" : "warn";
        return <Badge tone={tone}>{row.estado}</Badge>;
      },
    },
    {
      key: "activo",
      label: "Activo",
      filterable: "enum",
      filterOptions: ["Sí", "No"],
      render: (row) => (
        <Badge tone={row.activo === "Sí" ? "success" : "danger"}>{row.activo}</Badge>
      ),
    },
    {
      key: "fechaAlerta",
      label: "Fecha de la alerta",
      sortable: true,
      filterable: "date",
      render: (r) => <span className="font-mono tabular-nums">{r.fechaAlerta}</span>,
    },
    {
      key: "fechaAceptacion",
      label: "Fecha de aceptación",
      sortable: true,
      filterable: "date",
      render: (r) => <span className="font-mono tabular-nums">{r.fechaAceptacion ?? "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Listado de alertas"
        description="Alertas generadas por el sistema de monitoreo."
      />
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.legajo}
        actions={(r) => <ActionsDropdown actions={getActions(r)} />}
        dateFilterColumns={["fechaAlerta", "fechaAceptacion"]}
      />

      {viewing && (
        <FormDialog
          open={!!viewing}
          onClose={() => setViewing(null)}
          title="Detalle de alerta"
          description={`Alerta de ${viewing.nombre}`}
          onSubmit={() => {
            setData((prev) => prev.map((a) => (a.legajo === viewing.legajo ? viewing : a)));
            setViewing(null);
          }}
          submitLabel="Guardar cambios"
          size="lg"
        >
          <AlertaFields alerta={viewing} onChange={setViewing} />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Detalles de transacciones que gatillaron la alerta
            </h4>
            <div className="space-y-2">
              {viewing.transacciones.map((t, i) => (
                <TransaccionRow key={i} t={t} />
              ))}
            </div>
          </div>
        </FormDialog>
      )}

      {editTarget && (
        <FormDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          title="Editar alerta"
          description={`Editando alerta de ${editTarget.nombre}`}
          onSubmit={() => {
            setData((prev) => prev.map((a) => (a.legajo === editTarget.legajo ? editTarget : a)));
            setEditTarget(null);
          }}
          submitLabel="Guardar cambios"
        >
          <AlertaFields alerta={editTarget} onChange={setEditTarget} />
        </FormDialog>
      )}

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

      <AlertaGestionModal
        open={!!gestionTarget}
        onClose={() => setGestionTarget(null)}
        resumen={gestionTarget ? `${gestionTarget.tipo} · ${gestionTarget.nombre}` : ""}
        onGuardar={(g) => {
          if (gestionTarget) {
            setGestiones((prev) => ({ ...prev, [gestionTarget.legajo]: g }));
            setData((prev) =>
              prev.map((a) =>
                a.legajo === gestionTarget.legajo
                  ? { ...a, estado: "Resuelto", fechaAceptacion: g.fecha }
                  : a,
              ),
            );
          }
        }}
      />
    </div>
  );
}
