import { useState } from "react";
import { toast } from "sonner";
import { Badge, Card } from "@/components/portal-shell";
import { useConexionesComercios, usePaisesMutaciones } from "@/hooks/usePaises";
import type { ConexionComercio } from "@/lib/api/paises";
import { formatDateTime } from "@/shared/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { avisarError } from "../utils";

const TONO: Record<string, "neutral" | "success" | "warn" | "danger"> = {
  conectado: "success",
  pendiente: "warn",
  error: "danger",
  revocado: "neutral",
};

/** Comercios que conectaron (o intentaron conectar) su cuenta del proveedor por OAuth. */
export function ConexionesComerciosCard() {
  const { data = [], isLoading, error } = useConexionesComercios();
  const { desconectarComercio } = usePaisesMutaciones();
  const [baja, setBaja] = useState<ConexionComercio | null>(null);

  return (
    <Card>
      <h3 className="font-semibold">Comercios conectados</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Cuentas de los comercios vinculadas por OAuth. Las claves privadas viven cifradas en Vault.
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-danger-600">No se pudieron cargar las conexiones.</p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ningún comercio conectó su cuenta.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left">
              <tr>
                <th className="py-2 pr-4">Comercio</th>
                <th className="py-2 pr-4">Proveedor</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Cuenta</th>
                <th className="py-2 pr-4">Permisos</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-t border-border align-top">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">{c.comercio}</span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {c.legajo}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    {c.proveedor}
                    <span className="block text-xs text-muted-foreground">{c.entorno}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge tone={TONO[c.estado] ?? "neutral"}>{c.estado}</Badge>
                    {c.ultimoError && (
                      <span className="block mt-1 text-xs text-danger-600 max-w-xs">
                        {c.ultimoError}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs break-all">
                    {c.cuentaExternaId ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums">{c.scopes}</td>
                  <td className="py-2.5 pr-4 text-xs whitespace-nowrap">
                    {c.estado === "revocado" && c.revocadoAt
                      ? `Baja ${formatDateTime(c.revocadoAt)}`
                      : c.conectadoAt
                        ? formatDateTime(c.conectadoAt)
                        : "—"}
                  </td>
                  <td className="py-2.5 text-right">
                    {c.estado === "conectado" && c.proveedor === "ecartpay" && (
                      <button
                        type="button"
                        className="text-xs font-medium text-danger-600 hover:underline"
                        onClick={() => setBaja(c)}
                      >
                        Desconectar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!baja}
        onClose={() => setBaja(null)}
        title="Desconectar comercio"
        variant="danger"
        confirmLabel="Desconectar"
        closeOnConfirm
        message={`Se borran las claves de ${baja?.comercio ?? "el comercio"} y la plataforma deja de cobrar en su cuenta. El comercio puede volver a conectarla.`}
        onConfirm={() =>
          desconectarComercio.mutateAsync(baja?.comercioId ?? "").then(
            () => {
              toast.success("Comercio desconectado");
            },
            (e) => {
              avisarError(e);
              throw e;
            },
          )
        }
      />
    </Card>
  );
}
