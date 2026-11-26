import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { BtnOutline, BtnPrimary } from "@/components/portal-shell";
import { getEnvioCobre, type EnvioCobre } from "@/lib/api/cobre";
import { descargarComprobantePdf } from "@/lib/comprobante-pdf";

const ESTADO: Record<string, string> = {
  completada: "Completada",
  devuelta: "Devuelta por el banco",
  rechazada: "Rechazada",
  fallida: "Fallida",
  cancelada: "Cancelada",
  error_envio: "No enviada",
  pendiente_aprobacion: "Esperando aprobación",
};

function descargar(e: EnvioCobre) {
  const usd = e.moneda === "USD";
  descargarComprobantePdf({
    fecha: e.creadaAt,
    monto: e.monto,
    concepto: e.concepto ?? undefined,
    estado: ESTADO[e.estado] ?? "En proceso",
    txid: e.idTxn,
    claveRastreo: e.claveRastreo ?? undefined,
    cep: e.cep ?? undefined,
    moneda: e.moneda,
    red: usd ? (e.tipo === "swift" ? "SWIFT" : "Fedwire") : undefined,
    uetr: e.uetr ?? undefined,
    desde: e.origen,
    hacia: {
      nombre: e.destino?.titular ?? "",
      rfc: e.destino?.rfc ?? "",
      clabe: e.destino?.numero ?? "",
      banco: e.destino?.banco ?? undefined,
    },
  });
  toast.success("Comprobante descargado");
}

/**
 * Datos del envío en Cobre de un TXID (clave de rastreo, CEP, UETR) con el comprobante en PDF.
 * No muestra nada si el movimiento no es un envío de Cobre.
 */
export function EnvioCobreDetalle({ idTxn }: { idTxn: string }) {
  const q = useQuery({
    queryKey: ["cobre", "envio", idTxn],
    queryFn: () => getEnvioCobre(idTxn),
    enabled: !!idTxn,
  });
  const e = q.data;
  if (!e) return null;
  const usd = e.moneda === "USD";
  const filas: [string, string][] = [
    ["Red", usd ? (e.tipo === "swift" ? "SWIFT" : "Fedwire") : "SPEI"],
    ["Estado en Cobre", ESTADO[e.estado] ?? "En proceso"],
    usd ? ["UETR (SWIFT)", e.uetr ?? "—"] : ["Clave de rastreo", e.claveRastreo ?? "—"],
    ["ID de Cobre", e.mmId ?? "—"],
  ];
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-semibold mb-2">Envío en Cobre</h4>
      <dl className="space-y-2 text-sm">
        {filas.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">{k}</dt>
            <dd className="font-mono text-xs text-right break-all">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {e.cep && (
          <BtnOutline onClick={() => window.open(e.cep!, "_blank", "noopener,noreferrer")}>
            <ExternalLink size={15} /> Ver CEP en Banxico
          </BtnOutline>
        )}
        <BtnPrimary onClick={() => descargar(e)}>
          <Download size={15} /> Descargar comprobante
        </BtnPrimary>
      </div>
    </div>
  );
}
