import type { Resolver, ResolverInput } from "@/lib/api/types";

export const PAGE_SIZE = 10;

/** Datos del formulario de alta/edición de resolver. */
export type ResolverForm = {
  nombre: string;
  cuit: string;
  nombreReverso: string;
  formatoWeb: string;
  pcpId: string;
  idPcp: string;
  url: string;
  token: string;
  asHeader: boolean;
  soa: boolean;
};

/** Valores iniciales del formulario (vacío en el alta, los del resolver al editar). */
export function formInicialResolver(resolver: Resolver | null): ResolverForm {
  return {
    nombre: resolver?.nombre ?? "",
    cuit: resolver?.cuit ?? "",
    nombreReverso: resolver?.nombreReverso ?? "",
    formatoWeb: resolver?.formatoWeb ?? "",
    pcpId: resolver?.pcpId ?? "",
    idPcp: resolver?.idPcp ?? "",
    url: resolver?.url ?? "",
    token: resolver?.token ?? "",
    asHeader: resolver?.asHeader ?? false,
    soa: resolver?.soa ?? false,
  };
}

/** Saca espacios y guiones del CUIT. */
export function normalizarCuit(cuit: string): string {
  return cuit.replace(/[\s-]/g, "");
}

/** El CUIT (ignorando espacios y guiones) tiene exactamente 11 dígitos. */
export function esCuitValido(cuit: string): boolean {
  return /^\d{11}$/.test(normalizarCuit(cuit));
}

/** Campos editables que se mandan a la API (sin el estado). */
export function resolverFormToInput(form: ResolverForm): Omit<ResolverInput, "estado"> {
  return {
    nombre: form.nombre,
    cuit: form.cuit,
    nombreReverso: form.nombreReverso,
    formatoWeb: form.formatoWeb,
    pcpId: form.pcpId,
    idPcp: form.idPcp,
    url: form.url,
    token: form.token,
    asHeader: form.asHeader,
    soa: form.soa,
  };
}
