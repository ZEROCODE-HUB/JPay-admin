import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BtnPrimary, Card, Input, Label } from "@/components/portal-shell";
import { ErrorCampo } from "@/features/alertas/parametros-alertas/components/Toggle";
import { usePaisesMutaciones } from "@/hooks/usePaises";
import type { CobroComision, ConfiguracionPagos, ModeloFondos } from "@/lib/api/paises";
import { formatDateTime, formatMoney, parseMonto } from "@/shared/format";
import {
  COBROS_COMISION,
  MODELOS_FONDOS,
  avisarError,
  calcularComision,
  validarConfiguracion,
} from "../utils";

const EJEMPLO = 1000;

/** Valores por defecto de cobro de un país/proveedor (cada comercio puede tener los suyos). */
export function ConfiguracionPagosCard({ config }: { config: ConfiguracionPagos }) {
  const { guardarConfiguracion } = usePaisesMutaciones();
  const [f, setF] = useState(config);
  // Campos numéricos como texto para poder tipear "2.5" sin que se reformatee.
  const [texto, setTexto] = useState(() => aTexto(config));
  useEffect(() => {
    setF(config);
    setTexto(aTexto(config));
  }, [config]);

  const actual: ConfiguracionPagos = {
    ...f,
    comisionPct: parseMonto(texto.comisionPct),
    comisionFija: parseMonto(texto.comisionFija),
    ivaComisionPct: parseMonto(texto.ivaComisionPct),
  };
  const errores = validarConfiguracion(actual);
  const valido = Object.keys(errores).length === 0;
  const ejemplo = valido ? calcularComision(actual, EJEMPLO) : null;

  const guardar = () =>
    guardarConfiguracion.mutate(actual, {
      onSuccess: () => toast.success("Configuración guardada"),
      onError: avisarError,
    });

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">
          Cobros · {config.proveedor} · {config.pais}
        </h3>
        <span className="text-xs text-muted-foreground">
          Actualizado {formatDateTime(config.updatedAt)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Valores por defecto; cada comercio puede tener los suyos en su conexión con el proveedor.
      </p>
      <div className="mt-4 grid md:grid-cols-2 gap-5">
        <Opciones
          titulo="¿Quién recibe el dinero?"
          valor={f.modeloFondos}
          opciones={MODELOS_FONDOS}
          onChange={(v) => setF({ ...f, modeloFondos: v as ModeloFondos })}
        />
        <div>
          <Opciones
            titulo="¿Cómo se cobra la comisión?"
            valor={f.cobroComision}
            opciones={COBROS_COMISION}
            onChange={(v) => setF({ ...f, cobroComision: v as CobroComision })}
          />
          <ErrorCampo msg={errores.cobroComision} />
        </div>
      </div>
      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        {(
          [
            ["comisionPct", "Comisión (%)"],
            ["comisionFija", "Comisión fija por cobro"],
            ["ivaComisionPct", "IVA sobre la comisión (%)"],
          ] as const
        ).map(([campo, etiqueta]) => (
          <div key={campo}>
            <Label htmlFor={`cfg-${campo}`}>{etiqueta}</Label>
            <Input
              id={`cfg-${campo}`}
              inputMode="decimal"
              value={texto[campo]}
              onChange={(e) => setTexto({ ...texto, [campo]: e.target.value })}
            />
            <ErrorCampo msg={errores[campo]} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {ejemplo
            ? `Ejemplo: en un cobro de ${formatMoney(EJEMPLO)} la comisión es ${formatMoney(ejemplo.comision)} + IVA ${formatMoney(ejemplo.iva)} = ${formatMoney(ejemplo.total)}.`
            : "Corregí los campos marcados para ver el ejemplo."}
        </p>
        <BtnPrimary onClick={guardar} disabled={!valido || guardarConfiguracion.isPending}>
          {guardarConfiguracion.isPending ? "Guardando…" : "Guardar"}
        </BtnPrimary>
      </div>
    </Card>
  );
}

const aTexto = (c: ConfiguracionPagos) => ({
  comisionPct: String(c.comisionPct),
  comisionFija: String(c.comisionFija),
  ivaComisionPct: String(c.ivaComisionPct),
});

function Opciones({
  titulo,
  valor,
  opciones,
  onChange,
}: {
  titulo: string;
  valor: string;
  opciones: Record<string, { label: string; detalle: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold mb-2">{titulo}</legend>
      <div className="space-y-2">
        {Object.entries(opciones).map(([clave, o]) => (
          <label
            key={clave}
            className={`flex gap-3 rounded-lg border p-3 cursor-pointer text-sm ${
              valor === clave ? "border-secondary bg-secondary/5" : "border-border"
            }`}
          >
            <input
              type="radio"
              className="mt-1"
              checked={valor === clave}
              onChange={() => onChange(clave)}
            />
            <span>
              <span className="font-medium block">{o.label}</span>
              <span className="text-xs text-muted-foreground">{o.detalle}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
