import { useState } from "react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, Input, Label } from "@/components/portal-shell";
import { useCobreCliente } from "@/hooks/useCobre";
import { formatDateTime } from "@/shared/format";
import { KybCobreForm } from "@/shared/ui/kyb-cobre";
import { SectionCard } from "./SectionCard";

const ALTA: Record<string, { label: string; tone: "success" | "warn" | "danger" | "neutral" }> = {
  enviando: { label: "Enviando", tone: "warn" },
  processing: { label: "En revisión (KYB)", tone: "warn" },
  approved: { label: "Aprobado", tone: "success" },
  rejected: { label: "Rechazado", tone: "danger" },
  failed: { label: "Con error", tone: "danger" },
  error_envio: { label: "No enviado", tone: "danger" },
};

const avisar = (e: unknown) => toast.error((e as Error).message);

/**
 * Cobre del cliente (Solution Design de JPAY): datos KYB, alta como Subcliente (onboarding FBO),
 * su Cobre Balance y CLABE y, como excepción, la instancia Cobre propia del comercio.
 */
export function CobreTab({ legajo }: { legajo: string }) {
  const c = useCobreCliente(legajo);
  const a = c.alta.data;
  const bloqueado = !!a?.alta && ["enviando", "processing", "approved"].includes(a.alta.estado);
  const [inst, setInst] = useState({
    userId: "",
    secret: "",
    claveWebhook: "",
    baseUrl: "",
    cuenta: "",
  });
  const instancia = c.instancia.data;

  return (
    <div className="space-y-4">
      <SectionCard title="Alta en Cobre (Subcliente)">
        {c.alta.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : c.alta.error ? (
          <p className="text-sm text-danger-600">{(c.alta.error as Error).message}</p>
        ) : a ? (
          <div className="space-y-3 text-sm">
            {a.instanciaPropia ? (
              <p>
                El comercio opera con{" "}
                <span className="font-medium">su propia instancia de Cobre</span>: no lleva
                Subcliente bajo JPay.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {a.alta ? (
                    <>
                      <Badge tone={ALTA[a.alta.estado]?.tone ?? "neutral"}>
                        {ALTA[a.alta.estado]?.label ?? a.alta.estado}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {a.alta.subcliente_externo_id ?? "sin id"} · enviado{" "}
                        {formatDateTime(a.alta.created_at)} · actualizado{" "}
                        {formatDateTime(a.alta.updated_at)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Todavía no se envió el alta.</span>
                  )}
                  <Badge tone="neutral">{a.modo}</Badge>
                </div>
                {a.alta?.motivo && <p className="text-danger-600">{a.alta.motivo}</p>}
                {a.alta?.revocado_at && (
                  <div className="rounded-md border border-danger-200 p-3">
                    <p className="text-danger-600">
                      Cobre rechazó el alta el {formatDateTime(a.alta.revocado_at)}, después de
                      aprobarla (revisión de cumplimiento)
                      {a.alta.revocado_motivo ? `: ${a.alta.revocado_motivo}` : ""}. Sus cuentas
                      siguen operando; consultá con el KAM qué hacer.
                    </p>
                    {!a.alta.revocado_revisado && (
                      <BtnOutline
                        className="mt-2"
                        disabled={c.revocadoRevisado.isPending}
                        onClick={() =>
                          c.revocadoRevisado.mutate(undefined, {
                            onSuccess: () => toast.success("Marcado como revisado"),
                            onError: avisar,
                          })
                        }
                      >
                        Marcar como revisado
                      </BtnOutline>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {!bloqueado && (
                    <BtnPrimary
                      disabled={a.faltan.length > 0 || c.enviar.isPending}
                      onClick={() =>
                        c.enviar.mutate(undefined, {
                          onSuccess: (r) => toast.success(`Alta enviada: ${r.resultado}`),
                          onError: avisar,
                        })
                      }
                    >
                      {c.enviar.isPending
                        ? "Enviando…"
                        : a.alta
                          ? "Enviar un alta nueva"
                          : "Enviar alta a Cobre"}
                    </BtnPrimary>
                  )}
                  {a.alta?.subcliente_externo_id && (
                    <BtnOutline
                      disabled={c.consultar.isPending}
                      onClick={() =>
                        c.consultar.mutate(undefined, {
                          onSuccess: (r) => toast.success(`Estado: ${r.resultado}`),
                          onError: avisar,
                        })
                      }
                    >
                      {c.consultar.isPending ? "Consultando…" : "Consultar estado"}
                    </BtnOutline>
                  )}
                </div>
              </>
            )}
            {a.cuenta && (
              <p>
                Cobre Balance <span className="font-mono">{a.cuenta.cuenta_externa_id}</span> ·
                CLABE <span className="font-mono">{a.cuenta.clabe ?? "—"}</span>{" "}
                <Badge tone={a.cuenta.conectividad === "connected" ? "success" : "warn"}>
                  {a.cuenta.conectividad ?? "sin dato"}
                </Badge>
              </p>
            )}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Datos KYB para Cobre">
        {c.kyb.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : c.kyb.error ? (
          <p className="text-sm text-danger-600">{(c.kyb.error as Error).message}</p>
        ) : c.kyb.data ? (
          <KybCobreForm
            key={c.kyb.dataUpdatedAt}
            empresa={c.kyb.data.empresa}
            personas={c.kyb.data.personas}
            faltan={bloqueado || a?.instanciaPropia ? [] : a?.faltan}
            soloLectura={bloqueado}
            onGuardarEmpresa={async (e) => {
              await c.guardarEmpresa(e);
              toast.success("Datos guardados");
            }}
            onGuardarPersona={async (p) => {
              await c.guardarPersona(p);
              toast.success("Persona agregada");
            }}
            onBorrarPersona={c.borrarPersona}
            onError={(m) => toast.error(m)}
          />
        ) : null}
      </SectionCard>

      <SectionCard title="Instancia Cobre propia (excepción)">
        <p className="text-xs text-muted-foreground">
          Solo para un comercio con contrato directo con Cobre: JPay opera su instancia con sus
          credenciales (quedan en Vault y no se vuelven a mostrar), sus avisos y su conciliación.
        </p>
        {instancia && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Badge tone="success">Activa</Badge>
            <span>
              user_id <span className="font-mono">{instancia.userId}</span>
              {instancia.baseUrl && <> · {instancia.baseUrl}</>} · avisos{" "}
              {instancia.suscripcionId ?? "sin suscripción"}
            </span>
            <BtnOutline
              disabled={c.suscribir.isPending}
              onClick={() =>
                c.suscribir.mutate(instancia.id, {
                  onSuccess: (r) => toast.success(`Suscripción ${r.suscripcion}`),
                  onError: avisar,
                })
              }
            >
              Suscribir avisos
            </BtnOutline>
            <BtnOutline
              disabled={c.desactivarInstancia.isPending}
              onClick={() =>
                c.desactivarInstancia.mutate(instancia.id, {
                  onSuccess: () =>
                    toast.success("Instancia desactivada: el comercio vuelve a la matriz"),
                  onError: avisar,
                })
              }
            >
              Desactivar
            </BtnOutline>
          </div>
        )}
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div>
            <Label htmlFor="ci-user">user_id</Label>
            <Input
              id="ci-user"
              className="mt-1"
              value={inst.userId}
              onChange={(e) => setInst({ ...inst, userId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ci-secret">secret {instancia && "(vacío = no cambia)"}</Label>
            <Input
              id="ci-secret"
              className="mt-1"
              type="password"
              autoComplete="off"
              value={inst.secret}
              onChange={(e) => setInst({ ...inst, secret: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ci-clave">event_signature_key de sus avisos</Label>
            <Input
              id="ci-clave"
              className="mt-1"
              type="password"
              autoComplete="off"
              value={inst.claveWebhook}
              onChange={(e) => setInst({ ...inst, claveWebhook: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ci-url">URL de la API (solo instancia de prueba)</Label>
            <Input
              id="ci-url"
              className="mt-1"
              placeholder="https://…"
              value={inst.baseUrl}
              onChange={(e) => setInst({ ...inst, baseUrl: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <BtnPrimary
            disabled={!inst.userId || c.guardarInstancia.isPending}
            onClick={() =>
              c.guardarInstancia.mutate(
                {
                  legajo,
                  userId: inst.userId,
                  secret: inst.secret,
                  claveWebhook: inst.claveWebhook,
                  baseUrl: inst.baseUrl,
                },
                {
                  onSuccess: (r) => {
                    toast.success(`Instancia guardada. Avisos en ${r.url_avisos}`);
                    setInst({ ...inst, secret: "", claveWebhook: "" });
                  },
                  onError: avisar,
                },
              )
            }
          >
            {c.guardarInstancia.isPending
              ? "Guardando…"
              : instancia
                ? "Actualizar instancia"
                : "Guardar instancia"}
          </BtnPrimary>
        </div>
        {instancia && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div>
              <Label htmlFor="ci-cuenta">Cobre Balance existente (acc_…, vacío = crear uno)</Label>
              <Input
                id="ci-cuenta"
                className="mt-1"
                value={inst.cuenta}
                onChange={(e) => setInst({ ...inst, cuenta: e.target.value.trim() })}
              />
            </div>
            <BtnOutline
              disabled={c.vincularBalance.isPending}
              onClick={() =>
                c.vincularBalance.mutate(
                  { id: instancia.id, cuenta: inst.cuenta },
                  {
                    onSuccess: () => toast.success("Balance vinculado al comercio"),
                    onError: avisar,
                  },
                )
              }
            >
              {c.vincularBalance.isPending ? "Vinculando…" : "Vincular Balance"}
            </BtnOutline>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
