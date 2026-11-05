import type { Cliente } from "@/lib/api/types";
import { formatTaxId, VACIO } from "@/shared/format";
import { getPais, paisPorCodigo } from "@/shared/pais";

type ConIds = Pick<Cliente, "pais" | "taxId" | "taxIdTipo">;

/**
 * Identificador fiscal del cliente (RFC). La columna `cuit` es solo el número interno del
 * cliente (prefijo 99) y nunca se muestra como identificador fiscal.
 */
export function idFiscalCliente(c: ConIds): { etiqueta: string; valor: string } {
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
