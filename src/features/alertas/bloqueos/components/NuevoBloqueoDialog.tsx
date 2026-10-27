import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/ui/form-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useClientesForSelect } from "@/hooks/useComercios";
import { listSubcuentas } from "@/lib/api/subcuentas";
import { createManualBlock } from "@/lib/api/compliance";

export function NuevoBloqueoDialog({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const debounced = useDebouncedValue(busqueda, 300);
  const { data: opciones } = useClientesForSelect(debounced || undefined);
  const [abierto, setAbierto] = useState(false);
  const [cliente, setCliente] = useState<{ legajo: string; correo: string } | null>(null);
  const [subcuenta, setSubcuenta] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const subs = useQuery({
    queryKey: ["subcuentas", cliente?.legajo],
    queryFn: () => listSubcuentas(cliente!.legajo),
    enabled: Boolean(cliente?.legajo),
  });

  const inputCls =
    "w-full h-9 rounded-md border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

  const guardar = async () => {
    if (!cliente) {
      toast.error("Seleccioná un cliente de la lista");
      return;
    }
    if (motivo.trim().length < 5) {
      toast.error("Indicá el motivo del bloqueo (al menos 5 caracteres)");
      return;
    }
    setEnviando(true);
    try {
      await createManualBlock({
        legajo: cliente.legajo,
        subaccountId: subcuenta || null,
        reason: motivo.trim(),
      });
      toast.success("Bloqueo creado: ya impide los egresos del alcance elegido");
      onDone();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <FormDialog
      open
      onClose={onClose}
      title="Nuevo bloqueo manual"
      description="Suspende los egresos y retiene los depósitos del alcance elegido."
      onSubmit={() => void guardar()}
      submitLabel={enviando ? "Bloqueando…" : "Bloquear"}
    >
      <div className="space-y-3">
        <div className="relative">
          <label className="text-xs font-semibold mb-1.5 block">Cliente</label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setCliente(null);
                setSubcuenta("");
                setAbierto(true);
              }}
              onFocus={() => setAbierto(true)}
              onBlur={() => setTimeout(() => setAbierto(false), 150)}
              placeholder="Buscar por legajo, correo o nombre…"
              className={`${inputCls} pl-9`}
              autoComplete="off"
            />
          </div>
          {abierto && (opciones?.length ?? 0) > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-card shadow-lg max-h-56 overflow-auto">
              {(opciones ?? []).map((c) => (
                <button
                  key={c.legajo}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setBusqueda(c.correo);
                    setCliente({ legajo: c.legajo, correo: c.correo });
                    setAbierto(false);
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
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block">Alcance</label>
          <select
            value={subcuenta}
            onChange={(e) => setSubcuenta(e.target.value)}
            disabled={!cliente}
            className={inputCls}
          >
            <option value="">Toda la cuenta del cliente</option>
            {(subs.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                Subcuenta {s.nombre} — {s.cbu ?? "sin CVU"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block">Motivo</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 resize-none"
          />
        </div>
      </div>
    </FormDialog>
  );
}
