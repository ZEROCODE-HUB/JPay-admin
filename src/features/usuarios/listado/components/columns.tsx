import type { Column } from "@/shared/ui/data-table";
import { Badge } from "@/components/portal-shell";
import { LegajoCell, LEGAJO_TOOLTIP } from "@/components/legajo-label";
import { SHOW_PLAFT_COLUMNS } from "@/lib/feature-flags";
import { PepCelda } from "../../comun/components/PepCelda";
import type { Usuario } from "../utils";
import { KycBadge, PerfilConsumo, RiesgoBadge } from "./Indicadores";

const columns: Column<Usuario>[] = [
  {
    key: "legajo",
    label: "Legajo",
    hint: LEGAJO_TOOLTIP,
    filterable: true,
    minWidth: 110,
    render: (row) => <LegajoCell legajo={row.legajo} />,
  },
  {
    key: "cuit",
    label: "ID fiscal",
    filterable: true,
    minWidth: 130,
    render: (row) => (
      <span className="font-mono text-xs tabular-nums" title={`Legajo: ${row.legajo}`}>
        {row.cuitFormatted}
      </span>
    ),
  },
  {
    key: "nombres",
    label: "Cliente / Usuario",
    filterable: true,
    minWidth: 200,
    maxWidth: 320,
    render: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.nombres}</span>
        <span className="text-xs text-muted-foreground">{row.correo}</span>
      </div>
    ),
  },
  {
    key: "estadoLabel",
    label: "Estado",
    minWidth: 120,
    render: (row) => <Badge tone={row.estadoTone}>{row.estadoLabel}</Badge>,
  },
  {
    key: "kycCompleto",
    label: "KYC",
    minWidth: 110,
    render: (row) => <KycBadge completo={row.kycCompleto} />,
  },
  {
    key: "riesgo",
    label: "Riesgo PLAFT",
    minWidth: 130,
    render: (row) => <RiesgoBadge nivel={row.riesgo} motivo={row.riesgoMotivo} />,
  },
  {
    key: "esPep",
    label: "PEP",
    minWidth: 70,
    render: (row) => <PepCelda esPep={row.esPep} />,
  },
  {
    key: "cvuCount",
    label: "CVUs",
    minWidth: 80,
    render: (row) => (
      <span
        className={`text-xs font-medium tabular-nums ${row.cvuCount > 0 ? "text-foreground" : "text-muted-foreground"}`}
      >
        {row.cvuCount} {row.cvuCount === 1 ? "CVU" : "CVUs"}
      </span>
    ),
  },
  {
    key: "consumoMensualPct",
    label: "Perfil",
    minWidth: 140,
    render: (row) => <PerfilConsumo pct={row.consumoMensualPct} limite={row.limiteTransferencia} />,
  },
  {
    key: "fechaRegistro",
    label: "Fecha de registro",
    minWidth: 130,
    render: (row) => <span className="font-mono tabular-nums">{row.fechaRegistro}</span>,
  },
];

// Columnas PLAFT (Riesgo, PEP, Perfil) ocultadas por decisión de Compliance.
// El nivel de riesgo es 100% manual; mostrar el valor calculado automáticamente
// carece de sentido regulatorio. Ver src/lib/feature-flags.ts.
const PLAFT_KEYS = new Set(["riesgo", "esPep", "consumoMensualPct"]);
export const visibleColumns: Column<Usuario>[] = SHOW_PLAFT_COLUMNS
  ? columns
  : columns.filter((c) => !PLAFT_KEYS.has(String(c.key)));
