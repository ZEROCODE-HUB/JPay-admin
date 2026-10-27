import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { BtnOutline, BtnPrimary, Input, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FileDropzone } from "@/components/file-dropzone";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listConciliacionesArchivos, createConciliacionArchivo } from "@/lib/api/conciliaciones";
import { BlpAnalisisModal, BlpNoRequiereModal } from "@/features/reportes/components/BlpModals";
import { downloadFile } from "@/features/reportes/utils/download";

/* ---------- Conciliaciones BLP ---------- */

export type BlpArchivo = {
  archivo: string;
  fecha: string;
  estado: "Presentada" | "Liquidada" | "Pendiente" | "En proceso";
};

const blpData: BlpArchivo[] = [
  { archivo: "Liquidada Payway 2026-07.csv", fecha: "2026-07-31", estado: "Liquidada" },
  { archivo: "Pagos Payway 2026-07.csv", fecha: "2026-07-30", estado: "Presentada" },
  { archivo: "Pagos Payway 2026-06.csv", fecha: "2026-06-30", estado: "Presentada" },
  { archivo: "Liquidada Payway 2026-06.csv", fecha: "2026-06-29", estado: "Liquidada" },
  { archivo: "Pagos Payway 2026-05.csv", fecha: "2026-05-30", estado: "En proceso" },
];

export function ReporteConciliacionesBLP() {
  const [data, setData] = useState<BlpArchivo[]>(blpData);
  const [cargando, setCargando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analisisTarget, setAnalisisTarget] = useState<BlpArchivo | null>(null);
  const [noRequiere, setNoRequiere] = useState<string | null>(null);
  const [cargarForm, setCargarForm] = useState({
    nombre: "",
    fecha: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listConciliacionesArchivos({ page: 0, pageSize: 50, tipo: "blp" })
      .then((res) => {
        if (res.rows.length > 0) {
          setData(
            res.rows.map((r) => ({
              archivo: r.nombreArchivo,
              fecha: r.fechaCarga,
              estado: r.estado as BlpArchivo["estado"],
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const guardarArchivo = async () => {
    if (!cargarForm.nombre.trim() || !cargarForm.fecha || !cargarForm.file) {
      toast.error("Completá nombre, fecha y archivo");
      return;
    }
    const nombreArchivo = cargarForm.file.name || cargarForm.nombre.trim();
    if (isSupabaseConfigured) {
      setSaving(true);
      try {
        const created = await createConciliacionArchivo({
          nombreArchivo,
          fechaCarga: cargarForm.fecha,
          tipo: "blp",
          estado: "Pendiente",
          file: cargarForm.file,
        });
        setData((prev) => [
          { archivo: created.nombreArchivo, fecha: created.fechaCarga, estado: "Pendiente" },
          ...prev,
        ]);
        toast.success("Archivo BLP guardado en base de datos");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/Could not find the table|PGRST205|does not exist/i.test(msg)) {
          setData((prev) => [
            { archivo: nombreArchivo, fecha: cargarForm.fecha, estado: "Pendiente" },
            ...prev,
          ]);
          toast.success("Archivo cargado (modo local: aplicá migración 0016)");
        } else {
          toast.error(`Error al guardar: ${msg}`);
          setSaving(false);
          return;
        }
      } finally {
        setSaving(false);
      }
    } else {
      setData((prev) => [
        { archivo: nombreArchivo, fecha: cargarForm.fecha, estado: "Pendiente" },
        ...prev,
      ]);
      toast.success("Archivo cargado correctamente");
    }
    setCargarForm({ nombre: "", fecha: "", file: null });
    setCargando(false);
  };

  const abrirAnalisis = (r: BlpArchivo) => {
    if (r.estado === "Presentada" || r.estado === "Liquidada") {
      setAnalisisTarget(r);
    } else {
      setNoRequiere(r.archivo);
    }
  };

  const columns: Column<BlpArchivo>[] = [
    {
      key: "archivo",
      label: "Nombre del archivo",
      filterable: true,
      render: (r) => <span className="font-mono text-xs">{r.archivo}</span>,
    },
    {
      key: "fecha",
      label: "Fecha",
      filterable: "date",
      render: (r) => <span className="font-mono tabular-nums">{r.fecha}</span>,
    },
    {
      key: "accion",
      label: "Acción",
      render: (r) => (
        <div className="flex items-center gap-1">
          <BtnOutline
            className="h-7 text-xs px-3"
            onClick={() =>
              downloadFile(
                r.archivo,
                `Archivo de conciliación BLP: ${r.archivo}\nFecha: ${r.fecha}\nEstado: ${r.estado}`,
              )
            }
          >
            <Download size={14} /> Descargar
          </BtnOutline>
          <BtnOutline className="h-7 text-xs px-3" onClick={() => abrirAnalisis(r)}>
            Analizar
          </BtnOutline>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Conciliación de archivos Payway (pagos y liquidaciones) por Link de Pago.
        </p>
        <BtnPrimary type="button" className="h-9 text-sm" onClick={() => setCargando(true)}>
          <Plus size={14} /> Cargar nuevo archivo
        </BtnPrimary>
      </div>

      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.archivo}
        pageSize={10}
        showDownloadButton={false}
      />

      {cargando && (
        <FormDialog
          open
          onClose={() => (saving ? null : setCargando(false))}
          title="Cargar nuevo archivo"
          description="Se guarda en la base de datos (tipo BLP)."
          onSubmit={guardarArchivo}
          submitLabel={saving ? "Guardando..." : "Guardar"}
          size="md"
        >
          <div>
            <Label htmlFor="blp-nombre">Nombre del archivo</Label>
            <Input
              id="blp-nombre"
              value={cargarForm.nombre}
              onChange={(e) => setCargarForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Liquidada Payway 2026-08.csv"
            />
          </div>
          <div>
            <Label htmlFor="blp-fecha">Fecha</Label>
            <input
              id="blp-fecha"
              type="date"
              value={cargarForm.fecha}
              onChange={(e) => setCargarForm((f) => ({ ...f, fecha: e.target.value }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <Label>Archivo de conciliación BLP</Label>
            <FileDropzone
              accept=".csv,.xlsx,.xls"
              onFile={(f) =>
                setCargarForm((fr) => ({ ...fr, file: f, nombre: f?.name ?? fr.nombre }))
              }
            />
          </div>
        </FormDialog>
      )}

      {noRequiere && (
        <BlpNoRequiereModal archivo={noRequiere} onClose={() => setNoRequiere(null)} />
      )}
      {analisisTarget && (
        <BlpAnalisisModal archivo={analisisTarget} onClose={() => setAnalisisTarget(null)} />
      )}
    </div>
  );
}
