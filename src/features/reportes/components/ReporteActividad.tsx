import { useState } from "react";
import { Download, Search } from "lucide-react";
import { BtnOutline, Input, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { brand } from "@/brand/brand";
import { downloadExcel } from "@/features/reportes/utils/download";
import {
  actividadExcelRows,
  filtrarActividad,
  type Actividad,
} from "@/features/reportes/utils/actividad";

/* ---------- Actividad de Usuarios ---------- */

const ACTIVIDAD_BASE: Record<string, Actividad[]> = {
  "ADM-001": [
    {
      campo: "Estado",
      valorAnterior: "Pendiente",
      valorNuevo: "Activo",
      fecha: "15/07/2026",
      hora: "14:32",
      usuario: "admin.operaciones",
    },
    {
      campo: "Email",
      valorAnterior: "mrodriguez@oldmail.com",
      valorNuevo: `mrodriguez@${brand.web.domain}`,
      fecha: "15/07/2026",
      hora: "11:15",
      usuario: "admin.operaciones",
    },
    {
      campo: "Rol",
      valorAnterior: "Reader",
      valorNuevo: "Admin",
      fecha: "14/07/2026",
      hora: "16:48",
      usuario: "soporte.nivel2",
    },
    {
      campo: "Ocupación",
      valorAnterior: "Empleado",
      valorNuevo: "Comerciante",
      fecha: "14/07/2026",
      hora: "09:00",
      usuario: "admin.operaciones",
    },
  ],
  "ADM-002": [
    {
      campo: "Parámetros de bloqueo",
      valorAnterior: "Límite $ 500.000",
      valorNuevo: "Límite $ 100.000",
      fecha: "15/07/2026",
      hora: "10:00",
      usuario: "admin.operaciones",
    },
    {
      campo: "Parámetros de alertas",
      valorAnterior: "Volumen anormal $ 1.000.000–$ 5.000.000",
      valorNuevo: "Volumen anormal $ 500.000–$ 2.000.000",
      fecha: "13/07/2026",
      hora: "08:30",
      usuario: "soporte.nivel1",
    },
  ],
  "ADM-003": [
    {
      campo: "Nombre",
      valorAnterior: "Pedro Sánchez",
      valorNuevo: "Pedro Sánchez Gómez",
      fecha: "12/07/2026",
      hora: "15:20",
      usuario: "admin.operaciones",
    },
    {
      campo: "Estado",
      valorAnterior: "Activo",
      valorNuevo: "Suspendido",
      fecha: "10/07/2026",
      hora: "09:45",
      usuario: "soporte.nivel2",
    },
  ],
};

const columns: Column<Actividad>[] = [
  {
    key: "campo",
    label: "Campo actualizado",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-medium">{r.campo}</span>,
  },
  {
    key: "valorAnterior",
    label: "Valor anterior",
    render: (r) => <span className="text-muted-foreground line-through">{r.valorAnterior}</span>,
  },
  {
    key: "valorNuevo",
    label: "Valor nuevo",
    sortable: true,
    filterable: true,
    render: (r) => <span className="text-foreground font-medium">{r.valorNuevo}</span>,
  },
  {
    key: "fecha",
    label: "Fecha y hora",
    sortable: true,
    filterable: "date",
    render: (r) => (
      <span className="text-muted-foreground tabular-nums">
        {r.fecha} {r.hora}
      </span>
    ),
  },
  {
    key: "usuario",
    label: "Actualizado por",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-mono text-xs">{r.usuario}</span>,
  },
];

export function ReporteActividad() {
  const [legajo, setLegajo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [consultado, setConsultado] = useState(false);

  const filtrados = consultado ? filtrarActividad(ACTIVIDAD_BASE[legajo] ?? [], desde, hasta) : [];

  const excelRows = actividadExcelRows(filtrados);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresá un Legajo para consultar la actividad del usuario. Los datos se muestran como en el
        historial de cambios del detalle del usuario.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <Label htmlFor="act-legajo">Legajo</Label>
          <Input
            id="act-legajo"
            value={legajo}
            onChange={(e) => {
              setLegajo(e.target.value);
              setConsultado(false);
            }}
            placeholder="Ej: ADM-001"
          />
        </div>
        <div className="min-w-[160px]">
          <Label htmlFor="act-desde">Desde</Label>
          <input
            id="act-desde"
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setConsultado(false);
            }}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        <div className="min-w-[160px]">
          <Label htmlFor="act-hasta">Hasta</Label>
          <input
            id="act-hasta"
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              setConsultado(false);
            }}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        <button
          disabled={!legajo}
          onClick={() => setConsultado(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={14} /> Buscar
        </button>
      </div>
      {consultado && filtrados.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BtnOutline onClick={() => downloadExcel(`actividad_${legajo}.xlsx`, excelRows)}>
              <Download size={14} /> Descargar reporte
            </BtnOutline>
            <span className="text-sm text-muted-foreground">
              {filtrados.length} registros encontrados
            </span>
          </div>
        </div>
      )}
      {consultado && filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No se encontraron registros para la búsqueda realizada.
        </p>
      ) : consultado ? (
        <DataTable
          columns={columns}
          data={filtrados}
          keyExtractor={(r) => r.fecha + r.hora + r.campo}
          pageSize={10}
          showDownloadButton={false}
        />
      ) : null}
    </div>
  );
}
