import { Link2 } from "lucide-react";
import { formatDate, formatMoney } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { Badge } from "@/components/portal-shell";
import { ESTADOS_ENLACE, type EnlacePago } from "@/lib/api/enlaces-pago";
import { toneEnlace } from "../estados";
import { montoNumero } from "../utils";

export const columnasEnlaces: Column<EnlacePago>[] = [
  {
    key: "url",
    label: "Enlace de pago",
    filterable: true,
    render: (r) => (
      <span className="font-mono text-xs break-all flex items-center gap-1">
        <Link2 size={12} />
        {r.url ?? "—"}
      </span>
    ),
  },
  { key: "comercioNombre", label: "Comercio", filterable: true, render: (r) => r.comercioNombre },
  { key: "usuario", label: "Usuario", render: (r) => r.usuario ?? r.clienteLegajo },
  {
    key: "monto",
    label: "Monto",
    render: (r) => (
      <span className="font-mono tabular-nums text-xs">{formatMoney(montoNumero(r.monto))}</span>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    filterable: "enum",
    filterOptions: [...ESTADOS_ENLACE],
    render: (r) => <Badge tone={toneEnlace(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "createdAt",
    label: "Fecha",
    render: (r) => <span className="font-mono text-xs">{formatDate(r.createdAt)}</span>,
  },
];
