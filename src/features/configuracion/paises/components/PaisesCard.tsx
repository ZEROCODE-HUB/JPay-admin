import { useState } from "react";
import { toast } from "sonner";
import { Badge, BtnOutline, Card } from "@/components/portal-shell";
import { Toggle } from "@/features/alertas/parametros-alertas/components/Toggle";
import { usePaisesMutaciones } from "@/hooks/usePaises";
import type { Pais } from "@/lib/api/paises";
import { PAIS_INSTALACION } from "@/shared/pais";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { MODULOS, avisarError } from "../utils";

/** Países: datos de formato, activación y módulos de cada uno. */
export function PaisesCard({ paises }: { paises: Pais[] }) {
  const { actualizarPais, cambiarModulo, predeterminar } = usePaisesMutaciones();
  const [aPredeterminar, setAPredeterminar] = useState<Pais | null>(null);
  const instalacionBase = paises.find((p) => p.predeterminado)?.codigo;

  const cambiar = (p: Pais, cambios: Partial<Pick<Pais, "activo" | "modulos">>) =>
    actualizarPais.mutate({ codigo: p.codigo, cambios }, { onError: avisarError });

  return (
    <Card>
      <h3 className="font-semibold">Países</h3>
      <p className="text-xs text-muted-foreground mt-1">
        La interfaz usa el país de la instalación ({PAIS_INSTALACION}, campo `country` de
        brand.json); la base lo usa para los días hábiles y como país de los clientes nuevos.
      </p>
      {instalacionBase && instalacionBase !== PAIS_INSTALACION && (
        <p className="mt-2 text-xs font-medium text-danger-600">
          El país de la instalación en la base ({instalacionBase}) no coincide con el de la interfaz
          ({PAIS_INSTALACION}).
        </p>
      )}
      <div className="mt-4 space-y-4">
        {paises.map((p) => (
          <div key={p.codigo} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{p.nombre}</span>
                <span className="font-mono text-xs text-muted-foreground">{p.codigo}</span>
                {p.predeterminado && <Badge tone="success">Instalación</Badge>}
                {!p.activo && <Badge>Inactivo</Badge>}
              </div>
              <div className="flex items-center gap-3">
                {!p.predeterminado && (
                  <BtnOutline className="h-8 text-xs" onClick={() => setAPredeterminar(p)}>
                    Usar como instalación
                  </BtnOutline>
                )}
                <span className="text-xs text-muted-foreground">Activo</span>
                <Toggle
                  label={`Activar ${p.nombre}`}
                  enabled={p.activo}
                  onClick={() =>
                    p.predeterminado
                      ? toast.error("El país de la instalación no se puede desactivar")
                      : cambiar(p, { activo: !p.activo })
                  }
                />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <Dato k="Moneda" v={p.moneda} />
              <Dato k="Formato" v={p.locale} />
              <Dato k="Zona horaria" v={p.timezone} />
              <Dato k="Identificadores" v={p.taxIdTipos.join(", ")} />
              <Dato k="Cuenta · teléfono" v={`${p.cuentaBancariaTipo} · ${p.prefijoTelefono}`} />
            </dl>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(MODULOS).map(([clave, nombre]) => (
                <span key={clave} className="flex items-center gap-2 text-xs">
                  <Toggle
                    label={`${nombre} en ${p.nombre}`}
                    enabled={!!p.modulos[clave]}
                    onClick={() =>
                      cambiarModulo.mutate(
                        { codigo: p.codigo, modulo: clave, activo: !p.modulos[clave] },
                        { onError: avisarError },
                      )
                    }
                  />
                  {nombre}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!aPredeterminar}
        onClose={() => setAPredeterminar(null)}
        title="Cambiar el país de la instalación"
        message={`La base va a usar ${aPredeterminar?.nombre ?? ""} para los días hábiles y como país de los clientes nuevos. La interfaz sigue usando el país de brand.json hasta que se cambie y se vuelva a publicar.`}
        confirmLabel="Cambiar"
        closeOnConfirm
        onConfirm={async () => {
          if (!aPredeterminar) return;
          try {
            await predeterminar.mutateAsync(aPredeterminar.codigo);
            toast.success(`${aPredeterminar.nombre} es el país de la instalación`);
          } catch (e) {
            avisarError(e);
            throw e;
          }
        }}
      />
    </Card>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium mt-0.5">{v || "—"}</dd>
    </div>
  );
}
