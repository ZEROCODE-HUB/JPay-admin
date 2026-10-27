import { formatCuit } from "@/shared/format";
import type { ClienteEnrichment } from "@/lib/api/clientes";
import type { Cliente, EstadoCliente } from "@/lib/api/types";
import { ESTADO_LABEL, ESTADO_TONE, normalizarEstado } from "@/lib/cliente-estados";
import type { Tono } from "../comun/types";

/**
 * Etiqueta corta del tipo societario a partir de `clientes.tipo_sociedad`.
 * Si no matchea ninguno conocido, devuelve el texto original truncado.
 */
export function tipoSociedadToLabel(tipo: string | null | undefined): string {
  if (!tipo) return "—";
  const t = tipo.trim().toLowerCase();
  if (t.includes("srl") || t.includes("responsabilidad limitada")) return "SRL";
  if (t.includes("sas")) return "SAS";
  if (
    t.includes(" sa") ||
    t.startsWith("sa") ||
    t.includes("sociedad anonima") ||
    t.includes("sociedad anónima")
  )
    return "SA";
  if (t.includes("sca") || t.includes("colectiva")) return "SCA";
  if (t.includes("scpa") || t.includes("comandita por acciones")) return "SCpA";
  if (t.includes("sc") || t.includes("comandita simple")) return "SC";
  if (t.includes("civil")) return "SCivil";
  // Fallback: truncar a 6 caracteres para no romper el ancho de la columna.
  return tipo.length > 6 ? tipo.slice(0, 6) : tipo;
}

export type JuridicaRow = {
  id: string;
  legajo: string;
  correo: string;
  cuit: string;
  cuitFormatted: string;
  razonSocial: string;
  nombreFantasia: string | null;
  tipoSociedadRaw: string | null;
  tipoLabel: string;
  estadoRaw: EstadoCliente;
  estadoLabel: string;
  estadoTone: Tono;
  fechaRegistro: string;
  esPep: boolean;
  comerciosCount: number;
  cvuCount: number;
};

/** Fila de la tabla de personas jurídicas a partir del cliente + su enrichment. */
export function toJuridicaRow(c: Cliente, e: ClienteEnrichment = {}): JuridicaRow {
  const norm = normalizarEstado(c.estado);
  return {
    id: c.id,
    legajo: c.legajo,
    correo: c.correo,
    cuit: c.cuit,
    cuitFormatted: formatCuit(c.cuit),
    razonSocial: c.nombre,
    nombreFantasia: c.nombreFantasia ?? null,
    tipoSociedadRaw: c.tipoSociedad ?? null,
    tipoLabel: tipoSociedadToLabel(c.tipoSociedad),
    estadoRaw: c.estado,
    estadoLabel: ESTADO_LABEL[norm],
    estadoTone: ESTADO_TONE[norm] as Tono,
    fechaRegistro: c.fechaAlta,
    esPep: Boolean(c.esPep),
    comerciosCount: e.comerciosCount ?? 0,
    cvuCount: e.cvuCount ?? 0,
  };
}
