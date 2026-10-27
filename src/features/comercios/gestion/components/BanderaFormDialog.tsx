import { brand } from "@/brand/brand";
import { Input, Label } from "@/components/portal-shell";
import type { ComercioBanderaEstado } from "@/lib/api/types";
import { FormDialog } from "@/shared/ui/form-dialog";
import { formatPercent } from "@/shared/format";
import type { BanderasComercioState } from "../hooks/useBanderasComercio";
import { esDecimalEnEdicion } from "../utils";

const SELECT = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm";

/** Alta / edición de una bandera del comercio. */
export function BanderaFormDialog({ s }: { s: BanderasComercioState }) {
  const { editing } = s;
  return (
    <FormDialog
      open
      onClose={s.closeForm}
      title={editing ? "Editar bandera" : "Agregar bandera"}
      description={
        editing ? `Editando ${editing.bandera}` : "Seleccioná una bandera o ingresá texto libre."
      }
      onSubmit={s.guardar}
      submitLabel={s.saving ? "Guardando…" : editing ? "Guardar" : "Agregar"}
      isSubmitting={s.saving}
    >
      <div className="space-y-4">
        <div>
          <Label>Bandera</Label>
          <select
            value={s.formBanderaId}
            onChange={(e) => {
              const selected = s.banderasCatalogo.find((b) => b.id === e.target.value);
              s.setFormBanderaId(e.target.value);
              s.setFormMetodoKey(selected?.metodoKey || "");
            }}
            className={SELECT}
          >
            <option value="">Seleccionar…</option>
            {s.banderasCatalogo.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
            <option value="__custom__">Otra (texto libre)…</option>
          </select>
          {s.formBanderaId === "__custom__" && (
            <Input
              value={s.formBanderaCustom}
              onChange={(e) => s.setFormBanderaCustom(e.target.value)}
              placeholder="Ej: Naranja, Tarjeta Propia…"
              className="mt-2"
            />
          )}
        </div>
        <div>
          <Label>Clave método pago</Label>
          <Input
            value={s.formMetodoKey}
            onChange={(e) => s.setFormMetodoKey(e.target.value)}
            placeholder="Ej: visa-cred, mc-deb, amex…"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Clave única del método de pago (visa-cred, mc-deb, amex, naranja, transferencia, qr)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>% Comisión {brand.name}</Label>
            <Input
              value={s.formComisionPropia}
              onChange={(e) => {
                if (esDecimalEnEdicion(e.target.value)) s.setFormComisionPropia(e.target.value);
              }}
              placeholder="0.00"
              className="font-mono"
              inputMode="decimal"
            />
          </div>
          <div>
            <Label>% Comisión PayWay</Label>
            <Input
              value={s.formPayway}
              onChange={(e) => {
                if (esDecimalEnEdicion(e.target.value)) s.setFormPayway(e.target.value);
              }}
              placeholder="0.00"
              className="font-mono"
              inputMode="decimal"
            />
          </div>
        </div>
        <div className="rounded-md bg-muted px-3 py-2 flex justify-between text-sm">
          <span className="text-muted-foreground">% Neto (autocalculado)</span>
          <span className="font-mono font-semibold">{formatPercent(s.neto)}</span>
        </div>
        <div>
          <Label>Estado</Label>
          <select
            value={s.formEstado}
            onChange={(e) => s.setFormEstado(e.target.value as ComercioBanderaEstado)}
            className={SELECT}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>
    </FormDialog>
  );
}
