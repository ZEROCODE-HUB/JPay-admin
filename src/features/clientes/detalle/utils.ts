import { formatDate, formatDateTime, formatMoney } from "@/shared/format";
import type { Alerta, Bloqueo } from "@/lib/api/detalle-cliente";
import type { Cliente, EstadoCliente, EstadoMovimiento, Movimiento } from "@/lib/api/types";
import type { Movimiento as DetailMovimiento } from "@/components/movimiento-detail";
import { resolverEstadoMovimiento } from "@/lib/estados";

import { idFiscalCliente, regimenFiscalCliente } from "@/lib/identificacion-cliente";
export const estadoLabel: Record<EstadoCliente, string> = {
  pendiente_verificacion: "Pendiente de verificación de email",
  registrado: "Registrado",
  preactivado: "Preactivado",
  activado: "Activado",
  suspendido: "Suspendido",
  deshabilitado: "Deshabilitado",
  eliminado: "Eliminado",
  activo: "Activado",
  rechazado: "Deshabilitado",
} as Record<EstadoCliente, string>;

export const estadoTone: Record<EstadoCliente, "success" | "danger" | "warn" | "neutral"> = {
  pendiente_verificacion: "warn",
  registrado: "warn",
  preactivado: "warn",
  activado: "success",
  suspendido: "danger",
  deshabilitado: "neutral",
  eliminado: "danger",
  activo: "success",
  rechazado: "neutral",
} as Record<EstadoCliente, "success" | "danger" | "warn" | "neutral">;

export type TabKey =
  | "identificacion"
  | "movimientos"
  | "impuestos"
  | "subcuentas"
  | "documentos"
  | "validaciones"
  | "riesgo"
  | "contexto"
  | "modulos"
  | "historial";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "identificacion", label: "Datos personales" },
  { key: "movimientos", label: "Movimientos" },
  { key: "impuestos", label: "Impuestos" },
  { key: "subcuentas", label: "Subcuentas y CVUs" },
  { key: "documentos", label: "Documentos" },
  { key: "validaciones", label: "Validaciones automáticas" },
  { key: "riesgo", label: "Riesgo y monitoreo" },
  { key: "contexto", label: "Contexto operativo" },
  { key: "modulos", label: "Módulos y productos" },
  { key: "historial", label: "Historial" },
];

export type ParamTipo = "switch" | "switch_valor" | "switch_porcentaje" | "switch_cantidad_periodo";

export type ParamDef = {
  clave: string;
  etiqueta: string;
  tipo: ParamTipo;
  valorDefecto?: string;
  periodoDefecto?: string;
  unidad?: string;
};

export const ALERTA_PARAM_DEF: ParamDef[] = [
  {
    clave: "exceso_perfil_transaccional",
    etiqueta: "Exceso de perfil transaccional esperado",
    tipo: "switch",
  },
  {
    clave: "variacion_volumen_mes_anterior",
    etiqueta: "Variación de volumen esperado respecto al mes anterior",
    tipo: "switch_porcentaje",
    valorDefecto: "10",
    unidad: "%",
  },
  {
    clave: "domicilio_jurisdiccion_alto_riesgo",
    etiqueta: "Tiene domicilio en jurisdicción considerada de alto riesgo",
    tipo: "switch",
  },
  {
    clave: "operacion_individual_monto",
    etiqueta: "La operación individual superó un monto determinado",
    tipo: "switch_valor",
    valorDefecto: "100000",
    unidad: "$",
  },
  {
    clave: "operaciones_repetidas_mismo_destinatario",
    etiqueta:
      "Cantidad de operaciones repetidas hacia un mismo destinatario dentro de un período determinado",
    tipo: "switch_cantidad_periodo",
    valorDefecto: "5",
    periodoDefecto: "24h",
  },
];

export const BLOQUEO_PARAM_DEF: ParamDef[] = [
  {
    clave: "bloqueo_exceso_perfil_transaccional",
    etiqueta: "Bloquear por exceso de perfil transaccional esperado",
    tipo: "switch",
  },
  {
    clave: "bloqueo_variacion_volumen_mes_anterior",
    etiqueta: "Bloquear por variación de volumen respecto al mes anterior",
    tipo: "switch_porcentaje",
    valorDefecto: "20",
    unidad: "%",
  },
  {
    clave: "bloqueo_domicilio_jurisdiccion_alto_riesgo",
    etiqueta: "Bloquear por domicilio en jurisdicción considerada de alto riesgo",
    tipo: "switch",
  },
  {
    clave: "bloqueo_operacion_individual_monto",
    etiqueta: "Bloquear por operación individual que supera un monto determinado",
    tipo: "switch_valor",
    valorDefecto: "200000",
    unidad: "$",
  },
  {
    clave: "bloqueo_operaciones_repetidas_mismo_destinatario",
    etiqueta: "Bloquear por operaciones repetidas hacia un mismo destinatario en un período",
    tipo: "switch_cantidad_periodo",
    valorDefecto: "5",
    periodoDefecto: "24h",
  },
];

export type AlertaView = Alerta & { fechaAceptacion?: string };
export type BloqueoView = Bloqueo & { fechaAceptacion?: string };

export type ConfirmActionState = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "danger";
  onConfirm: () => void;
};

export type EstadoTarget = {
  dbId: string;
  estadoActual: string;
  nuevoId: number;
};

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toDetalleMovimiento(m: Movimiento, catalogo: EstadoMovimiento[]): DetailMovimiento {
  return {
    clienteId: m.clienteId,
    legajo: m.legajo,
    id: m.idTxn,
    tipo: m.tipo,
    cvu: m.cvu ?? "—",
    usuario: m.cliente?.correo ?? m.legajo,
    nombreOrigen: m.cliente?.nombre ?? "—",
    nombreDestino: "—",
    cuit: m.cliente?.cuit ?? "—",
    monto: formatMoney(m.montoCobrado),
    fecha: formatDateTime(m.fecha),
    estado: resolverEstadoMovimiento(m, catalogo).codigo,
  };
}

export function camposIdentificacion(c: Cliente) {
  const partes = c.nombre.trim().split(/\s+/);
  const apellidoDerivado = c.tipoPersona === "juridica" ? "—" : partes.slice(1).join(" ") || "—";
  const nombreDerivado = c.tipoPersona === "juridica" ? c.nombre : (partes[0] ?? c.nombre);
  const personal: { label: string; valor: string }[] = [
    { label: "Legajo", valor: c.legajo },
    { label: "Email", valor: c.correo },
    { label: "Fecha de registro", valor: formatDate(c.fechaAlta) },
    {
      label: "Tipo de cuenta",
      valor: c.tipoPersona === "juridica" ? "Persona Jurídica" : "Persona Física",
    },
    { label: "Estado", valor: estadoLabel[c.estado] ?? c.estado },
    { label: "Cant. cuentas bancarias", valor: "—" },
    { label: "Cant. cuentas virtuales", valor: "—" },
    { label: "Nombre", valor: nombreDerivado },
    { label: "Apellido", valor: apellidoDerivado },
    {
      label: idFiscalCliente(c).etiqueta,
      valor: c.pais && c.pais !== "AR" ? idFiscalCliente(c).valor : (c.cuitCuil ?? c.cuit ?? "—"),
    },
    ...(c.idPersonal ? [{ label: c.idPersonalTipo ?? "ID personal", valor: c.idPersonal }] : []),
    ...(c.regimenFiscal ? [{ label: "Régimen fiscal", valor: regimenFiscalCliente(c) }] : []),
    ...(c.cuentaBancaria
      ? [{ label: c.cuentaBancariaTipo ?? "Cuenta bancaria", valor: c.cuentaBancaria }]
      : []),
    { label: "Género", valor: c.genero ?? "—" },
    { label: "Dirección", valor: c.direccion ?? "—" },
    { label: "Número de dirección", valor: c.direccion2 ?? "—" },
    { label: "Ciudad", valor: c.ciudad ?? "—" },
    { label: "Estado / Provincia", valor: c.provincia ?? "—" },
    { label: "Código postal", valor: c.cp ?? "—" },
    {
      label: "Fecha de nacimiento",
      valor: c.fechaNacimiento ? formatDate(c.fechaNacimiento) : "—",
    },
  ];
  const compliance: { label: string; valor: string }[] = [
    { label: "Ocupación", valor: c.ocupacion ?? "—" },
    { label: "Origen de fondos", valor: c.origenFondos ?? "—" },
    { label: "PEP", valor: c.esPep ? "Sí" : c.esPep === false ? "No" : "—" },
  ];
  const empresa: { label: string; valor: string }[] = [
    { label: `${idFiscalCliente(c).etiqueta} de la empresa`, valor: idFiscalCliente(c).valor },
    { label: "Tipo de empresa", valor: c.tipoSociedad ?? "—" },
    {
      label: "Nombre legal",
      valor: c.nombreLegal ?? (c.tipoPersona === "juridica" ? c.nombre : "—"),
    },
    { label: "Nombre comercial", valor: c.nombreFantasia ?? "—" },
    {
      label: "Fecha de inscripción",
      valor: c.fechaInscripcion ? formatDate(c.fechaInscripcion) : "—",
    },
  ];
  return { personal, compliance, empresa };
}

export function esUrlImagen(url: string | null): boolean {
  return !!url && /\.(jpe?g|png|gif|webp|jfif|avif|bmp)(\?|$)/i.test(url);
}
