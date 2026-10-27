import { Input, Label } from "@/components/portal-shell";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { DebitosCreditosState } from "../hooks/useDebitosCreditos";
import type { DireccionForm } from "../utils";

const SELECT_CLS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/** Alta manual de una excepción débitos/créditos. */
export function AltaExcepcionModal({ s }: { s: DebitosCreditosState }) {
  const { alta, setAlta } = s;
  return (
    <FormDialog
      open
      onClose={() => s.setShowAlta(false)}
      title="Nueva excepción Débitos/Créditos"
      description="La dirección 'Ambos' crea dos registros: uno para Entrantes y otro para Salientes."
      onSubmit={s.guardarAlta}
      submitLabel={s.altaGuardando ? "Guardando…" : "Crear excepción"}
    >
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold">Tasa fija: 0,6% + 0,6% = 1,2% total</p>
        <p className="text-xs text-blue-700 mt-1">Este impuesto se presenta una vez por semana.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="ex-email">Email</Label>
          <Input
            id="ex-email"
            value={alta.email}
            onChange={(e) => setAlta({ ...alta, email: e.target.value })}
            placeholder="usuario@dominio.com"
          />
        </div>
        <div>
          <Label htmlFor="ex-cuit">CUIT</Label>
          <Input
            id="ex-cuit"
            value={alta.cuit}
            onChange={(e) => setAlta({ ...alta, cuit: e.target.value })}
            placeholder="20111111111"
            inputMode="numeric"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            11 dígitos, sin guiones ni puntos.
          </p>
        </div>
        <div>
          <Label htmlFor="ex-direccion">Dirección</Label>
          <select
            id="ex-direccion"
            className={SELECT_CLS}
            value={alta.direccion}
            onChange={(e) => setAlta({ ...alta, direccion: e.target.value as DireccionForm })}
          >
            <option value="Ambos">Ambos</option>
            <option value="Entrantes">Entrantes</option>
            <option value="Salientes">Salientes</option>
          </select>
          {alta.direccion === "Ambos" && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Se crearán 2 registros (uno por dirección).
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ex-autorizacion">Código de autorización (opcional)</Label>
          <Input
            id="ex-autorizacion"
            value={alta.autorizacion}
            onChange={(e) => setAlta({ ...alta, autorizacion: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ex-motivo">Motivo</Label>
          <Input
            id="ex-motivo"
            value={alta.motivo}
            onChange={(e) => setAlta({ ...alta, motivo: e.target.value })}
            placeholder="Ej: Exento por convenio"
          />
        </div>
        <div>
          <Label htmlFor="ex-desde">Vigencia desde</Label>
          <Input
            id="ex-desde"
            type="date"
            value={alta.desde}
            onChange={(e) => setAlta({ ...alta, desde: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground mt-1">Presentación semanal.</p>
        </div>
        <div>
          <Label htmlFor="ex-hasta">Vigencia hasta (opcional)</Label>
          <Input
            id="ex-hasta"
            type="date"
            value={alta.hasta}
            onChange={(e) => setAlta({ ...alta, hasta: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground mt-1">Presentación semanal.</p>
        </div>
        <div>
          <Label htmlFor="ex-impuesto">Impuesto vinculado (opcional)</Label>
          <select
            id="ex-impuesto"
            className={SELECT_CLS}
            value={alta.impuesto_id}
            onChange={(e) => setAlta({ ...alta, impuesto_id: e.target.value })}
          >
            <option value="">Sin impuesto específico</option>
            {s.impuestos.map((imp) => (
              <option key={imp.id} value={imp.id}>
                {imp.codigo} · {imp.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ex-archivo">URL del certificado (opcional)</Label>
          <Input
            id="ex-archivo"
            value={alta.archivo_certificado}
            onChange={(e) => setAlta({ ...alta, archivo_certificado: e.target.value })}
            placeholder="https://..."
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Link al certificado de exención o convenio.
          </p>
        </div>
      </div>
      {!s.altaValido && (
        <p className="text-xs text-muted-foreground mt-2">
          Completá email válido, CUIT de 11 dígitos y el motivo para poder guardar.
        </p>
      )}
    </FormDialog>
  );
}
