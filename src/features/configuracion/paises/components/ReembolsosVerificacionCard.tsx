import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BtnOutline, BtnPrimary, Card, Input } from "@/components/portal-shell";
import { listReembolsosEnVerificacion, resolverReembolso } from "@/lib/api/reembolsos";
import { formatDateTime, formatMoney } from "@/shared/format";
import { InfoTip } from "@/shared/ui/info-tip";
import { brand } from "@/brand/brand";

const MOTIVO: Record<string, string> = {
  requested: "Lo pidió el cliente",
  duplicate: "Pago duplicado",
  fraudulent: "Posible fraude",
};

/**
 * Reembolsos de Ecart Pay sin respuesta clara: se revisan en el panel de Ecart Pay y se dan por
 * hechos (descuentan del pago) o por no hechos (liberan el disponible). Pide una nota.
 */
export function ReembolsosVerificacionCard() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["reembolsos", "en-verificacion"],
    queryFn: listReembolsosEnVerificacion,
  });
  const [notas, setNotas] = useState<Record<string, string>>({});
  const resolver = useMutation({
    mutationFn: (v: { id: string; hecho: boolean; nota: string }) =>
      resolverReembolso(v.id, v.hecho, v.nota),
    onSuccess: (_d, v) => {
      toast.success(v.hecho ? "Reembolso dado por hecho" : "Reembolso liberado");
      qc.invalidateQueries({ queryKey: ["reembolsos"] });
      qc.invalidateQueries({ queryKey: ["paises", "alertas", "ecartpay"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const decidir = (id: string, hecho: boolean) => {
    const nota = (notas[id] ?? "").trim();
    if (!nota) return toast.error("Escribe qué viste en el panel de Ecart Pay");
    resolver.mutate({ id, hecho, nota });
  };

  return (
    <Card>
      <h3 className="font-semibold">
        Reembolsos en verificación{" "}
        <InfoTip>
          Reembolsos de cobros de Ecart Pay pedidos desde {brand.name} (por el comercio o el
          backoffice) en los que Ecart Pay no confirmó si se hicieron. Muestra el monto del
          reembolso y el del cobro original; ese monto sigue reservado del disponible hasta que lo
          resuelvas.
        </InfoTip>
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        Ecart Pay no respondió con claridad y no se sabe si el reembolso se hizo. Busca la orden en
        el panel de Ecart Pay y resuélvelo; mientras tanto, el monto sigue reservado.
      </p>
      {q.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
      ) : q.isError ? (
        <p className="mt-4 text-sm text-danger-600">{(q.error as Error).message}</p>
      ) : (q.data ?? []).length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No hay reembolsos en verificación.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {q.data!.map((r) => (
            <li key={r.id} className="py-3 space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">
                  {formatMoney(r.monto)} de un pago de {formatMoney(r.montoPago)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(r.creadoAt)} · {r.origen === "admin" ? "Backoffice" : "Comercio"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {r.legajo ?? "—"} · orden <span className="font-mono">{r.ordenId ?? "—"}</span> ·{" "}
                {MOTIVO[r.motivo] ?? r.motivo}
                {r.error && ` · ${r.error}`}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  className="flex-1 min-w-[220px] h-9"
                  placeholder="Qué se vio en el panel de Ecart Pay"
                  value={notas[r.id] ?? ""}
                  onChange={(e) => setNotas((n) => ({ ...n, [r.id]: e.target.value }))}
                />
                <BtnPrimary disabled={resolver.isPending} onClick={() => decidir(r.id, true)}>
                  Sí se hizo
                </BtnPrimary>
                <BtnOutline disabled={resolver.isPending} onClick={() => decidir(r.id, false)}>
                  No se hizo
                </BtnOutline>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
