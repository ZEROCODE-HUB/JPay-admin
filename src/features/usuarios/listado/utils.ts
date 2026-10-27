import type { ClienteEnrichment, RiesgoPLD } from "@/lib/api/clientes";
import type { Cliente, EstadoCliente } from "@/lib/api/types";
import { ESTADO_LABEL, ESTADO_TONE, normalizarEstado } from "@/lib/cliente-estados";
import type { Tono } from "../comun/types";

import { idFiscalCliente } from "@/lib/identificacion-cliente";
export type Usuario = {
  id: string;
  legajo: string;
  correo: string;
  nombres: string;
  cuit: string;
  cuitFormatted: string;
  estadoRaw: EstadoCliente;
  estadoLabel: string;
  estadoTone: Tono;
  fechaRegistro: string;
  // Enrichment
  esPep: boolean;
  riesgo: RiesgoPLD | null;
  riesgoMotivo: string | null;
  kycCompleto: boolean;
  cvuCount: number;
  consumoMensualPct: number | null;
  limiteTransferencia: number | null;
};

/** Fila de la tabla de personas físicas a partir del cliente + su enrichment. */
export function toUsuario(c: Cliente, e: ClienteEnrichment = {}): Usuario {
  const norm = normalizarEstado(c.estado);
  return {
    id: c.id,
    legajo: c.legajo,
    correo: c.correo,
    nombres: c.nombre,
    cuit: c.cuit,
    cuitFormatted: idFiscalCliente(c).valor,
    estadoRaw: c.estado,
    estadoLabel: ESTADO_LABEL[norm],
    estadoTone: ESTADO_TONE[norm] as Usuario["estadoTone"],
    fechaRegistro: c.fechaAlta,
    esPep: Boolean(c.esPep),
    riesgo: e.riesgo ?? null,
    riesgoMotivo: e.riesgoMotivo ?? null,
    kycCompleto: Boolean(e.kycCompleto),
    cvuCount: e.cvuCount ?? 0,
    consumoMensualPct: e.consumoMensualPct ?? null,
    limiteTransferencia: c.limiteTransferencia ?? null,
  };
}

/** "bajo" → "Bajo". */
export function labelRiesgo(nivel: RiesgoPLD): string {
  return nivel.charAt(0).toUpperCase() + nivel.slice(1);
}
