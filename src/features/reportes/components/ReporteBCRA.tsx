import { useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { isSupabaseConfigured } from "@/lib/supabase";
import { generarPadron, nombreArchivoPadron, type FilaPadron } from "@/lib/bcra/padron";
import { descargarPadron } from "@/lib/bcra/xlsx";
import { periodoActual } from "@/features/reportes/utils/periodos";

/* ---------- Reportes BCRA — Padrón de Personas Jurídicas (Com. "A" 8207) ---------- */

type Invalido = { cuit: string | null; nombre: string | null; motivo: string };

const columnas: Column<FilaPadron>[] = [
  {
    key: "tipoDocumento",
    label: "Tipo doc",
    render: (r) => <span className="font-mono tabular-nums">{r.tipoDocumento}</span>,
  },
  {
    key: "cuit",
    label: "CUIT",
    render: (r) => <span className="font-mono tabular-nums">{r.cuit}</span>,
  },
  {
    key: "sufijo",
    label: "Sufijo",
    render: (r) => <span className="font-mono tabular-nums">{r.sufijo}</span>,
  },
  {
    key: "razonSocial",
    label: "Razón social",
    render: (r) => <span className="whitespace-pre">{r.razonSocial.trimEnd()}</span>,
  },
  {
    key: "flag",
    label: "Flag",
    render: (r) => <span className="font-mono tabular-nums">{r.flag}</span>,
  },
  {
    key: "codigoPostal",
    label: "C.P.",
    render: (r) =>
      r.codigoPostal.trim() ? (
        <span className="font-mono">{r.codigoPostal.trim()}</span>
      ) : (
        <Badge tone="warn">sin dato</Badge>
      ),
  },
  {
    key: "tipoPersonaSocietaria",
    label: "Tipo soc.",
    render: (r) => <span className="font-mono tabular-nums">{r.tipoPersonaSocietaria}</span>,
  },
];

const columnasInvalidos: Column<Invalido>[] = [
  {
    key: "cuit",
    label: "CUIT",
    render: (r) => <span className="font-mono">{r.cuit ?? "—"}</span>,
  },
  {
    key: "nombre",
    label: "Razón social",
    render: (r) => r.nombre ?? "—",
  },
  {
    key: "motivo",
    label: "Motivo",
    render: (r) => <span className="text-xs text-muted-foreground">{r.motivo}</span>,
  },
];

export function ReporteBCRA() {
  const [periodo, setPeriodo] = useState(periodoActual());
  const [filas, setFilas] = useState<FilaPadron[] | null>(null);
  const [invalidos, setInvalidos] = useState<Invalido[]>([]);
  const [sinCP, setSinCP] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [generado, setGenerado] = useState(false);

  const generar = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase no está configurado: no se puede consultar el padrón.");
      return;
    }
    setCargando(true);
    try {
      const res = await generarPadron();
      setFilas(res.filas);
      setInvalidos(res.invalidos);
      setSinCP(res.sinCodigoPostal);
      setGenerado(true);
      if (res.filas.length === 0) {
        toast.warning("No hay clientes Persona Jurídica activos para informar.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`No se pudo generar el padrón: ${msg}`);
      setGenerado(false);
    } finally {
      setCargando(false);
    }
  };

  const archivo = nombreArchivoPadron(periodo);
  const listo = generado && filas !== null && filas.length > 0;

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <div>
          <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Padrón de Clientes Personas Jurídicas
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Régimen Informativo de Proveedores de Servicios de Pago — Comunicación "A" 8207 (BCRA),
            presentado vía SISCEN. Se informa la nómina de clientes{" "}
            <strong>Persona Jurídica</strong> activos.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="bsra-periodo">Período informado</Label>
            <input
              id="bsra-periodo"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <BtnOutline className="h-9 text-xs px-3" onClick={generar} disabled={cargando}>
            <Search size={14} />
            {cargando ? "Consultando…" : "Consultar padrón"}
          </BtnOutline>
          <BtnPrimary
            className="h-9 text-xs px-3"
            onClick={() => {
              if (!filas || filas.length === 0) {
                toast.error("No hay filas para descargar. Consultá el padrón primero.");
                return;
              }
              descargarPadron(archivo, filas);
            }}
            disabled={!listo}
            title={listo ? `Descargar ${archivo}` : "Primero consultá el padrón"}
          >
            <Download size={14} /> Descargar {archivo}
          </BtnPrimary>
          {generado && filas && (
            <Badge tone={filas.length > 0 ? "success" : "warn"}>
              {filas.length} Persona(s) Jurídica(s)
            </Badge>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          El archivo se genera sin fila de encabezado y con columnas de ancho fijo, según lo exige
          el régimen. La razón social se completa a 80 caracteres y el código postal a 8.
        </p>
      </Card>

      {generado && sinCP > 0 && (
        <p className="text-xs text-muted-foreground border-l-2 border-amber-500/60 pl-3">
          <strong>Atención:</strong> {sinCP} cliente(s) no tienen código postal cargado, así que esa
          celda queda en blanco. El régimen exige el dato: completá el CP en la ficha del cliente
          antes de presentar.
        </p>
      )}

      {generado && invalidos.length > 0 && (
        <Card className="p-5">
          <h4 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Excluidos del padrón ({invalidos.length})
          </h4>
          <DataTable
            columns={columnasInvalidos}
            data={invalidos}
            keyExtractor={(r, i) => `${r.cuit ?? i}-${i}`}
            pageSize={5}
            showDownloadButton={false}
          />
        </Card>
      )}

      {filas && filas.length > 0 && (
        <DataTable
          columns={columnas}
          data={filas}
          keyExtractor={(r) => r.cuit}
          pageSize={10}
          showDownloadButton={false}
        />
      )}

      {generado && filas && filas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay clientes Persona Jurídica activos registrados.
        </p>
      )}
    </div>
  );
}
