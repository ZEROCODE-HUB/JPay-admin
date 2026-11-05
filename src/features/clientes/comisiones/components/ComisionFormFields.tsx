import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input, Label } from "@/components/portal-shell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useClientesForSelect } from "@/hooks/useComercios";
import { listSubcuentas } from "@/lib/api/subcuentas";
import type { EstadoComision, ModalidadComision, TipoOperacion } from "@/lib/api/types";
import {
  etiquetaTipoComision,
  IVA_POR_DEFECTO,
  TIPOS_COMISION_USUARIOS,
  type ComisionDraft,
} from "../utils";

const SELECT_CLS =
  "w-full h-10 px-3 rounded-md border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring";

/** Campos del formulario de comisión: cliente, subcuenta, tipo, modalidad, valores y estado. */
export function ComisionFormFields({
  draft,
  onChange,
}: {
  draft: ComisionDraft;
  onChange: (d: ComisionDraft) => void;
}) {
  const [searchInput, setSearchInput] = useState(draft.correo);
  const debounced = useDebouncedValue(searchInput, 350);
  const { data: clientesOpt } = useClientesForSelect(debounced || undefined);
  const [open, setOpen] = useState(false);

  // Subcuentas del cliente elegido: la comisión se puede atar a una en particular.
  const { data: subcuentas, isLoading: cargandoSubs } = useQuery({
    queryKey: ["subcuentas", draft.legajo],
    queryFn: () => listSubcuentas(draft.legajo),
    enabled: Boolean(draft.legajo),
  });

  useEffect(() => {
    if (draft.correo && draft.correo !== searchInput) setSearchInput(draft.correo);
  }, [draft.correo]);

  return (
    <>
      <div className="relative">
        <Label htmlFor="com-correo">Email del cliente</Label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            id="com-correo"
            value={searchInput}
            onChange={(e) => {
              const v = e.target.value;
              setSearchInput(v);
              // Si cambia el email, la selección de cliente/subcuenta anterior deja de valer.
              onChange({ ...draft, correo: v, legajo: "", subcuentaId: null });
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar por email, número de cliente o nombre..."
            className="pl-9"
            autoComplete="off"
          />
        </div>
        {open && (clientesOpt?.length ?? 0) > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-card shadow-lg max-h-60 overflow-auto">
            {(clientesOpt ?? []).map((c) => (
              <button
                key={c.legajo}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchInput(c.correo);
                  onChange({
                    ...draft,
                    correo: c.correo,
                    legajo: c.legajo,
                    subcuentaId: null,
                    rfc: c.taxId ?? "—",
                    tipoPersona:
                      (c.tipoPersona as ComisionDraft["tipoPersona"]) ?? draft.tipoPersona,
                    porcentajeImpuesto: IVA_POR_DEFECTO,
                  } as ComisionDraft);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex flex-col"
              >
                <span className="font-medium">{c.correo}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {c.legajo} · {c.nombre}
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1">
          Búsqueda rápida (server-side, 20 resultados). Selecciona un usuario existente de la lista.
        </p>
      </div>
      <div>
        <Label htmlFor="com-subcuenta">Subcuenta / cuenta</Label>
        <select
          id="com-subcuenta"
          className={SELECT_CLS}
          value={draft.subcuentaId ?? ""}
          onChange={(e) => onChange({ ...draft, subcuentaId: e.target.value || null })}
          disabled={!draft.legajo}
        >
          <option value="">
            {draft.legajo ? "Toda la cuenta (respaldo del cliente)" : "Elige primero un cliente…"}
          </option>
          {(subcuentas ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {`${s.nombre} ${s.apellido}`.trim() || s.email} — {s.cbu ?? "sin CLABE"}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground mt-1">
          {cargandoSubs
            ? "Cargando subcuentas…"
            : "La comisión de la subcuenta manda sobre la del cliente. Las transferencias entre subcuentas del mismo cliente no pagan comisión ni IVA."}
        </p>
      </div>
      <div>
        <Label htmlFor="com-rfc">RFC</Label>
        <Input id="com-rfc" value={draft.rfc} disabled className="font-mono" />
        <p className="text-[11px] text-muted-foreground mt-1">Se completa al elegir el cliente.</p>
      </div>
      <div>
        <Label htmlFor="com-operacion">Tipo de operación</Label>
        <select
          id="com-operacion"
          className={SELECT_CLS}
          value={draft.tipo}
          onChange={(e) => onChange({ ...draft, tipo: e.target.value as TipoOperacion })}
        >
          {TIPOS_COMISION_USUARIOS.map((t) => (
            <option key={t} value={t}>
              {etiquetaTipoComision(t)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="com-modalidad">Modalidad</Label>
        <select
          id="com-modalidad"
          className={SELECT_CLS}
          value={draft.modalidad}
          onChange={(e) => onChange({ ...draft, modalidad: e.target.value as ModalidadComision })}
        >
          <option>Porcentaje</option>
          <option>Fijo</option>
        </select>
      </div>
      {draft.modalidad === "Porcentaje" ? (
        <div>
          <Label htmlFor="com-pct">% Comisión</Label>
          <Input
            id="com-pct"
            type="number"
            step="0.01"
            min={0}
            value={draft.porcentaje ?? ""}
            onChange={(e) =>
              onChange({
                ...draft,
                porcentaje: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="Ej: 1"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="com-fijo">Monto fijo por transacción</Label>
          <Input
            id="com-fijo"
            type="number"
            step="0.01"
            min={0}
            value={draft.montoFijo ?? ""}
            onChange={(e) =>
              onChange({
                ...draft,
                montoFijo: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="Ej: 100"
          />
        </div>
      )}
      <div>
        <Label htmlFor="com-imp">% Impuesto (IVA sobre la comisión)</Label>
        <Input
          id="com-imp"
          type="number"
          step="0.01"
          min={0}
          value={draft.porcentajeImpuesto}
          onChange={(e) => onChange({ ...draft, porcentajeImpuesto: Number(e.target.value) || 0 })}
          placeholder="Ej: 21"
        />
      </div>
      <div>
        <Label htmlFor="com-estado">Estado</Label>
        <select
          id="com-estado"
          className={SELECT_CLS}
          value={draft.estado}
          onChange={(e) => onChange({ ...draft, estado: e.target.value as EstadoComision })}
        >
          <option>Habilitado</option>
          <option>Deshabilitado</option>
        </select>
        <p className="text-[11px] text-muted-foreground mt-1">
          Solo puede haber <strong>una Habilitada</strong> por subcuenta (o por cliente) y tipo (las
          deshabilitadas quedan como historial).
        </p>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="com-desc">Descripción</Label>
        <textarea
          id="com-desc"
          className="w-full h-24 px-3 py-2 rounded-md border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring resize-none"
          value={draft.descripcion}
          onChange={(e) => onChange({ ...draft, descripcion: e.target.value })}
          placeholder="Detalle de la comisión..."
        />
      </div>
    </>
  );
}
