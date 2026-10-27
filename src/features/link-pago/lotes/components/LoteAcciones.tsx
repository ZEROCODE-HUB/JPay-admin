import { ArrowUpRight, CheckCircle2, Eye, FileUp, Gavel, Receipt } from "lucide-react";
import { ActionsDropdown, type ActionItem } from "@/components/actions-dropdown";
import type { LoteAcreditacion } from "@/lib/api/types";
import type { LotesAcciones } from "../hooks/useLotesAcciones";

const BTN = "h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1";
const BTN_OUTLINE = `${BTN} bg-card border text-foreground hover:bg-muted`;

function getActions(r: LoteAcreditacion, a: LotesAcciones): ActionItem[] {
  const items: ActionItem[] = [{ label: "Ver detalle", icon: Eye, onClick: () => a.setDetail(r) }];
  if (r.estado === "Programado") {
    items.push({
      label: "Subir CSV",
      icon: FileUp,
      disabled: !a.puedeGestionar,
      onClick: () => a.onSubirCsv(r),
    });
  }
  if (r.estado === "Pendiente") {
    items.push({
      label: "Acreditar",
      icon: ArrowUpRight,
      disabled: !a.puedeGestionar,
      onClick: () => a.onAcreditar(r),
    });
  }
  if (r.estado === "Contracargo") {
    items.push({
      label: "Ver Disputa",
      icon: Gavel,
      disabled: !a.puedeGestionar,
      onClick: () => a.abrirContracargo(r),
    });
  }
  return items;
}

/**
 * Botón principal según estado: primario para Subir CSV, emerald para
 * Acreditar (lote que ya tiene los números del CSV), outline para
 * Comprobante / Ver Disputa.
 */
function BotonAccion({ r, a }: { r: LoteAcreditacion; a: LotesAcciones }) {
  if (!a.puedeGestionar) return null;
  switch (r.estado) {
    case "Programado":
      return (
        <button
          onClick={() => a.onSubirCsv(r)}
          className={`${BTN} bg-primary text-primary-foreground hover:opacity-90`}
        >
          <FileUp size={13} /> Subir CSV
        </button>
      );
    case "Pendiente":
      return (
        <button
          onClick={() => a.onAcreditar(r)}
          className={`${BTN} bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          <CheckCircle2 size={13} /> Acreditar
        </button>
      );
    case "Acreditado":
      return (
        <button onClick={() => a.setDetail(r)} className={BTN_OUTLINE}>
          <Receipt size={13} /> Comprobante
        </button>
      );
    case "Contracargo":
      return (
        <button onClick={() => a.abrirContracargo(r)} className={BTN_OUTLINE}>
          <Gavel size={13} /> Ver Disputa
        </button>
      );
    default:
      return null;
  }
}

/** Celda de acciones de la grilla de lotes. */
export function LoteAcciones({ r, a }: { r: LoteAcreditacion; a: LotesAcciones }) {
  return (
    <div className="flex items-center gap-1.5">
      <BotonAccion r={r} a={a} />
      <ActionsDropdown actions={getActions(r, a)} />
    </div>
  );
}
