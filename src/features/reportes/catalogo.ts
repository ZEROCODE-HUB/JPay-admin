import type { ComponentType } from "react";
import {
  Banknote,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Landmark,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ReporteConciliaciones } from "@/features/reportes/components/ReporteConciliaciones";
import { ReporteBCRA } from "@/features/reportes/components/ReporteBCRA";
import { ReporteAFIP } from "@/features/reportes/components/ReporteAFIP";
import { ReporteComisiones } from "@/features/reportes/components/ReporteComisiones";
import { ReporteMovimientos } from "@/features/reportes/components/ReporteMovimientos";
import { ReporteActividad } from "@/features/reportes/components/ReporteActividad";
import { ReporteImpuestos } from "@/features/reportes/components/ReporteImpuestos";
import { ReporteConciliacionesBLP } from "@/features/reportes/components/ReporteConciliacionesBLP";
import { ReporteUnidadNegocio } from "@/features/reportes/components/ReporteUnidadNegocio";

export type ReportDef = {
  key: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
};

export const reports: ReportDef[] = [
  {
    key: "conciliaciones",
    name: "Conciliaciones Bancarias",
    icon: Banknote,
    color: "text-blue-500",
    description: "Transacciones diarias subidas por el banco.",
  },
  {
    key: "bcra",
    name: "Reportes BCRA",
    icon: Receipt,
    color: "text-emerald-500",
    description: 'Padrón de Personas Jurídicas — Com. "A" 8207 (SISCEN).',
  },
  {
    key: "afip",
    name: "Reportes AFIP",
    icon: FileText,
    color: "text-orange-500",
    description: "Regímenes informativos (ARCA / ex AFIP).",
  },
  {
    key: "comisiones",
    name: "Reportes de Comisiones",
    icon: BarChart3,
    color: "text-purple-500",
    description: "Comisiones por período y tipo de operación.",
  },
  {
    key: "movimientos",
    name: "Reportes de Movimientos",
    icon: FileText,
    color: "text-teal-500",
    description: "Movimientos de personas físicas y jurídicas fuera de la plataforma.",
  },
  {
    key: "actividad",
    name: "Actividad de Usuarios",
    icon: Users,
    color: "text-indigo-500",
    description: "Actividad registrada por legajo de backoffice.",
  },
  {
    key: "impuestos",
    name: "Reportes de Impuestos",
    icon: FileSpreadsheet,
    color: "text-primary-ink",
    description: "Retenciones presentadas y pagadas por período.",
  },
  {
    key: "conciliaciones-blp",
    name: "Conciliaciones BLP",
    icon: Landmark,
    color: "text-cyan-500",
    description: "Conciliación de archivos Payway (pagos y liquidaciones).",
  },
  {
    key: "unidad-negocio",
    name: "Reporte por Unidad de Negocio",
    icon: BarChart3,
    color: "text-amber-500",
    description: "Cuánto genera cada unidad: CVU, CVU chica U, QR, Link de Pago, E-commerce.",
  },
];

export const views: Record<string, ComponentType> = {
  conciliaciones: ReporteConciliaciones,
  bcra: ReporteBCRA,
  afip: ReporteAFIP,
  comisiones: ReporteComisiones,
  movimientos: ReporteMovimientos,
  actividad: ReporteActividad,
  impuestos: ReporteImpuestos,
  "conciliaciones-blp": ReporteConciliacionesBLP,
  "unidad-negocio": ReporteUnidadNegocio,
};
