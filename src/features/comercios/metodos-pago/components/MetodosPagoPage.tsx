import { Edit3, Eye, Plus } from "lucide-react";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import { Badge, BtnOutline, BtnPrimary, PageHeader } from "@/components/portal-shell";
import type { Bandera } from "@/lib/api/banderas";
import { ESTADOS, estadoMetodoTone } from "../estados";
import { useMetodosPago } from "../hooks/useMetodosPago";
import { TIPOS_METODO } from "../utils";
import { MetodoPagoModal } from "./MetodoPagoModal";

const columns: Column<Bandera>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-mono text-xs tabular-nums">{r.id.slice(0, 8)}</span>,
  },
  {
    key: "nombre",
    label: "Nombre",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-semibold">{r.nombre}</span>,
  },
  {
    key: "tipo",
    label: "Tipo",
    sortable: true,
    filterable: "enum",
    filterOptions: TIPOS_METODO,
    render: (r) => r.tipo,
  },
  {
    key: "estado",
    label: "Estado",
    sortable: true,
    filterable: "enum",
    filterOptions: ESTADOS,
    render: (r) => <Badge tone={estadoMetodoTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "diasHabiles",
    label: "Días háb.",
    sortable: true,
    render: (r) => <span className="font-mono">{r.diasHabilesAcreditacion}</span>,
  },
];

/** Gestión de métodos de pago disponibles para comercios. */
export function MetodosPagoPage() {
  const s = useMetodosPago();

  const getActions = (r: Bandera): ActionItem[] => [
    { label: "Ver detalles", icon: Eye, onClick: () => s.setModal({ metodo: r }) },
    { label: "Editar", icon: Edit3, onClick: () => s.setModal({ metodo: r }) },
  ];

  return (
    <>
      <PageHeader
        title="Métodos de pago"
        description="Gestión de métodos de pago disponibles para comercios."
        action={
          <BtnPrimary type="button" onClick={() => s.setModal({ metodo: null })}>
            <Plus size={14} /> Crear método de pago
          </BtnPrimary>
        }
      />
      {s.loading ? (
        <div className="text-center py-10 text-muted-foreground">Cargando métodos de pago...</div>
      ) : (
        <DataTable
          columns={columns}
          data={s.data}
          keyExtractor={(r) => r.id}
          pageSize={10}
          actions={(r) => <ActionsDropdown actions={getActions(r)} />}
        />
      )}
      {s.modal && (
        <MetodoPagoModal
          metodo={s.modal.metodo}
          onClose={() => s.setModal(null)}
          onSave={s.handleSave}
          onDelete={s.modal.metodo ? () => s.setConfirmDelete(s.modal!.metodo) : undefined}
        />
      )}
      {s.confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => s.setConfirmDelete(null)} />
          <div className="relative bg-card rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-display text-lg font-semibold">¿Eliminar método de pago?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Esta acción no se puede deshacer. Se eliminarán también las cuotas asociadas.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <BtnOutline onClick={() => s.setConfirmDelete(null)}>Cancelar</BtnOutline>
              <BtnPrimary
                onClick={() => s.handleDelete(s.confirmDelete!)}
                className="bg-danger-600 hover:bg-danger-700"
              >
                Eliminar
              </BtnPrimary>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
