import type { Cliente } from "@/lib/api/types";
import { formatCuit, formatTaxId, VACIO } from "@/shared/format";
import { getPais, paisPorCodigo } from "@/shared/pais";

type ConIds = Pick<Cliente, "cuit" | "pais" | "taxId" | "taxIdTipo">;

/**
 * Identificador fiscal del cliente según su país: CUIT en Argentina (es el mismo `cuit`
 * interno) y RFC u otro en el resto, donde `cuit` es solo el número interno con prefijo 99.
 * Sin país se asume Argentina (clientes anteriores a la migración 1015).
 */
export function idFiscalCliente(c: ConIds): { etiqueta: string; valor: string } {
  if (!c.pais || c.pais === "AR") {
    return { etiqueta: "CUIT", valor: formatCuit(c.taxId ?? c.cuit) };
  }
  const pais = paisPorCodigo(c.pais) ?? getPais();
  return {
    etiqueta: c.taxIdTipo ?? pais.fiscal.fisica.tipo,
    valor: c.taxId ? formatTaxId(c.taxId, c.taxIdTipo) : VACIO,
  };
}

/** Régimen fiscal "código · nombre" (o el código si el país no lo tiene en catálogo). */
export function regimenFiscalCliente(c: Pick<Cliente, "pais" | "regimenFiscal">): string {
  if (!c.regimenFiscal) return VACIO;
  const r = paisPorCodigo(c.pais)?.regimenesFiscales.find((x) => x.codigo === c.regimenFiscal);
  return r ? `${r.codigo} · ${r.nombre}` : c.regimenFiscal;
}
