import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { BtnOutline, BtnPrimary, Input, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { FormDialog } from "@/shared/ui/form-dialog";
import { FileDropzone } from "@/components/file-dropzone";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listConciliacionesArchivos, createConciliacionArchivo } from "@/lib/api/conciliaciones";
import { parseBancoFile, type BankRow } from "@/lib/conciliacion/parse";
import { AnalisisConciliacionModal } from "@/features/reportes/components/AnalisisConciliacionModal";
import type { Archivo } from "@/features/reportes/utils/conciliacion";
import { downloadExcel } from "@/features/reportes/utils/download";

const ARCHIVOS_INICIALES: Archivo[] = [];

export function ReporteConciliaciones() {
  const [archivos, setArchivos] = useState<Archivo[]>(ARCHIVOS_INICIALES);
  const [analisisTarget, setAnalisisTarget] = useState<Archivo | null>(null);
  const [cargando, setCargando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    nombre: "",
    fecha: "",
    file: null as File | null,
  });

  // Carga inicial desde Supabase si está configurado - cada fila refleja DB
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listConciliacionesArchivos({ page: 0, pageSize: 50, tipo: "bancaria" })
      .then((res) => {
        if (res.rows.length > 0) {
          setArchivos(
            res.rows.map((r) => ({
              archivo: r.nombreArchivo,
              fecha: r.fechaCarga,
              estado: (r.estado === "Analizado" ? "Analizado" : "Pendiente") as Archivo["estado"],
              downloadRows: [],
              storagePath: r.storagePath,
              bankRows: undefined,
              rawFile: null,
            })),
          );
        }
      })
      .catch(() => {
        // fallback a mocks si RLS/migración aún no aplicada
      });
  }, []);

  const guardarArchivo = async () => {
    if (!uploadForm.nombre.trim() || !uploadForm.fecha || !uploadForm.file) {
      toast.error("Completá nombre, fecha y archivo");
      return;
    }
    const nombreArchivo = uploadForm.file.name || uploadForm.nombre.trim();
    // Parsear localmente para tener bankRows listos para Analizar (mapeo real aunque falle Supabase)
    let parsed: BankRow[] = [];
    let downloadRows: Record<string, unknown>[] = [];
    try {
      parsed = await parseBancoFile(uploadForm.file);
      downloadRows = parsed.map((b) => ({ ...b.raw, IMPORTE_COELSA: b.importeCoelsa })) as Record<
        string,
        unknown
      >[];
      toast.success(`Parseado: ${parsed.length} filas (mapeo ID_DEBIN→id_txn)`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Error parseando archivo: ${msg}`);
      return;
    }
    const local: Archivo = {
      archivo: nombreArchivo,
      fecha: uploadForm.fecha,
      estado: "Pendiente",
      downloadRows,
      bankRows: parsed,
      rawFile: uploadForm.file,
    };
    // Persistencia real si hay Supabase
    if (isSupabaseConfigured) {
      setSaving(true);
      try {
        const created = await createConciliacionArchivo({
          nombreArchivo,
          fechaCarga: uploadForm.fecha,
          tipo: "bancaria",
          estado: "Pendiente",
          file: uploadForm.file,
        });
        setArchivos((prev) => [
          {
            ...local,
            archivo: created.nombreArchivo,
            fecha: created.fechaCarga,
            storagePath: created.storagePath,
          },
          ...prev,
        ]);
        toast.success("Archivo guardado en base de datos");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/Could not find the table|PGRST205|does not exist/i.test(msg)) {
          setArchivos((prev) => [local, ...prev]);
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
      setArchivos((prev) => [local, ...prev]);
      toast.success("Archivo cargado correctamente");
    }
    setUploadForm({ nombre: "", fecha: "", file: null });
    setCargando(false);
  };

  const columns: Column<Archivo>[] = [
    {
      key: "archivo",
      label: "Archivo",
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
      key: "analizar",
      label: "Acción",
      render: (r) => (
        <div className="flex items-center gap-1">
          <BtnOutline
            className="h-7 text-xs px-3"
            onClick={() => {
              downloadExcel(r.archivo.replace(".csv", ".xlsx"), r.downloadRows);
              toast.success("Archivo descargado correctamente");
            }}
          >
            <Download size={14} /> Descargar
          </BtnOutline>
          <BtnOutline className="h-7 text-xs px-3" onClick={() => setAnalisisTarget(r)}>
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
          El banco sube diariamente (día anterior) todas las transacciones.
        </p>
        <BtnPrimary type="button" className="h-9 text-sm" onClick={() => setCargando(true)}>
          <Plus size={14} /> Cargar CSV
        </BtnPrimary>
      </div>
      <DataTable columns={columns} data={archivos} keyExtractor={(r) => r.archivo} />

      {analisisTarget && (
        <AnalisisConciliacionModal
          archivo={analisisTarget}
          allArchivos={archivos}
          onClose={() => setAnalisisTarget(null)}
        />
      )}

      {cargando && (
        <FormDialog
          open
          onClose={() => (saving ? null : setCargando(false))}
          title="Cargar archivo de conciliación"
          description="Ingresá el nombre, la fecha de carga y el archivo CSV. Se guarda en la base de datos."
          onSubmit={guardarArchivo}
          submitLabel={saving ? "Guardando..." : "Guardar"}
          cancelLabel="Cancelar"
          size="md"
        >
          <div>
            <Label htmlFor="conc-nombre">Nombre del archivo</Label>
            <Input
              id="conc-nombre"
              value={uploadForm.nombre}
              onChange={(e) => setUploadForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="conciliacion_20260801.csv"
            />
          </div>
          <div>
            <Label htmlFor="conc-fecha">Fecha de carga</Label>
            <input
              id="conc-fecha"
              type="date"
              value={uploadForm.fecha}
              onChange={(e) => setUploadForm((f) => ({ ...f, fecha: e.target.value }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <Label>Archivo CSV</Label>
            <FileDropzone
              accept=".csv,.xlsx,.xls"
              onFile={(f) =>
                setUploadForm((fr) => ({ ...fr, file: f, nombre: f?.name ?? fr.nombre }))
              }
            />
          </div>
        </FormDialog>
      )}
    </div>
  );
}
