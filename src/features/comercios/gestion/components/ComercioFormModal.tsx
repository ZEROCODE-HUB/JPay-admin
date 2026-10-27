import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Input, Label } from "@/components/portal-shell";
import { useClientesForSelect } from "@/hooks/useComercios";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  AdminUser,
  ClienteSelect,
  CodigoCategoria,
  Comercio,
  EstadoComercio,
  NivelComercio,
} from "@/lib/api/types";
import { ESTADOS_COMERCIO, NIVELES_COMERCIO } from "@/lib/api/types";
import { FormDialog } from "@/shared/ui/form-dialog";
import type { ComercioFormInput } from "../utils";
import { BanderasSection } from "./BanderasSection";
import { ClienteCombobox } from "./ClienteCombobox";

const SELECT =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

/**
 * Label con un icono "?" a la derecha. Al pasar el mouse muestra la ayuda
 * en lenguaje simple, pensada para usuarios no técnicos.
 */
function LabelAyuda({
  htmlFor,
  hint,
  children,
}: {
  htmlFor: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <span title={hint} className="cursor-help inline-flex shrink-0">
        <HelpCircle size={13} className="text-muted-foreground/70" />
      </span>
    </div>
  );
}

export function ComercioFormModal({
  comercio,
  clientes,
  categorias,
  adminUsers,
  onClose,
  onSave,
  isSaving,
}: {
  comercio: Comercio | null;
  clientes: ClienteSelect[];
  categorias: CodigoCategoria[];
  adminUsers: AdminUser[];
  onClose: () => void;
  onSave: (input: ComercioFormInput) => void;
  isSaving?: boolean;
}) {
  const [clienteLegajo, setClienteLegajo] = useState(comercio?.legajo ?? "");
  const [usuario, setUsuario] = useState(comercio?.usuario ?? "");
  const [nombreComercio, setNombreComercio] = useState(comercio?.nombreComercio ?? "");
  const [categoriaId, setCategoriaId] = useState(
    comercio?.categoriaId != null ? String(comercio.categoriaId) : "",
  );
  const [nivel, setNivel] = useState<NivelComercio>(comercio?.nivel ?? "Pequeño");
  const [estado, setEstado] = useState<EstadoComercio>(
    comercio?.estado ?? "Pendiente de aprobación",
  );
  const [ejecutivoId, setEjecutivoId] = useState(comercio?.ejecutivoResponsableId ?? "");
  const [siteId, setSiteId] = useState(comercio?.siteId ?? "");

  const clienteSeleccionado = clientes.find((c) => c.legajo === clienteLegajo) ?? null;

  // Combobox con búsqueda server-side (debounce 350ms, limit 20)
  const [clienteSearchInput, setClienteSearchInput] = useState("");
  const debouncedClienteSearch = useDebouncedValue(clienteSearchInput, 350);
  const { data: clientesFiltrados } = useClientesForSelect(
    comercio ? undefined : debouncedClienteSearch,
  );
  const clientesOptionsRaw = comercio ? clientes : (clientesFiltrados ?? clientes);
  const clientesOptions = [...(clientesOptionsRaw ?? [])].sort((a, b) =>
    (a.legajo ?? "").localeCompare(b.legajo ?? ""),
  );

  const guardar = () => {
    if (!clienteLegajo) return;
    onSave({
      clienteLegajo,
      usuario: usuario.trim() || (clienteSeleccionado?.correo ?? ""),
      nombreComercio: nombreComercio.trim() || null,
      categoriaId: categoriaId ? Number(categoriaId) : null,
      nivel,
      estado,
      ejecutivoResponsableId: ejecutivoId || null,
      siteId: siteId.trim() || null,
    });
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title={comercio ? "Editar comercio" : "Nuevo comercio"}
      description={
        comercio
          ? `Modificá los datos del comercio ${comercio.usuario}.`
          : "Asociá un cliente existente a un nuevo comercio."
      }
      onSubmit={guardar}
      submitLabel={isSaving ? "Guardando…" : comercio ? "Guardar cambios" : "Crear comercio"}
      isSubmitting={isSaving}
      size="xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <LabelAyuda
            htmlFor="gc-cliente"
            hint="El cliente se elige de la lista de clientes ya cargada. No se puede escribir uno nuevo a mano."
          >
            Cliente (legajo)
          </LabelAyuda>
          {comercio ? (
            <Input
              id="gc-cliente"
              value={`${clienteSeleccionado?.nombre ?? comercio.legajo} · ${comercio.legajo}`}
              disabled
            />
          ) : (
            <ClienteCombobox
              opciones={clientesOptions}
              busqueda={clienteSearchInput}
              hayBusqueda={!!debouncedClienteSearch}
              clienteLegajo={clienteLegajo}
              clienteSeleccionado={clienteSeleccionado}
              onBusquedaChange={setClienteSearchInput}
              onLimpiar={() => setClienteLegajo("")}
              onElegir={(c) => {
                setClienteLegajo(c.legajo);
                setClienteSearchInput(`${c.nombre} · ${c.legajo}`);
                setUsuario(c.correo);
              }}
            />
          )}
        </div>
        {clienteSeleccionado && (
          <div className="sm:col-span-2">
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Datos del cliente (solo lectura)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">CUIT / CUIL</span>
                  <Input
                    value={clienteSeleccionado.cuit ?? "—"}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Razón Social / Nombre</span>
                  <Input value={clienteSeleccionado.nombre} disabled className="text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="sm:col-span-2">
          <LabelAyuda
            htmlFor="gc-usuario"
            hint="Se completa solo con el correo del cliente elegido."
          >
            Usuario (email)
          </LabelAyuda>
          <Input
            id="gc-usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="email@dominio.com"
            disabled={!comercio && !!clienteSeleccionado}
          />
        </div>
        <div className="sm:col-span-2">
          <LabelAyuda
            htmlFor="gc-nombre-comercio"
            hint="Es el nombre que ve el cliente cuando paga con Link de Pago o QR."
          >
            Nombre del comercio
          </LabelAyuda>
          <Input
            id="gc-nombre-comercio"
            value={nombreComercio}
            onChange={(e) => setNombreComercio(e.target.value)}
            placeholder="Ej: Kiosco Central, Distribuidora Delta"
          />
        </div>
        <div className="sm:col-span-2">
          <LabelAyuda
            htmlFor="gc-site-id"
            hint="Es el número que Payway le asignó a este comercio (también llamado “site id”) para reconocer sus cobros y liquidaciones. Lo entrega el equipo de Payway al dar de alta el comercio."
          >
            Nro. de Establecimiento (Payway)
          </LabelAyuda>
          <Input
            id="gc-site-id"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            placeholder="Ej: 12345"
            className="font-mono"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="gc-categoria">Código de categoría</Label>
          <select
            id="gc-categoria"
            className={SELECT}
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.codigo} · {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="gc-nivel">Nivel</Label>
          <select
            id="gc-nivel"
            className={SELECT}
            value={nivel}
            onChange={(e) => setNivel(e.target.value as NivelComercio)}
          >
            {NIVELES_COMERCIO.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="gc-estado">Estado</Label>
          <select
            id="gc-estado"
            className={SELECT}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoComercio)}
          >
            {ESTADOS_COMERCIO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="gc-ejecutivo">Ejecutivo responsable</Label>
          <select
            id="gc-ejecutivo"
            className={SELECT}
            value={ejecutivoId}
            onChange={(e) => setEjecutivoId(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {adminUsers
              .filter((u) => u.activo)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} · {u.email}
                </option>
              ))}
          </select>
        </div>
      </div>

      {comercio && (
        <div className="mt-6 border-t border-border pt-5">
          <BanderasSection comercioId={comercio.id} />
        </div>
      )}
      {!comercio && (
        <p className="text-xs text-muted-foreground mt-4 border rounded-lg bg-muted/30 px-3 py-2">
          Las banderas se configuran luego de crear el comercio, desde el detalle o edición.
        </p>
      )}
    </FormDialog>
  );
}
