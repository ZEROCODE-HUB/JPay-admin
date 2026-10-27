import type { DcExcepcionCreateInput } from "@/lib/api/dc-excepciones";
import { fechaLocalISO } from "../utils";

export const PAGE_SIZE = 10;

/** "Ambos" crea dos registros: uno Entrantes y otro Salientes. */
export type DireccionForm = "Entrantes" | "Salientes" | "Ambos";

export type AltaForm = {
  email: string;
  cuit: string;
  direccion: DireccionForm;
  motivo: string;
  desde: string;
  hasta: string;
  autorizacion: string;
  impuesto_id: string;
  archivo_certificado: string;
};

/** Formulario vacío con vigencia desde la fecha dada (AAAA-MM-DD, fecha local). */
export function altaVacia(hoy: Date): AltaForm {
  return {
    email: "",
    cuit: "",
    direccion: "Ambos",
    motivo: "",
    desde: fechaLocalISO(hoy),
    hasta: "",
    autorizacion: "",
    impuesto_id: "",
    archivo_certificado: "",
  };
}

/** Email con formato, CUIT de 11 dígitos (se ignoran guiones), motivo y fecha desde. */
export function esAltaValida(alta: AltaForm): boolean {
  return (
    /.+@.+\..+/.test(alta.email.trim()) &&
    /^[0-9]{11}$/.test(alta.cuit.replace(/[^0-9]/g, "")) &&
    alta.motivo.trim() !== "" &&
    alta.desde !== ""
  );
}

/** Datos comunes del alta manual (sin dirección); los opcionales vacíos van como null. */
export function altaBase(alta: AltaForm): Omit<DcExcepcionCreateInput, "direccion"> {
  return {
    email: alta.email,
    cuit: alta.cuit,
    tipo: "Alta manual",
    motivo: alta.motivo,
    vigencia_desde: alta.desde,
    vigencia_hasta: alta.hasta || null,
    autorizacion_codigo: alta.autorizacion || null,
    impuesto_id: alta.impuesto_id || null,
    archivo_certificado: alta.archivo_certificado || null,
  };
}

export function mensajeAltaCreada(cantidad: number): string {
  return cantidad > 1
    ? "Alta manual creada correctamente (2 registros: Entrantes y Salientes)."
    : "Excepción creada correctamente.";
}

/** El error de guardar es por un CHECK de la base (p. ej. CUIT inválido). */
export function esErrorCheck(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === "23514";
}
