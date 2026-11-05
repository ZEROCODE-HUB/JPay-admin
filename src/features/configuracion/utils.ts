import type { Integracion } from "@/lib/api/types";
import type { Salud } from "./estados";

export type IntegracionUI = {
  id: string;
  nombre: string;
  proveedor: string;
  salud: Salud;
  ultimaEjecucion: string;
  proximaEjecucion: string;
  ejecuciones: number;
};

/** Logins del próximo grupo de ejecución (sin monitoreo real todavía: vacío). */
export const proximoGrupo: string[] = [];

/**
 * Integración de la base con sus métricas operativas. No hay tabla de métricas (pendiente del
 * sistema de monitoreo): salud "ok" y sin ejecuciones.
 */
export function buildIntegracionUI(i: Integracion): IntegracionUI {
  return {
    id: i.id,
    nombre: i.nombre,
    proveedor: i.proveedor,
    salud: "ok",
    ultimaEjecucion: "—",
    proximaEjecucion: "—",
    ejecuciones: 0,
  };
}
