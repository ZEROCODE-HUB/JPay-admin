import { brand } from "@/brand/brand";
import { Badge } from "@/components/portal-shell";
import type { LoteAcreditacion } from "@/lib/api/types";
import { formatDate, formatMoney } from "@/shared/format";
import type { Column } from "@/shared/ui/data-table";
import { toneLote } from "../estados";
import {
  esLoteEstimado,
  legajoComercio,
  nombreComercio,
  totalDescuentos,
  type ResumenComercio,
} from "../utils";

export const lotesColumns: Column<LoteAcreditacion>[] = [
  {
    key: "fecha",
    label: "Fecha (est./real)",
    minWidth: 160,
    render: (r) => {
      // El lote Programado siempre muestra "est.": no tiene aún la
      // fecha real de cobro. A partir de Pendiente/Acreditado la
      // fecha real aparece si el CSV la aportó.
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs tabular-nums">{formatDate(r.fecha)}</span>
          <span className="flex items-center gap-1">
            <Badge tone={r.fechaCobroReal ? "success" : "neutral"}>
              {r.fechaCobroReal ? "real" : "est."}
            </Badge>
            {r.fechaCobroReal && (
              <span className="font-mono text-[10px] text-muted-foreground">
                cob. {formatDate(r.fechaCobroReal)}
              </span>
            )}
          </span>
        </div>
      );
    },
  },
  {
    key: "codigo",
    label: "Lote",
    minWidth: 150,
    maxWidth: 260,
    render: (r) => (
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-semibold">{r.codigo}</span>
      </div>
    ),
  },
  {
    key: "comercio",
    label: "Comercio / Legajo",
    minWidth: 200,
    maxWidth: 320,
    render: (r) => (
      <div>
        <div className="font-semibold text-sm truncate max-w-[180px]">{nombreComercio(r)}</div>
        <div className="font-mono text-xs text-muted-foreground">{legajoComercio(r)}</div>
      </div>
    ),
  },
  {
    key: "bandera",
    label: "Bandera",
    minWidth: 100,
    render: (r) => (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-muted/50">
        {r.bandera}
      </span>
    ),
  },
  {
    key: "cantidadOperaciones",
    label: "Ops",
    minWidth: 70,
    render: (r) => (
      <span className="font-mono tabular-nums">
        {r.cantidadOperaciones}
        {r.cuotas && r.cuotas > 1 ? ` · ${r.cuotas}c` : ""}
      </span>
    ),
  },
  {
    key: "importeBruto",
    label: "Importe bruto",
    minWidth: 130,
    render: (r) => (
      <span
        className={`font-mono tabular-nums ${esLoteEstimado(r) ? "text-muted-foreground/60" : ""}`}
      >
        {formatMoney(r.importeBruto)}
        {esLoteEstimado(r) && (
          <span className="ml-1 text-[10px] text-muted-foreground/70">(Est.)</span>
        )}
      </span>
    ),
  },
  {
    key: "descuentos",
    label: "Descuentos",
    minWidth: 150,
    render: (r) => {
      // En Programado: la 0,45% está "Pendiente de cierre" — no se
      // descuenta todavía, así que la cifra va atenuada y con la leyenda
      // para que el operador no la confunda con un cargo firme.
      const estimado = esLoteEstimado(r);
      return (
        <span
          className={`font-mono tabular-nums ${
            estimado ? "text-muted-foreground/60" : "text-danger-600"
          }`}
        >
          - {formatMoney(totalDescuentos(r))}
          {estimado && (
            <span className="ml-1 text-[10px] text-muted-foreground/70">(sin 0,45%)</span>
          )}
        </span>
      );
    },
  },
  {
    key: "importeNeto",
    label: "Importe a acreditar",
    minWidth: 170,
    render: (r) => {
      // En Programado el importe a acreditar todavía es proyección:
      // incluye la comisión de la plataforma/IVA estimada pero NO el 0,45%
      // de cierre (que se aplica al confirmar).
      const estimado = esLoteEstimado(r);
      return (
        <span
          className={`font-mono tabular-nums font-semibold ${
            r.estado === "Contracargo"
              ? "text-danger-600"
              : estimado
                ? "text-muted-foreground/70"
                : "text-emerald-700"
          }`}
        >
          {formatMoney(r.importeNeto)}
          {estimado && (
            <Badge tone="neutral" className="ml-1.5 align-middle">
              Est.
            </Badge>
          )}
        </span>
      );
    },
  },
  {
    key: "estado",
    label: "Estado",
    minWidth: 120,
    render: (r) => <Badge tone={toneLote(r.estado)}>{r.estado}</Badge>,
  },
];

export const resumenColumns: Column<ResumenComercio>[] = [
  {
    key: "comercio",
    label: "Comercio / Legajo",
    minWidth: 200,
    maxWidth: 320,
    render: (r) => (
      <div>
        <div className="font-semibold text-sm truncate max-w-[160px]">{r.comercio}</div>
        <div className="font-mono text-xs text-muted-foreground">{r.legajo}</div>
      </div>
    ),
  },
  {
    key: "pendienteAcreditar",
    label: "Pendiente de acreditar",
    minWidth: 150,
    render: (r) => (
      <span className="font-mono text-xs font-semibold">{formatMoney(r.pendienteAcreditar)}</span>
    ),
  },
  {
    key: "pendienteImpuestos",
    label: "Pendiente de impuestos",
    minWidth: 150,
    render: (r) => <span className="font-mono text-xs">{formatMoney(r.pendienteImpuestos)}</span>,
  },
  {
    key: "totalPayWay",
    label: "Comisión PayWay",
    minWidth: 140,
    render: (r) => <span className="font-mono text-xs">{formatMoney(r.totalPayWay)}</span>,
  },
  {
    key: "totalPropio",
    label: `Neto ${brand.name}`,
    minWidth: 140,
    render: (r) => (
      <span className="font-mono text-xs text-emerald-700">{formatMoney(r.totalPropio)}</span>
    ),
  },
  {
    key: "totalFinal",
    label: "Total a pagar",
    minWidth: 140,
    render: (r) => (
      <span className="font-mono font-semibold text-emerald-700">{formatMoney(r.totalFinal)}</span>
    ),
  },
];
