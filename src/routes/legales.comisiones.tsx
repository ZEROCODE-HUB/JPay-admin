import { formatMoney, formatPercent } from "@/shared/format";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/legales/comisiones")({
  head: () => ({
    meta: [
      { title: pageTitle("Tabla de Comisiones") },
      {
        name: "description",
        content: "Detalle de comisiones y aranceles vigentes de la plataforma.",
      },
    ],
  }),
  component: Page,
});

const IVA = 16;
const CARGO_FIJO_LOTE = 45;

type Fila = {
  op: string;
  comPorcentaje: number | null;
  comFijo: number | null;
  comTexto: string | null;
};

const filas: Fila[] = [
  {
    op: `Transferencias entre cuentas ${brand.name}`,
    comPorcentaje: null,
    comFijo: null,
    comTexto: "Sin cargo",
  },
  {
    op: "Transferencias SPEI a otra CLABE (hasta $500,000)",
    comPorcentaje: null,
    comFijo: null,
    comTexto: "Sin cargo",
  },
  {
    op: "Transferencias SPEI a otra CLABE (más de $500,000)",
    comPorcentaje: 0.3,
    comFijo: null,
    comTexto: null,
  },
  { op: "Link de pago (débito / crédito)", comPorcentaje: 1.9, comFijo: null, comTexto: null },
  { op: "Cobros masivos por lote", comPorcentaje: null, comFijo: CARGO_FIJO_LOTE, comTexto: null },
  { op: "Pago de servicios", comPorcentaje: null, comFijo: null, comTexto: "Sin cargo" },
  {
    op: "Alta de subcuenta con CLABE propia",
    comPorcentaje: null,
    comFijo: null,
    comTexto: "Sin cargo",
  },
  {
    op: "Emisión de constancia de CLABE",
    comPorcentaje: null,
    comFijo: null,
    comTexto: "Sin cargo",
  },
];

const comLabel = (f: Fila) =>
  f.comTexto
    ? f.comTexto
    : f.comPorcentaje != null
      ? formatPercent(f.comPorcentaje)
      : formatMoney(f.comFijo ?? 0);

const totalLabel = (f: Fila): string => {
  if (f.comTexto) return "—";
  if (f.comPorcentaje != null) return formatPercent(f.comPorcentaje * (1 + IVA / 100));
  return formatMoney((f.comFijo ?? 0) * (1 + IVA / 100));
};

function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </header>
      <article className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Tabla de Comisiones
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Vigente desde <span className="font-mono tabular-nums">01/06/2026</span> · Aplicable al
          Plan Empresa.
        </p>

        <div className="mt-8 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold">Operación</th>
                <th className="text-right px-4 py-3 font-display font-semibold">Comisión</th>
                <th className="text-right px-4 py-3 font-display font-semibold">
                  Impuesto (IVA {IVA}%)
                </th>
                <th className="text-right px-4 py-3 font-display font-semibold">Total cobrado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.op} className="border-t">
                  <td className="px-4 py-3">{f.op}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap font-mono tabular-nums">
                    {comLabel(f)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-mono tabular-nums text-muted-foreground">
                    {f.comTexto ? "—" : `IVA ${formatPercent(IVA)}`}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap font-mono tabular-nums">
                    {totalLabel(f)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-muted bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>
            El impuesto (IVA {formatPercent(IVA)}) se aplica <strong>sobre la comisión</strong> y{" "}
            {brand.name} lo retiene y entera por el servicio. Fórmula del total cobrado:{" "}
            <span className="font-mono">comisión × (1 + {formatPercent(IVA)})</span>.
          </p>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Todas las comisiones están expresadas en pesos mexicanos (MXN). IVA no incluido salvo
          indicación contraria. Los aranceles pueden modificarse con un preaviso mínimo de 30 días.
        </p>
      </article>
    </div>
  );
}
