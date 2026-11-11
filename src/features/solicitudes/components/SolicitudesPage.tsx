import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, BtnOutline, Card, PageHeader } from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import {
  atenderSolicitud,
  listSolicitudes,
  type EstadoSolicitud,
  type Solicitud,
} from "@/lib/api/solicitudes";
import { formatDateTime } from "@/shared/format";
import { brand } from "@/brand/brand";

const KEY = ["solicitudes-contacto"] as const;

const ESTADO: Record<EstadoSolicitud, { label: string; tone: "warn" | "success" | "neutral" }> = {
  nueva: { label: "Nueva", tone: "warn" },
  contactado: { label: "Contactado", tone: "success" },
  descartada: { label: "Descartada", tone: "neutral" },
};

const SERVICIO: Record<string, string> = { domiciliacion: "Domiciliación" };

const FILTROS: { k: EstadoSolicitud | "todas"; l: string }[] = [
  { k: "nueva", l: "Nuevas" },
  { k: "contactado", l: "Contactados" },
  { k: "descartada", l: "Descartadas" },
  { k: "todas", l: "Todas" },
];

/**
 * Solicitudes que los comercios dejan desde el portal ("Llena tus datos y un ejecutivo te
 * contactará"). El ejecutivo llama, la marca como contactada (o descartada) y deja una nota.
 */
export function SolicitudesPage() {
  const [filtro, setFiltro] = useState<EstadoSolicitud | "todas">("nueva");
  const q = useQuery({
    queryKey: [...KEY, filtro],
    queryFn: () => listSolicitudes(filtro),
    refetchInterval: 60_000,
  });

  return (
    <PermissionGuard recurso="usuarios">
      <PageHeader
        title="Solicitudes de contacto"
        description={`Comercios que pidieron que un ejecutivo de ${brand.name} los contacte para activar un servicio (por ejemplo, Domiciliación).`}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.k}
            type="button"
            onClick={() => setFiltro(f.k)}
            className={`h-8 px-3 rounded-full border text-sm ${
              filtro === f.k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>
      {q.isLoading ? (
        <Card className="text-sm text-muted-foreground">Cargando…</Card>
      ) : q.error ? (
        <Card className="text-sm text-danger-600">
          No se pudo cargar: {(q.error as Error).message}
        </Card>
      ) : (q.data ?? []).length === 0 ? (
        <Card className="text-sm text-muted-foreground">
          {filtro === "nueva" ? "No hay solicitudes nuevas." : "No hay solicitudes."}
        </Card>
      ) : (
        <div className="space-y-3">
          {q.data!.map((s) => (
            <FilaSolicitud key={s.id} s={s} />
          ))}
        </div>
      )}
    </PermissionGuard>
  );
}

function FilaSolicitud({ s }: { s: Solicitud }) {
  const qc = useQueryClient();
  const [nota, setNota] = useState(s.nota ?? "");
  const atender = useMutation({
    mutationFn: (estado: EstadoSolicitud) => atenderSolicitud(s.id, estado, nota),
    onSuccess: () => {
      toast.success("Solicitud actualizada");
      void qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const e = ESTADO[s.estado];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{s.nombre}</span>
            <Badge tone={e.tone}>{e.label}</Badge>
            <Badge tone="neutral">{SERVICIO[s.servicio] ?? s.servicio}</Badge>
          </div>
          <div className="mt-1 text-sm">
            <a className="hover:underline" href={`tel:${s.telefono.replace(/[^\d+]/g, "")}`}>
              {s.telefono}
            </a>
            {" · "}
            <a className="hover:underline" href={`mailto:${s.correo}`}>
              {s.correo}
            </a>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Cliente{" "}
            <Link
              to="/admin/general/usuarios/$legajo"
              params={{ legajo: s.legajo }}
              className="font-medium text-foreground hover:underline"
            >
              {s.cliente} ({s.legajo})
            </Link>{" "}
            · Enviada {formatDateTime(s.createdAt)}
            {s.atendidaAt &&
              ` · ${e.label} el ${formatDateTime(s.atendidaAt)}${s.atendidaPor ? ` por ${s.atendidaPor}` : ""}`}
          </div>
          {s.mensaje && <p className="mt-2 text-sm whitespace-pre-line">“{s.mensaje}”</p>}
        </div>
        <div className="w-full sm:w-72 space-y-2">
          <textarea
            className="w-full min-h-16 px-3 py-2 rounded-md border border-input bg-card text-sm"
            placeholder="Nota interna (qué se habló, próximos pasos)"
            maxLength={1000}
            value={nota}
            onChange={(ev) => setNota(ev.target.value)}
          />
          <div className="flex flex-wrap gap-2 justify-end">
            {s.estado !== "contactado" && (
              <BtnOutline disabled={atender.isPending} onClick={() => atender.mutate("contactado")}>
                Marcar contactado
              </BtnOutline>
            )}
            {s.estado !== "descartada" && (
              <BtnOutline disabled={atender.isPending} onClick={() => atender.mutate("descartada")}>
                Descartar
              </BtnOutline>
            )}
            {s.estado !== "nueva" && (
              <BtnOutline disabled={atender.isPending} onClick={() => atender.mutate("nueva")}>
                Volver a nueva
              </BtnOutline>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
