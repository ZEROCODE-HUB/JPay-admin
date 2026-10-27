import type { ReactNode } from "react";
import { Banknote, Clock, MinusCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/portal-shell";
import type { ResumenSaldos } from "@/lib/api/calendario-acreditaciones";
import { formatMoney } from "@/shared/format";

type Tone = "neutral" | "info" | "warn" | "success";

const TONE_CLASSES: Record<Tone, { card: string; text: string; icon: string }> = {
  neutral: {
    card: "bg-card",
    text: "text-foreground",
    icon: "text-muted-foreground bg-muted",
  },
  info: {
    card: "bg-card",
    text: "text-blue-700",
    icon: "text-blue-700 bg-blue-50",
  },
  warn: {
    card: "bg-card",
    text: "text-amber-700",
    icon: "text-amber-700 bg-amber-50",
  },
  success: {
    card: "bg-emerald-50/50 border-emerald-200",
    text: "text-emerald-700",
    icon: "text-emerald-700 bg-emerald-100",
  },
};

function KpiCard({
  label,
  subtitle,
  amount,
  icon,
  tone,
  loading,
}: {
  label: string;
  subtitle: string;
  amount: number;
  icon: ReactNode;
  tone: Tone;
  loading?: boolean;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <Card className={`p-3 ${t.card}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${t.icon}`}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <div className={`font-mono text-xl font-semibold mt-1.5 ${t.text}`}>
        {loading ? (
          <span className="inline-block w-20 h-5 bg-muted animate-pulse rounded" />
        ) : (
          formatMoney(amount)
        )}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>
    </Card>
  );
}

/** Header de saldos (4 cards). */
export function SaldosKpis({
  resumen,
  loading,
}: {
  resumen: ResumenSaldos | undefined;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <KpiCard
        label="Falta cobrar"
        subtitle="Ventas sin lote aún"
        amount={resumen?.faltaCobrar ?? 0}
        icon={<Clock size={14} />}
        tone="neutral"
        loading={loading}
      />
      <KpiCard
        label="Por acreditar"
        subtitle="Lotes no Acreditados"
        amount={resumen?.porAcreditar ?? 0}
        icon={<Banknote size={14} />}
        tone="info"
        loading={loading}
      />
      <KpiCard
        label="Adelantos en curso"
        subtitle="Pendiente + Aprobado"
        amount={resumen?.adelantosEnCurso ?? 0}
        icon={<MinusCircle size={14} />}
        tone="warn"
        loading={loading}
      />
      <KpiCard
        label="Disponible real"
        subtitle="Por acreditar − en curso"
        amount={resumen?.disponibleReal ?? 0}
        icon={<TrendingUp size={14} />}
        tone="success"
        loading={loading}
      />
    </div>
  );
}
