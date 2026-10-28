import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, Card } from "@/components/portal-shell";
import { usePaisesMutaciones } from "@/hooks/usePaises";
import type { EstadoConexion, ProveedorPago } from "@/lib/api/paises";
import { formatDateTime } from "@/shared/format";
import { avisarError } from "../utils";

const ESTADO: Record<EstadoConexion, { label: string; tone: "success" | "danger" | "neutral" }> = {
  ok: { label: "Conectado", tone: "success" },
  error: { label: "Con errores", tone: "danger" },
  sin_probar: { label: "Sin probar", tone: "neutral" },
};

const MODO: Record<string, string> = {
  simulado: "simulador",
  prueba: "instancia de prueba",
  produccion: "producción",
};

const PASOS: Record<string, string> = {
  claves: "Claves de la cuenta",
  token: "Token de acceso",
  api: "Lectura de la API",
  oauth: "Aplicación OAuth",
  webhook: "Secreto de webhooks",
};

/** Conexión de la plataforma con un proveedor: estado de la última prueba y botón para repetirla. */
export function ConexionProveedorCard({
  proveedor,
  descripcion,
}: {
  proveedor: ProveedorPago;
  descripcion?: string;
}) {
  const { probarProveedor } = usePaisesMutaciones();
  const c = proveedor.conexion;
  const estado = ESTADO[c.estado];
  const entorno = c.modo
    ? (MODO[c.modo] ?? c.modo)
    : (c.entorno ?? (proveedor.sandbox ? "sandbox" : "produccion")) === "sandbox"
      ? "sandbox"
      : "producción";

  const probar = () =>
    probarProveedor.mutate(proveedor.codigo, {
      onSuccess: (r) =>
        r.ok
          ? toast.success(`Conexión con ${proveedor.nombre} OK`)
          : toast.error("La prueba encontró errores"),
      onError: avisarError,
    });

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            {proveedor.nombre}
            <Badge tone={estado.tone}>
              {estado.label}
              {c.estado === "ok" && ` (${entorno})`}
            </Badge>
          </h3>
          {descripcion && <p className="text-xs text-muted-foreground mt-1">{descripcion}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {c.verificadaAt
              ? `Última prueba ${formatDateTime(c.verificadaAt)}${c.latenciaMs != null ? ` · ${c.latenciaMs} ms` : ""}`
              : "Todavía no se probó la conexión."}
            {c.baseUrl && <span className="font-mono"> · {c.baseUrl}</span>}
          </p>
        </div>
        <BtnOutline onClick={probar} disabled={probarProveedor.isPending}>
          {probarProveedor.isPending ? "Probando…" : "Probar conexión"}
        </BtnOutline>
      </div>
      {c.pasos.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm">
          {c.pasos.map((p) => (
            <li key={p.paso} className="flex items-start gap-2">
              {p.ok ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
              ) : (
                <XCircle size={16} className="mt-0.5 shrink-0 text-danger-600" />
              )}
              <span>
                <span className="font-medium">{PASOS[p.paso] ?? p.paso}</span>
                <span className="text-muted-foreground"> — {p.detalle}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {c.pasos.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CircleDashed size={16} /> Probá la conexión para ver el detalle de cada paso.
        </p>
      )}
    </Card>
  );
}
