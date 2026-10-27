import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { formatDateTime } from "@/shared/format";
import { ModalDialog } from "@/shared/ui/modal-dialog";
import { Badge } from "@/components/portal-shell";
import {
  getApiUsuario,
  listApiUsuarioEndpoints,
  listApiUsuarioLogs,
  setApiUsuarioEstado,
  type ApiUsuarioLog,
} from "@/lib/api/api-usuarios";
import type { EstadoApiUsuario } from "@/lib/api/types";
import { ApiLogDetalleModal } from "./ApiLogDetalleModal";

export function ApiDetalleModal({
  open,
  onClose,
  apiUsuarioId,
  cantidad,
}: {
  open: boolean;
  onClose: () => void;
  apiUsuarioId: string | null;
  cantidad: number;
}) {
  const usuarioQuery = useQuery({
    queryKey: ["api_usuarios", "detalle", apiUsuarioId],
    queryFn: () => (apiUsuarioId ? getApiUsuario(apiUsuarioId) : Promise.resolve(null)),
    enabled: open && !!apiUsuarioId,
  });
  const usuario = usuarioQuery.data ?? null;
  const effectiveId = apiUsuarioId ?? usuario?.id ?? null;
  const endpointsQuery = useQuery({
    queryKey: ["api_endpoints", effectiveId],
    queryFn: () => listApiUsuarioEndpoints(effectiveId ?? ""),
    enabled: open && !!effectiveId,
  });
  const logsQuery = useQuery({
    queryKey: ["api_logs", effectiveId],
    queryFn: () => listApiUsuarioLogs(effectiveId ?? ""),
    enabled: open && !!effectiveId,
  });
  const [logDetalle, setLogDetalle] = useState<ApiUsuarioLog | null>(null);
  const queryClient = useQueryClient();
  const credencialActiva = usuario?.estado === "Producción" || usuario?.estado === "Homologación";
  const cambiarCredencial = useMutation({
    mutationFn: (estado: EstadoApiUsuario) => setApiUsuarioEstado(effectiveId!, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api_usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["cliente_api_usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["cliente_modulos"] });
    },
  });

  return (
    <ModalDialog open={open} onClose={onClose} title="Detalle de API externa" size="xl">
      <div className="space-y-5">
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Información del Usuario
          </h4>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm">
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-medium">{usuario?.id ?? apiUsuarioId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium">{usuario?.nombreCompleto ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{usuario?.usuario ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Estado</dt>
              <dd>
                <Badge tone={usuario?.estado === "Producción" ? "success" : "warn"}>
                  {usuario?.estado ?? "—"}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Descripción</dt>
              <dd className="font-medium text-right">
                Creado a través de solicitud de registro de usuario.
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Creado</dt>
              <dd className="font-medium">{formatDateTime(usuario?.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Actualizado</dt>
              <dd className="font-medium">{formatDateTime(usuario?.updatedAt)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Acciones</dt>
              <dd className="flex flex-wrap gap-1">
                {["Homologación", "Producción", "Suspender", "Eliminar"].map((a) => (
                  <span
                    key={a}
                    className="rounded-md border border-input px-2 py-0.5 text-xs font-medium"
                  >
                    {a}
                  </span>
                ))}
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-border pb-1">
              <dt className="text-muted-foreground">Usuarios asociados</dt>
              <dd className="font-medium tabular-nums">{cantidad}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credenciales del usuario
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Clave pública</th>
                  <th className="px-3 py-2 font-medium">Descripción</th>
                  <th className="px-3 py-2 font-medium">Fecha de creación</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium">{usuario?.nombreCompleto ?? "—"}</td>
                  <td className="px-3 py-2 font-medium font-mono break-all">
                    {usuario?.codigoUsuarioApi ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    Creado a través de solicitud de registro de usuario.
                  </td>
                  <td className="px-3 py-2">{formatDateTime(usuario?.createdAt)}</td>
                  <td className="px-3 py-2">
                    <Badge tone={credencialActiva ? "success" : "danger"}>
                      {credencialActiva ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {credencialActiva ? (
                      <button
                        type="button"
                        disabled={cambiarCredencial.isPending || !effectiveId}
                        onClick={() => cambiarCredencial.mutate("Suspendido")}
                        className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs font-medium hover:bg-accent disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={cambiarCredencial.isPending || !effectiveId}
                        onClick={() => cambiarCredencial.mutate("Producción")}
                        className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs font-medium hover:bg-accent disabled:opacity-50"
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Endpoints del usuario
          </h4>
          {endpointsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : endpointsQuery.isError ? (
            <p className="text-sm text-muted-foreground">Sin endpoints configurados.</p>
          ) : (endpointsQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Sin endpoints configurados.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-1.5 font-medium">Grupo</th>
                    <th className="px-2 py-1.5 font-medium">Método</th>
                    <th className="px-2 py-1.5 font-medium">Endpoint</th>
                    <th className="px-2 py-1.5 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {endpointsQuery.data!.map((ep) => (
                    <tr key={ep.id} className="border-b border-border last:border-b-0">
                      <td className="px-2 py-1.5">{ep.grupo}</td>
                      <td className="px-2 py-1.5 font-mono">{ep.metodo}</td>
                      <td className="px-2 py-1.5 font-mono break-all">{ep.path}</td>
                      <td className="px-2 py-1.5">
                        <Badge tone={ep.estado === "Habilitado" ? "success" : "neutral"}>
                          {ep.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Logs de actividad
          </h4>
          {logsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : logsQuery.isError ? (
            <p className="text-sm text-muted-foreground">Sin logs registrados.</p>
          ) : (logsQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Sin logs registrados.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-1.5 font-medium">Fecha y hora</th>
                    <th className="px-2 py-1.5 font-medium">IP</th>
                    <th className="px-2 py-1.5 font-medium">ID de cliente</th>
                    <th className="px-2 py-1.5 font-medium">Método</th>
                    <th className="px-2 py-1.5 font-medium">Endpoint</th>
                    <th className="px-2 py-1.5 font-medium">Status</th>
                    <th className="px-2 py-1.5 font-medium">Tiempo</th>
                    <th className="px-2 py-1.5 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {logsQuery.data!.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-b-0">
                      <td className="px-2 py-1.5 whitespace-nowrap">{log.fechaHora}</td>
                      <td className="px-2 py-1.5 font-mono">{log.ip}</td>
                      <td className="px-2 py-1.5 font-mono">{log.clienteId}</td>
                      <td className="px-2 py-1.5 font-mono">{log.metodo}</td>
                      <td className="px-2 py-1.5 font-mono break-all">{log.endpoint}</td>
                      <td className="px-2 py-1.5">
                        <Badge tone={log.status >= 400 ? "danger" : "success"}>
                          {log.status === 0 ? "—" : log.status}
                        </Badge>
                      </td>
                      <td className="px-2 py-1.5 tabular-nums">{log.tiempoRespuestaMs}ms</td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setLogDetalle(log)}
                          className="inline-flex items-center gap-1 h-7 rounded-md border border-input px-2 text-xs font-medium text-foreground hover:bg-accent"
                        >
                          <Eye size={12} /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ApiLogDetalleModal logDetalle={logDetalle} onClose={() => setLogDetalle(null)} />
    </ModalDialog>
  );
}
