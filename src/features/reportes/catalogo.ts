import type { ComponentType } from "react";
import { BarChart3, Users, Wallet, type LucideIcon } from "lucide-react";
import { ReporteComisiones } from "@/features/reportes/components/ReporteComisiones";
import { ReporteActividad } from "@/features/reportes/components/ReporteActividad";
import { ReporteCobrosProveedor } from "@/features/reportes/components/ReporteCobrosProveedor";
import type { Modulo } from "@/shared/pais";

export type ReportDef = {
  key: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  /** Solo se muestra si el país tiene el módulo prendido. */
  modulo?: Modulo;
};

export const reports: ReportDef[] = [
  {
    key: "cobros-proveedor",
    name: "Cobros con Ecart Pay",
    icon: Wallet,
    color: "text-emerald-600",
    description: "Por día, medio de pago, sucursal y comercio, con comisiones y reembolsos.",
    modulo: "pagos_proveedor",
  },
  {
    key: "comisiones",
    name: "Reportes de Comisiones",
    icon: BarChart3,
    color: "text-purple-500",
    description: "Comisiones por período y tipo de operación.",
  },
  {
    key: "actividad",
    name: "Actividad de Usuarios",
    icon: Users,
    color: "text-indigo-500",
    description: "Actividad registrada por legajo de backoffice.",
  },
];

export const views: Record<string, ComponentType> = {
  comisiones: ReporteComisiones,
  actividad: ReporteActividad,
  "cobros-proveedor": ReporteCobrosProveedor,
};
