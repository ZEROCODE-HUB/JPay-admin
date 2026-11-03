import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Badge, BtnPrimary, Input, PageHeader } from "@/components/portal-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { buscarOperacionSpei, type OperacionSpei } from "@/lib/api/consulta-spei";
import { formatDateTime, formatMoney } from "@/shared/format";

/**
 * Consultas frecuentes en México: busca un depósito o una transferencia SPEI de Cobre por clave
 * de rastreo, TXID de JPay o ID de Cobre (en lugar del ID de Coelsa de Argentina).
 */
export function ConsultaSpeiMx() {
  const [texto, setTexto] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<OperacionSpei[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultar = async () => {
    if (!texto.trim()) {
      setError("Ingresá una clave de rastreo, un TXID o un ID de Cobre");
      return;
    }
    setError(null);
    setBuscando(true);
    try {
      setResultado(await buscarOperacionSpei(texto));
    } catch (e) {
      setError((e as Error).message);
      setResultado(null);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Consultas frecuentes"
        description="Buscá un depósito o una transferencia SPEI por clave de rastreo, TXID o ID de Cobre"
      />
      <div className="bg-card border rounded-lg p-5 space-y-4 max-w-2xl">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Clave de rastreo, TXID o ID de Cobre
            </label>
            <Input
              placeholder="Ej: JPAY2026110300012 o mm_l5Kwx…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && consultar()}
            />
          </div>
          <BtnPrimary onClick={consultar} disabled={buscando}>
            <Search size={16} /> {buscando ? "Buscando…" : "Consultar"}
          </BtnPrimary>
        </div>
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>

      {resultado && (
        <div className="bg-card border rounded-lg mt-4">
          {resultado.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              description="No hay depósitos ni transferencias con ese dato en JPay."
            />
          ) : (
            <ul className="divide-y">
              {resultado.map((o) => (
                <li key={o.tipo + o.id} className="p-4 grid gap-1 text-sm md:grid-cols-2">
                  <div className="md:col-span-2 flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      {o.tipo} · {formatMoney(o.monto, { moneda: o.moneda })}
                    </span>
                    <Badge>{o.estado}</Badge>
                  </div>
                  <span className="text-muted-foreground">
                    Fecha: <span className="text-foreground">{formatDateTime(o.fecha)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Cliente:{" "}
                    {o.legajo ? (
                      <Link
                        to="/admin/general/usuarios/$legajo"
                        params={{ legajo: o.legajo }}
                        className="text-foreground font-mono hover:underline"
                      >
                        {o.legajo}
                      </Link>
                    ) : (
                      <span className="text-foreground">sin asignar</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    Clave de rastreo:{" "}
                    <span className="text-foreground font-mono">{o.claveRastreo ?? "—"}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {o.tipo === "Depósito" ? "Remitente" : "TXID"}:{" "}
                    <span className="text-foreground font-mono">{o.referencia ?? "—"}</span>
                  </span>
                  <span className="text-muted-foreground">
                    ID de Cobre:{" "}
                    <span className="text-foreground font-mono">{o.idCobre ?? "—"}</span>
                  </span>
                  {o.cep?.startsWith("https://") && (
                    <a
                      href={o.cep}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-ink font-semibold hover:underline"
                    >
                      Ver CEP (Banxico)
                    </a>
                  )}
                  {o.motivo && (
                    <span className="md:col-span-2 text-xs text-danger-600">{o.motivo}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
