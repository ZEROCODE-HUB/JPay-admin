import { QrCode } from "lucide-react";
import type { Column } from "@/shared/ui/data-table";
import { formatDate } from "@/shared/format";
import { Badge } from "@/components/portal-shell";
import type { PuntoVenta } from "@/lib/api/types";
import { estadoQrTone } from "../estados";

export const qrPosColumns: Column<PuntoVenta>[] = [
  {
    key: "nombre",
    label: "QR / POS",
    render: (r) => (
      <span className="font-semibold flex items-center gap-1.5">
        <QrCode size={14} /> {r.nombre}{" "}
        <span className="text-xs text-muted-foreground">({r.tipo ?? "QR"})</span>
      </span>
    ),
  },
  {
    key: "comercio",
    label: "Comercio",
    render: (r) => <span>{r.comercio?.usuario ?? "—"}</span>,
  },
  {
    key: "usuario",
    label: "Usuario",
    render: (r) => <span>{r.comercio?.clienteCorreo ?? r.comercio?.usuario ?? "—"}</span>,
  },
  { key: "cajero", label: "Cajero", render: (r) => <span>{r.cajero ?? "—"}</span> },
  {
    key: "estado",
    label: "Estado",
    render: (r) => <Badge tone={estadoQrTone(r.estado)}>{r.estado}</Badge>,
  },
  {
    key: "createdAt",
    label: "Fecha",
    render: (r) => <span className="font-mono text-xs">{formatDate(r.createdAt)}</span>,
  },
];
