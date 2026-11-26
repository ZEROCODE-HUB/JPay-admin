import { useState } from "react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary } from "@/components/portal-shell";
import { useConexionesTarjeta } from "@/hooks/useConexionesCliente";
import type { ComercioConexion } from "@/lib/api/conexiones-cliente";
import { formatDateTime } from "@/shared/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { InfoTip } from "@/shared/ui/info-tip";
import { SectionCard } from "./SectionCard";

const TONO: Record<string, "neutral" | "success" | "warn" | "danger"> = {
  conectado: "success",
  pendiente: "warn",
  error: "danger",
  revocado: "neutral",
};
const ETIQUETA: Record<string, string> = {
  conectado: "Vinculado",
  pendiente: "Pendiente",
  error: "Con error",
  revocado: "Desvinculado",
};

const avisar = (e: unknown) => toast.error((e as Error).message);

/**
 * Cobros con tarjeta (Ecart Pay) del cliente: una conexión por comercio. El administrador la
 * vincula desde aquí: se abre la página de Ecart Pay, se inicia sesión con la cuenta de ESE
 * comercio y, al autorizar, se vuelve a esta ficha. El cliente también puede hacerlo desde su
 * portal (Conexiones), donde no se nombra al proveedor.
 */
export function ConexionTarjetaSection({ legajo }: { legajo: string }) {
  const { comercios, vincular, desvincular } = useConexionesTarjeta(legajo);
  const [baja, setBaja] = useState<ComercioConexion | null>(null);

  const iniciar = (c: ComercioConexion) => {
    const volver = new URL(window.location.href);
    volver.search = "";
    volver.searchParams.set("tab", "cobre");
    vincular.mutate(
      { comercioId: c.comercioId, volverA: volver.toString() },
      { onSuccess: (url) => window.location.assign(url), onError: avisar },
    );
  };

  return (
    <SectionCard
      title={
        <>
          Cobros con tarjeta (Ecart Pay){" "}
          <InfoTip>
            Cada comercio del cliente se vincula con su propia cuenta de Ecart Pay. Con eso quedan
            habilitados sus links de pago, suscripciones, domiciliación, puntos físicos y retiros.
          </InfoTip>
        </>
      }
    >
      {comercios.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : comercios.error ? (
        <p className="text-sm text-danger-600">{(comercios.error as Error).message}</p>
      ) : (comercios.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          El cliente todavía no tiene un comercio: se crea solo al activarlo o al aprobar su
          verificación.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Al tocar «Vincular» se abre Ecart Pay: inicia sesión con la cuenta{" "}
            <b>de ese comercio</b> (si el navegador ya tiene abierta otra cuenta de Ecart Pay,
            ciérrala antes) y autoriza.
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {comercios.data!.map((c) => {
              const x = c.conexion;
              const conectado = x?.estado === "conectado";
              return (
                <li
                  key={c.comercioId}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{c.nombre}</span>
                      <Badge tone={x ? (TONO[x.estado] ?? "neutral") : "neutral"}>
                        {x ? (ETIQUETA[x.estado] ?? x.estado) : "Sin vincular"}
                      </Badge>
                      {conectado && x.entorno === "sandbox" && <Badge tone="warn">sandbox</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {conectado
                        ? `Cuenta ${x.cuentaExternaId ?? "—"} · vinculada ${x.conectadoAt ? formatDateTime(x.conectadoAt) : "—"}`
                        : x?.estado === "revocado" && x.revocadoAt
                          ? `Desvinculada ${formatDateTime(x.revocadoAt)}`
                          : "Todavía no cobra con tarjeta"}
                    </p>
                    {x?.ultimoError && !conectado && (
                      <p className="mt-0.5 text-xs text-danger-600">
                        Último error: {x.ultimoError}
                      </p>
                    )}
                  </div>
                  {conectado ? (
                    <BtnOutline disabled={desvincular.isPending} onClick={() => setBaja(c)}>
                      Desvincular
                    </BtnOutline>
                  ) : (
                    <BtnPrimary disabled={vincular.isPending} onClick={() => iniciar(c)}>
                      {vincular.isPending ? "Abriendo…" : "Vincular"}
                    </BtnPrimary>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={!!baja}
        onClose={() => setBaja(null)}
        title="Desvincular cobros con tarjeta"
        variant="danger"
        confirmLabel="Desvincular"
        closeOnConfirm
        message={`Se borran las claves de ${baja?.nombre ?? "el comercio"} y la plataforma deja de cobrar en su cuenta: sus links de pago, suscripciones y terminales dejan de cobrar hasta volver a vincularla.`}
        onConfirm={() =>
          desvincular.mutateAsync(baja?.comercioId ?? "").then(
            () => {
              toast.success("Comercio desvinculado");
            },
            (e) => {
              avisar(e);
              throw e;
            },
          )
        }
      />
    </SectionCard>
  );
}
