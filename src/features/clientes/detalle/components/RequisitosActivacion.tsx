import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";

/** Aviso de requisitos según el estado (homologado). */
export function RequisitosActivacion({
  cliente,
  data,
}: {
  cliente: Cliente;
  data: ClienteDetalleData;
}) {
  const { subcuentasQuery, comisionesRealesQuery } = data;
  const norm = (cliente.estado as string).toLowerCase();
  if (norm === "preactivado") {
    const hasCbu =
      Boolean(cliente.cbu && !cliente.cbuCancelado) || (subcuentasQuery.data?.length ?? 0) > 0;
    const hasCom = (comisionesRealesQuery.data?.rows.length ?? 0) > 0;
    return (
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">Requisitos para activar</p>
        <ul className="mt-1 list-disc pl-5">
          <li>CVU: {hasCbu ? "✓ cargado" : "✗ pendiente"}</li>
          <li>Comisión: {hasCom ? "✓ cargada" : "✗ pendiente"}</li>
        </ul>
        {!hasCbu && <p className="mt-1 text-xs">Cargar CVU en la pestaña Subcuentas y CVUs.</p>}
        {!hasCom && (
          <p className="mt-1 text-xs">Cargar comisión en Admin → Usuarios → Comisiones.</p>
        )}
      </div>
    );
  }
  if (norm === "pendiente_verificacion") {
    return (
      <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Usuario pendiente de verificación de email. Debe verificar su correo para pasar a
        Registrado.
      </div>
    );
  }
  if (norm === "deshabilitado") {
    return (
      <div className="mt-4 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        Usuario deshabilitado — CVU cancelado. Historial conservado para auditoría BCRA.
      </div>
    );
  }
  return null;
}
