import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Card, Input, Label } from "@/components/portal-shell";
import { useCorreo } from "@/hooks/useCorreo";
import { formatDateTime } from "@/shared/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { InfoTip } from "@/shared/ui/info-tip";
import { avisarError } from "../utils";
import { brand } from "@/brand/brand";

/**
 * Correo saliente por Resend. Con pegar la clave de API alcanza: se valida contra Resend, se
 * guarda cifrada (Vault) y, si la cuenta tiene un dominio verificado, se propone el remitente.
 * De aquí salen el correo de verificación del registro, el código de las transferencias y el aviso
 * al equipo cuando un cliente pide la activación de un servicio.
 */
export function CorreoCard() {
  const { estado, guardar, quitarClave, probar } = useCorreo();
  const e = estado.data;
  const [clave, setClave] = useState("");
  const [remitente, setRemitente] = useState("");
  const [destino, setDestino] = useState("");
  const [para, setPara] = useState("");
  const [confirmar, setConfirmar] = useState(false);

  // Los campos siguen a lo guardado (el remitente de pruebas no se muestra como si fuera propio).
  useEffect(() => {
    if (!e) return;
    setRemitente(e.remitente_de_prueba ? "" : e.remitente);
    setDestino(e.destino ?? "");
  }, [e]);

  // Solo se manda lo que cambió: un remitente vacío sin tocar deja que el servidor proponga el
  // del dominio verificado en Resend.
  const remitenteGuardado = e?.remitente_de_prueba ? "" : (e?.remitente ?? "");
  const destinoGuardado = e?.destino ?? "";
  const guardarTodo = () =>
    guardar.mutate(
      {
        ...(clave.trim() ? { clave: clave.trim() } : {}),
        ...(!e?.remitente_fijo && remitente.trim() !== remitenteGuardado
          ? { remitente: remitente.trim() }
          : {}),
        ...(!e?.destino_fijo && destino.trim() !== destinoGuardado
          ? { destino: destino.trim() }
          : {}),
      },
      {
        onSuccess: (r) => {
          setClave("");
          const dominios = r.dominios_verificados ?? [];
          toast.success(
            dominios.length
              ? `Guardado. Dominio verificado en Resend: ${dominios.join(", ")}`
              : "Configuración de correo guardada",
          );
        },
        onError: avisarError,
      },
    );

  const enviarPrueba = () =>
    probar.mutate(para.trim() || undefined, {
      onSuccess: (r) =>
        r.prueba?.ok
          ? toast.success(r.prueba.detalle)
          : toast.error(r.prueba?.detalle ?? "La prueba falló"),
      onError: avisarError,
    });

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Correo (Resend)
            {e && (
              <Badge tone={e.configurado ? "success" : "warn"}>
                {e.configurado ? "Conectado" : "Modo demo"}
              </Badge>
            )}
            <InfoTip>
              Correos que envía {brand.name}: verificación del correo al registrarse, código de
              confirmación de las transferencias y aviso al equipo cuando un cliente pide la
              activación de un servicio. Sin clave no se envía nada (modo demo: el enlace o el
              código se muestran en pantalla).
            </InfoTip>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {e?.configurado
              ? `Clave terminada en ${e.pista ?? "····"}${e.origen_clave === "entorno" ? " (secreto RESEND_API_KEY de las funciones)" : " (guardada cifrada en Vault)"}.`
              : "Pega la clave de API de Resend para empezar a enviar correos."}
            {e?.actualizado?.at &&
              ` Último cambio ${formatDateTime(e.actualizado.at)}${e.actualizado.por ? ` por ${e.actualizado.por}` : ""}.`}
          </p>
        </div>
        {e?.configurado && e.origen_clave === "panel" && (
          <BtnOutline onClick={() => setConfirmar(true)} disabled={quitarClave.isPending}>
            Quitar clave
          </BtnOutline>
        )}
      </div>

      {estado.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : estado.error || !e ? (
        <p className="mt-4 text-sm text-danger-600">
          No se pudo leer la configuración del correo
          {estado.error ? `: ${(estado.error as Error).message}` : ""}.{" "}
          <button className="underline" onClick={() => void estado.refetch()}>
            Reintentar
          </button>
        </p>
      ) : (
        <>
          <form
            className="mt-4 grid gap-3 md:grid-cols-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              guardarTodo();
            }}
          >
            <div>
              <Label htmlFor="correo-clave">
                Clave de API de Resend {e.configurado && "(vacío = no cambia)"}
              </Label>
              <Input
                id="correo-clave"
                className="mt-1"
                type="password"
                autoComplete="new-password"
                placeholder="re_…"
                disabled={e.origen_clave === "entorno"}
                value={clave}
                onChange={(ev) => setClave(ev.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="correo-remitente">Remitente</Label>
              <Input
                id="correo-remitente"
                className="mt-1"
                placeholder={`${brand.name} <no-reply@tudominio.com>`}
                disabled={e.remitente_fijo}
                value={e.remitente_fijo ? e.remitente : remitente}
                onChange={(ev) => setRemitente(ev.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="correo-destino">Correo que recibe las solicitudes</Label>
              <Input
                id="correo-destino"
                className="mt-1"
                type="email"
                placeholder="soporte@tudominio.com"
                disabled={e.destino_fijo}
                value={e.destino_fijo ? (e.destino ?? "") : destino}
                onChange={(ev) => setDestino(ev.target.value)}
              />
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground max-w-2xl">
                El remitente tiene que ser de un dominio verificado en Resend. Si la cuenta ya tiene
                uno, se completa solo al guardar la clave.
              </p>
              <BtnPrimary type="submit" disabled={guardar.isPending}>
                {guardar.isPending ? "Validando…" : "Guardar"}
              </BtnPrimary>
            </div>
          </form>

          {e.configurado && e.remitente_de_prueba && (
            <p className="mt-3 rounded-md border border-warning bg-warning-bg p-3 text-sm">
              Todavía no hay un remitente propio: se usa el de pruebas de Resend (
              <span className="font-mono">onboarding@resend.dev</span>), que solo le escribe al
              correo dueño de la cuenta de Resend. Para escribirles a los clientes, verifica tu
              dominio en Resend y pon aquí un remitente de ese dominio.
            </p>
          )}
          {e.configurado && !e.destino && (
            <p className="mt-3 rounded-md border border-warning bg-warning-bg p-3 text-sm">
              Falta el correo que recibe las solicitudes: mientras tanto, las solicitudes de los
              clientes solo aparecen en Clientes › Solicitudes de contacto.
            </p>
          )}

          {e.configurado && (
            <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
              <div>
                <Label htmlFor="correo-prueba">Enviar un correo de prueba a</Label>
                <Input
                  id="correo-prueba"
                  className="mt-1 w-72"
                  type="email"
                  placeholder="Tu correo (por defecto)"
                  value={para}
                  onChange={(ev) => setPara(ev.target.value)}
                />
              </div>
              <BtnOutline onClick={enviarPrueba} disabled={probar.isPending}>
                {probar.isPending ? "Enviando…" : "Enviar prueba"}
              </BtnOutline>
              {e.probado && (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  {e.probado.ok ? (
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <XCircle size={14} className="mt-0.5 shrink-0 text-danger-600" />
                  )}
                  <span>
                    Última prueba {formatDateTime(e.probado.at)}:{" "}
                    {e.probado.detalle ?? "sin detalle"}
                  </span>
                </p>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title="Quitar la clave de Resend"
        variant="danger"
        confirmLabel="Quitar clave"
        closeOnConfirm
        message="El correo vuelve a modo demo: no se envían verificaciones, códigos ni avisos hasta cargar otra clave."
        onConfirm={() =>
          quitarClave.mutateAsync().then(
            () => {
              toast.success("Clave quitada");
            },
            (err) => {
              avisarError(err);
              throw err;
            },
          )
        }
      />
    </Card>
  );
}
