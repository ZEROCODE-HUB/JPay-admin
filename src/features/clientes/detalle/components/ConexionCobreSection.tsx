import { useState } from "react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Input, Label } from "@/components/portal-shell";
import { useConexionCobreCliente } from "@/hooks/useConexionesCliente";
import { formatDateTime } from "@/shared/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { InfoTip } from "@/shared/ui/info-tip";
import { SectionCard } from "./SectionCard";
import { brand } from "@/brand/brand";

const avisar = (e: unknown) => toast.error((e as Error).message);

/**
 * Cuenta Cobre propia del cliente, conectada en un paso por el administrador: con su User ID y su
 * clave de API de Cobre se valida la cuenta, se guardan las claves cifradas (Vault), se vincula su
 * Cobre Balance (la CLABE pasa a ser su cuenta SPEI en la plataforma) y se suscriben los avisos de
 * movimientos. El cliente no carga claves en su portal: pide la activación y se hace aquí.
 */
export function ConexionCobreSection({ legajo }: { legajo: string }) {
  const { conexion, conectar, desconectar, dolares } = useConexionCobreCliente(legajo);
  const [usdAbierto, setUsdAbierto] = useState(false);
  const [accGlobal, setAccGlobal] = useState("");
  const [accUsa, setAccUsa] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [confirmar, setConfirmar] = useState(false);

  const c = conexion.data;
  const clabe = c?.cuenta?.clabe ?? null;

  const enviar = () => {
    if (!userId.trim() || !secret.trim()) return toast.error("Escribe el User ID y la clave");
    conectar.mutate(
      { legajo, userId: userId.trim(), secret: secret.trim() },
      {
        onSuccess: (r) => {
          setSecret("");
          setAbierto(false);
          setFaltantes(r.faltantes ?? []);
          if (r.faltantes?.length) toast.warning("Cuenta conectada, pero faltaron algunos pasos");
          else toast.success("Cuenta Cobre conectada");
        },
        onError: avisar,
      },
    );
  };

  return (
    <SectionCard
      title={
        <>
          Cuenta Cobre propia del cliente{" "}
          <InfoTip>
            Para un cliente que ya tiene su cuenta en Cobre: se conecta con su User ID y su clave de
            API. La otra opción es darlo de alta como Subcliente de {brand.name} (más abajo). Un
            cliente usa una de las dos, no ambas.
          </InfoTip>
        </>
      }
    >
      {conexion.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : conexion.error || !c ? (
        <p className="text-sm text-danger-600">
          {(conexion.error as Error | null)?.message ?? "No se pudo leer la conexión"}
        </p>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={c.conectada ? "success" : "neutral"}>
                {c.conectada ? "Conectada" : "Sin conectar"}
              </Badge>
              <Badge tone="neutral">{c.modo}</Badge>
              {c.conectada && (
                <span className="text-xs text-muted-foreground">
                  user_id <span className="font-mono">{c.user_id}</span>
                  {c.conectada_at && <> · desde {formatDateTime(c.conectada_at)}</>}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <BtnOutline onClick={() => setAbierto((v) => !v)}>
                {c.conectada ? "Actualizar claves" : "Conectar cuenta"}
              </BtnOutline>
              {c.conectada && (
                <BtnOutline disabled={desconectar.isPending} onClick={() => setConfirmar(true)}>
                  Desconectar
                </BtnOutline>
              )}
            </div>
          </div>

          {c.conectada && (
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">CLABE</dt>
                <dd className="font-mono">{clabe ?? "Pendiente"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cobre Balance</dt>
                <dd className="font-mono text-xs break-all">
                  {c.cuenta?.cuenta_externa_id ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Avisos de movimientos</dt>
                <dd>{c.avisos ? "Activos" : "Pendientes"}</dd>
              </div>
            </dl>
          )}

          {c.conectada && (
            <div className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    Dólares en su cuenta{" "}
                    <InfoTip>
                      Para convertir pesos a dólares y pagar por Fedwire o SWIFT desde su propia
                      cuenta de Cobre. Cobre tiene que habilitarle los Balances Global y USA, el
                      cruce MXN/USD y los pagos USD. Los dólares quedan en su cuenta, no en la de{" "}
                      {brand.name}.
                    </InfoTip>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.dolares?.global && c.dolares?.usa
                      ? "Activos"
                      : "Sin activar: el cliente solo opera en pesos"}
                  </p>
                </div>
                <BtnOutline onClick={() => setUsdAbierto((v) => !v)}>
                  {c.dolares?.global && c.dolares?.usa ? "Cambiar Balances" : "Activar dólares"}
                </BtnOutline>
              </div>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Balance Global (USD)</dt>
                  <dd className="font-mono break-all">{c.dolares?.global ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Balance USA</dt>
                  <dd className="font-mono break-all">{c.dolares?.usa ?? "—"}</dd>
                </div>
              </dl>
              {usdAbierto && (
                <form
                  className="mt-3 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    dolares.mutate(
                      { legajo, global: accGlobal.trim(), usa: accUsa.trim() },
                      {
                        onSuccess: (r) => {
                          setUsdAbierto(false);
                          if (r.dolares?.global && r.dolares?.usa)
                            toast.success("Dólares activos en su cuenta");
                          else toast.warning("No se pudieron vincular los dos Balances");
                        },
                        onError: avisar,
                      },
                    );
                  }}
                >
                  <p className="text-xs text-muted-foreground">
                    Deja los campos vacíos para usar los Balances que ya tenga en Cobre o crearlos.
                    Si ya sabes cuáles son, escribe sus IDs (acc_…).
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cc-global">Balance Global (opcional)</Label>
                      <Input
                        id="cc-global"
                        className="mt-1 font-mono"
                        placeholder="acc_…"
                        value={accGlobal}
                        onChange={(e) => setAccGlobal(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cc-usa">Balance USA (opcional)</Label>
                      <Input
                        id="cc-usa"
                        className="mt-1 font-mono"
                        placeholder="acc_…"
                        value={accUsa}
                        onChange={(e) => setAccUsa(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <BtnOutline type="button" onClick={() => setUsdAbierto(false)}>
                      Cancelar
                    </BtnOutline>
                    <BtnPrimary type="submit" disabled={dolares.isPending}>
                      {dolares.isPending ? "Activando…" : "Activar"}
                    </BtnPrimary>
                  </div>
                </form>
              )}
            </div>
          )}

          {c.conectada && (faltantes.length > 0 || !clabe || !c.avisos) && (
            <div className="rounded-md border border-warning bg-warning-bg p-3">
              <p className="font-medium">Falta completar la conexión</p>
              {faltantes.length > 0 ? (
                <ul className="mt-1 list-disc pl-5">
                  {faltantes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1">
                  {!clabe ? "Todavía no hay CLABE de Cobre. " : ""}
                  {!c.avisos ? "Los avisos de movimientos no están activos. " : ""}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Usa «Actualizar claves» para reintentar. Si sigue igual, hay que pedir a Cobre que
                active Balances México en esa cuenta.
              </p>
            </div>
          )}

          {abierto && (
            <form
              className="rounded-md border border-border p-4"
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
            >
              <p className="text-xs text-muted-foreground">
                Están en el portal de Cobre del cliente, en la sección de claves de API. Se prueban
                con Cobre antes de guardarlas; quedan cifradas y no se vuelven a mostrar.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="cc-user">User ID (cli_…)</Label>
                  <Input
                    id="cc-user"
                    className="mt-1 font-mono"
                    autoComplete="off"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cc-secret">Clave secreta</Label>
                  <Input
                    id="cc-secret"
                    className="mt-1"
                    type="password"
                    autoComplete="new-password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <BtnOutline type="button" onClick={() => setAbierto(false)}>
                  Cancelar
                </BtnOutline>
                <BtnPrimary type="submit" disabled={conectar.isPending}>
                  {conectar.isPending ? "Conectando…" : "Conectar"}
                </BtnPrimary>
              </div>
            </form>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title="Desconectar la cuenta Cobre del cliente"
        variant="danger"
        confirmLabel="Desconectar"
        closeOnConfirm
        message={`${brand.name} deja de usar la cuenta Cobre del cliente: se borran las claves guardadas y su CLABE deja de recibir depósitos en la plataforma. El dinero sigue en su cuenta de Cobre.`}
        onConfirm={() =>
          desconectar.mutateAsync().then(
            () => {
              setFaltantes([]);
              toast.success("Cuenta Cobre desconectada");
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
