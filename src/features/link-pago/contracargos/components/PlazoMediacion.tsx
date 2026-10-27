import type { ReactElement } from "react";
import { Badge } from "@/components/portal-shell";
import { formatDate, formatDateTime, formatTime } from "@/shared/format";
import { diasHabilesRestantes } from "../utils";

export function PlazoMediacion({
  fechaLimite,
  enviadoAt,
}: {
  fechaLimite: string | null;
  enviadoAt: string | null;
}) {
  if (!fechaLimite) {
    return (
      <p className="text-xs text-muted-foreground">
        Sin plazo definido (se calcula al pasar a mediación).
      </p>
    );
  }
  const dias = diasHabilesRestantes(fechaLimite);
  const fechaFmt = formatDateTime(fechaLimite);
  let badge: ReactElement;
  let texto: string;
  if (enviadoAt) {
    badge = <Badge tone="success">Enviado a PayWay</Badge>;
    texto = `Enviado el ${formatDate(enviadoAt)}.`;
  } else if (dias < 0) {
    badge = <Badge tone="danger">Vencido hace {-dias} día(s) hábil(es)</Badge>;
    texto = `Venció el ${fechaFmt}.`;
  } else if (dias === 0) {
    badge = <Badge tone="warn">Vence hoy</Badge>;
    texto = `Vence hoy a las ${formatTime(fechaLimite)}.`;
  } else {
    badge = <Badge tone="warn">Vence en {dias} día(s) hábil(es)</Badge>;
    texto = `Límite: ${fechaFmt}.`;
  }
  return (
    <div className="flex items-center gap-2 text-xs">
      {badge}
      <span className="text-muted-foreground">{texto}</span>
    </div>
  );
}
