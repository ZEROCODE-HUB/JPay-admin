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

export const proximoGrupo = ["pct:wondersoft", "pds:pago_mis_cuentas", "cpf:coelsa_cpf"];

// Mock data for operational metrics (semáforo + métricas operativas)
// ⚠️ Estos datos son MOCK de referencia — provendrían de un sistema de monitoreo real
// No hay tabla de métricas operativas en BD; pendiente de sistema de monitoreo/cron real.
const mockSalud: Record<string, Salud> = {
  "pct:wondersoft": "ok",
  "pds:pago_mis_cuentas": "ok",
  "bank.bdc_conecta": "warning",
  "cpf:coelsa_cpf": "ok",
  "pct:coelsa_cvu": "ok",
  "pct:coelsa_debin": "error",
};

const mockUltimaEjecucion: Record<string, string> = {
  "pct:wondersoft": "11/08/2026 08:00",
  "pds:pago_mis_cuentas": "11/08/2026 07:55",
  "bank.bdc_conecta": "11/08/2026 07:30",
  "cpf:coelsa_cpf": "11/08/2026 08:05",
  "pct:coelsa_cvu": "11/08/2026 08:02",
  "pct:coelsa_debin": "11/08/2026 07:45",
};

const mockProximaEjecucion: Record<string, string> = {
  "pct:wondersoft": "11/08/2026 08:15",
  "pds:pago_mis_cuentas": "11/08/2026 08:10",
  "bank.bdc_conecta": "11/08/2026 08:00",
  "cpf:coelsa_cpf": "11/08/2026 08:20",
  "pct:coelsa_cvu": "11/08/2026 08:17",
  "pct:coelsa_debin": "11/08/2026 08:10",
};

const mockEjecuciones: Record<string, number> = {
  "pct:wondersoft": 12480,
  "pds:pago_mis_cuentas": 8931,
  "bank.bdc_conecta": 4572,
  "cpf:coelsa_cpf": 21003,
  "pct:coelsa_cvu": 20177,
  "pct:coelsa_debin": 18954,
};

/** Integración de la base + métricas operativas mock (salud, ejecuciones). */
export function buildIntegracionUI(i: Integracion): IntegracionUI {
  return {
    id: i.id,
    nombre: i.nombre,
    proveedor: i.proveedor,
    salud: mockSalud[i.id] ?? "ok",
    ultimaEjecucion: mockUltimaEjecucion[i.id] ?? "—",
    proximaEjecucion: mockProximaEjecucion[i.id] ?? "—",
    ejecuciones: mockEjecuciones[i.id] ?? 0,
  };
}
