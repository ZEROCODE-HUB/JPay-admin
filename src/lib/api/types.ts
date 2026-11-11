// Tipos alineados 1:1 con el esquema REAL de Supabase (verificado vía information_schema).
// El repo local (0001_init.sql) está desactualizado; esta es la única fuente de verdad.
// Reglas clave:
//  - movimientos.estado_id  -> smallint FK a estados_movimiento.id (NO texto libre).
//  - admin_users.rol_id     -> uuid FK a roles.id (NO columna "rol" texto).
//  - comisiones_cliente.operacion = código único (text); tipo = categoría (text, 4 valores).

import type { Json } from "@/lib/database.types";

export type JsonObject = { [key: string]: Json | undefined };

export type TipoPersona = "fisica" | "juridica";
export const TIPOS_PERSONA: TipoPersona[] = ["fisica", "juridica"];

export type EstadoCliente =
  | "pendiente_verificacion"
  | "registrado"
  | "preactivado"
  | "activado"
  | "suspendido"
  | "deshabilitado"
  | "eliminado"
  // legacy compat (datos existentes antes de 0019)
  | "activo"
  | "rechazado";
export const ESTADOS_CLIENTE: EstadoCliente[] = [
  "pendiente_verificacion",
  "registrado",
  "preactivado",
  "activado",
  "suspendido",
  "deshabilitado",
  "eliminado",
];

// --- admin_users (rol_id FK a roles) --------------------------------------

export type AdminUserRow = {
  id: string;
  legajo: string;
  email: string;
  nombre: string;
  activo: boolean;
  rol_id: string;
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  legajo: string;
  email: string;
  nombre: string;
  activo: boolean;
  rolId: string;
  createdAt: string;
  updatedAt: string;
};

// --- clientes --------------------------------------------------------------

export type ClienteRow = {
  id: string;
  legajo: string;
  tipo_persona: TipoPersona;
  correo: string;
  nombre: string;
  cuit: string;
  estado: EstadoCliente;
  fecha_alta: string;
  created_at: string;
  updated_at: string;
  email_verificado?: boolean | null;
  onboarding_completo?: boolean | null;
  cbu?: string | null;
  cbu_cancelado?: boolean | null;
  genero?: string | null;
  cuit_cuil?: string | null;
  fecha_nacimiento?: string | null;
  ocupacion?: string | null;
  origen_fondos?: string | null;
  es_pep?: boolean | null;
  tipo_sociedad?: string | null;
  nombre_legal?: string | null;
  nombre_fantasia?: string | null;
  fecha_inscripcion?: string | null;
  direccion?: string | null;
  direccion2?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  cp?: string | null;
  estado_onboarding?: string | null;
  limite_transferencia?: number | null;
  limite_ops_diarias?: number | null;
  limite_monto_diario?: number | null;
  pais?: string | null;
  tax_id?: string | null;
  tax_id_tipo?: string | null;
  id_personal?: string | null;
  id_personal_tipo?: string | null;
  regimen_fiscal?: string | null;
  cuenta_bancaria?: string | null;
  cuenta_bancaria_tipo?: string | null;
};

export type Cliente = {
  id: string;
  legajo: string;
  tipoPersona: TipoPersona;
  correo: string;
  nombre: string;
  /** Número interno del cliente (prefijo 99). No es el identificador fiscal: ese es `taxId`. */
  cuit: string;
  /** País del cliente (código de `@/shared/pais`). */
  pais?: string | null;
  /** Identificador fiscal (RFC). */
  taxId?: string | null;
  taxIdTipo?: string | null;
  /** Identificador personal (CURP). */
  idPersonal?: string | null;
  idPersonalTipo?: string | null;
  regimenFiscal?: string | null;
  /** Cuenta para liquidaciones (CLABE). */
  cuentaBancaria?: string | null;
  cuentaBancariaTipo?: string | null;
  estado: EstadoCliente;
  fechaAlta: string;
  createdAt: string;
  updatedAt: string;
  emailVerificado?: boolean;
  onboardingCompleto?: boolean;
  cbu?: string | null;
  cbuCancelado?: boolean;
  genero?: string | null;
  fechaNacimiento?: string | null;
  ocupacion?: string | null;
  origenFondos?: string | null;
  esPep?: boolean;
  tipoSociedad?: string | null;
  nombreLegal?: string | null;
  nombreFantasia?: string | null;
  fechaInscripcion?: string | null;
  direccion?: string | null;
  direccion2?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  cp?: string | null;
  estadoOnboarding?: string | null;
  limiteTransferencia?: number | null;
  limiteOpsDiarias?: number | null;
  limiteMontoDiario?: number | null;
};

// --- comisiones_cliente ----------------------------------------------------

/** "Conversión": pesos a dólares en Cobre (México); solo existe como comisión del cliente. */
export type TipoOperacion = "Depósito" | "Retiro" | "Link de pago" | "E-commerce" | "Conversión";
export type ModalidadComision = "Porcentaje" | "Fijo";
export type EstadoComision = "Habilitado" | "Deshabilitado";

export const TIPOS_OPERACION: TipoOperacion[] = [
  "Depósito",
  "Retiro",
  "Link de pago",
  "E-commerce",
];
export const ESTADOS_COMISION: EstadoComision[] = ["Habilitado", "Deshabilitado"];

export type ComisionClienteRow = {
  id: string;
  cliente_id: string;
  /** Subcuenta a la que aplica; null = comisión del cliente (respaldo). */
  subcuenta_id: string | null;
  operacion: string;
  tipo: TipoOperacion;
  modalidad: ModalidadComision;
  porcentaje: number | null;
  monto_fijo: number | null;
  porcentaje_impuesto: number;
  estado: EstadoComision;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
  clientes?: ComisionClienteJoined | ComisionClienteJoined[] | null;
  subcuentas?: ComisionSubcuentaJoined | ComisionSubcuentaJoined[] | null;
};

type ComisionClienteJoined = {
  legajo: string;
  correo: string;
  cuit: string;
  tax_id?: string | null;
  nombre: string;
  tipo_persona: TipoPersona;
};

type ComisionSubcuentaJoined = { cbu: string | null; nombre: string | null };

export type ComisionCliente = {
  id: string;
  clienteId: string;
  /** Subcuenta a la que aplica la comisión (null = comisión del cliente, respaldo). */
  subcuentaId: string | null;
  subcuenta?: { cbu: string | null; nombre: string | null } | null;
  operacion: string;
  tipo: TipoOperacion;
  modalidad: ModalidadComision;
  porcentaje: number | null;
  montoFijo: number | null;
  porcentajeImpuesto: number;
  estado: EstadoComision;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    legajo: string;
    correo: string;
    cuit: string;
    /** RFC del cliente. */
    taxId?: string | null;
    nombre: string;
    tipoPersona: TipoPersona;
  } | null;
};

// --- movimientos (estado_id FK a estados_movimiento) ----------------------

export type MovimientoRow = {
  id: string;
  cliente_id: string;
  legajo: string;
  id_txn: string;
  tipo: string;
  cvu: string | null;
  monto_operacion: number;
  comision: number;
  impuesto: number;
  monto_cobrado: number;
  fecha: string;
  created_at: string;
  estado_id: number;
  comercio_id?: string | null;
  destinatario_nombre?: string | null;
  /** RFC de la contraparte. */
  destinatario_cuit?: string | null;
  destinatario_banco?: string | null;
  // to-one: PostgREST devuelve object (se acepta array por compat).
  estados_movimiento?: MovimientoEstadoJoined | MovimientoEstadoJoined[] | null;
  clientes?: MovimientoClienteJoined | MovimientoClienteJoined[] | null;
  currency_code?: string | null;
};

type MovimientoEstadoJoined = { codigo: string; nombre: string; es_final: boolean };
type MovimientoClienteJoined = { correo: string; nombre: string };

export type Movimiento = {
  id: string;
  clienteId: string;
  legajo: string;
  idTxn: string;
  tipo: string;
  /** CLABE de la operación (columna `cvu`). */
  clabe: string | null;
  /** Moneda de la operación (MXN o USD). */
  moneda: "MXN" | "USD";
  montoOperacion: number;
  comision: number;
  impuesto: number;
  montoCobrado: number;
  fecha: string;
  createdAt: string;
  estadoId: number;
  comercioId?: string | null;
  destinatarioNombre?: string | null;
  /** RFC de la contraparte (columna `destinatario_cuit`). */
  destinatarioRfc?: string | null;
  destinatarioBanco?: string | null;
  estadoCodigo?: string;
  estadoNombre?: string;
  esFinal?: boolean;
  cliente?: {
    correo: string;
    nombre: string;
  } | null;
};

/** Códigos de estado (estados_movimiento.codigo) para filtros de UI. */
export const ESTADOS_MOVIMIENTO_CODES = [
  "APROBADO",
  "EN_PROGRESO",
  "RECHAZADO",
  "BLOQUEADO",
  "CREADO",
  "ABIERTO",
  "EXPIRADO",
  "REEMBOLSADO",
] as const;

/** Alias legible para los filtros de UI. */
export const ESTADOS_MOVIMIENTO = ESTADOS_MOVIMIENTO_CODES;

// --- catálogos: roles / recursos / permisos / estados ---------------------

export type RolRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
};

export type Rol = {
  id: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecursoRow = {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
};

export type Recurso = {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
};

export type PermisoRow = {
  id: string;
  rol_id: string;
  recurso_id: string;
  puede_leer: boolean;
  puede_crear: boolean;
  puede_modificar: boolean;
  puede_borrar: boolean;
};

export type Permiso = {
  id: string;
  rolId: string;
  recursoId: string;
  puedeLeer: boolean;
  puedeCrear: boolean;
  puedeModificar: boolean;
  puedeBorrar: boolean;
};

export type EstadoMovimientoRow = {
  id: number;
  codigo: string;
  nombre: string;
  es_final: boolean;
  requiere_conciliacion: boolean;
  created_at: string;
};

export type EstadoMovimiento = {
  id: number;
  codigo: string;
  nombre: string;
  esFinal: boolean;
  requiereConciliacion: boolean;
  createdAt: string;
};

export type EstadoPorTipoRow = {
  tipo_movimiento: string;
  estado_id: number;
};

export type EstadoPorTipo = {
  tipoMovimiento: string;
  estadoId: number;
};

// --- conciliaciones --------------------------------------------------------

export type ConciliacionRow = {
  id: string;
  movimiento_id: string;
  fecha_conciliacion: string;
  estado_conciliacion: string;
  monto_diferencia: number;
  archivo_origen: string | null;
  created_at: string;
};

export type Conciliacion = {
  id: string;
  movimientoId: string;
  fechaConciliacion: string;
  estadoConciliacion: string;
  montoDiferencia: number;
  archivoOrigen: string | null;
  createdAt: string;
};

// --- comercios (tabla real: comercios / puntos_venta / codigos_categoria) --
//
// Regla de negocio (confirmada por el cliente): `comercios.legajo` es una FK
// REAL hacia `clientes.legajo` — nunca texto libre sin constraint. Cualquier
// columna `legajo` que represente a un cliente debe tener FK a `clientes.legajo`.
// La única excepción conocida es `admin_users.legajo` (namespace distinto,
// formato ADM-XXXX), que NO lleva esa FK.

export type EstadoComercio =
  "Activado" | "Desactivado" | "Pendiente de aprobación" | "Rechazado" | "Suspendido";

export const ESTADOS_COMERCIO: EstadoComercio[] = [
  "Activado",
  "Desactivado",
  "Pendiente de aprobación",
  "Rechazado",
  "Suspendido",
];

export type NivelComercio =
  "Pequeño" | "Mediano" | "Grande" | "Premium" | "Estándar" | "Básico" | "Enterprise";

export const NIVELES_COMERCIO: NivelComercio[] = [
  "Pequeño",
  "Mediano",
  "Grande",
  "Premium",
  "Estándar",
  "Básico",
  "Enterprise",
];

export type EstadoQr =
  | "Pendiente de aprobación"
  | "Pendiente de aprobacion"
  | "Activado"
  | "Desactivado"
  | "Rechazado"
  | "Suspendido"
  | "Eliminado";
export const ESTADOS_QR: EstadoQr[] = [
  "Pendiente de aprobación",
  "Activado",
  "Desactivado",
  "Rechazado",
  "Suspendido",
  "Eliminado",
];

export type PuntoVentaRow = {
  id: string;
  comercio_id: string;
  nombre: string;
  estado: EstadoQr;
  created_at: string;
  tipo?: string | null;
  cajero?: string | null;
  qr_url?: string | null;
  alias?: string | null;
  comercios?: {
    id: string;
    usuario: string;
    legajo: string;
    clientes?: { nombre: string; correo: string } | { nombre: string; correo: string }[] | null;
  } | null;
};

export type PuntoVenta = {
  id: string;
  comercioId: string;
  nombre: string;
  estado: EstadoQr;
  createdAt: string;
  tipo?: string | null;
  cajero?: string | null;
  qrUrl?: string | null;
  alias?: string | null;
  comercio?: {
    id: string;
    usuario: string;
    legajo: string;
    clienteNombre?: string;
    clienteCorreo?: string;
  } | null;
};

export type CodigoCategoriaRow = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: "activo" | "inactivo";
  created_at: string;
  updated_at: string;
};

export type CodigoCategoria = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: "activo" | "inactivo";
  createdAt: string;
  updatedAt: string;
};

export type CodigoCategoriaInput = {
  codigo: string;
  nombre: string;
  descripcion: string;
  estado?: "activo" | "inactivo";
};

export type ComercioRow = {
  id: string;
  usuario: string;
  legajo: string;
  nombre_comercio?: string | null;
  categoria_id: number | null;
  estado: EstadoComercio;
  nivel: NivelComercio;
  ejecutivo_responsable_id?: string | null;
  site_id?: string | null;
  created_at: string;
  updated_at: string;
  // PostgREST devuelve object en to-one y array en one-to-many: se aceptan ambas.
  clientes?: ComercioClienteJoined | ComercioClienteJoined[] | null;
  codigos_categoria?: CodigoCategoriaRow | CodigoCategoriaRow[] | null;
  puntos_venta?: PuntoVentaRow[] | null;
  admin_users?: ComercioAdminJoined | ComercioAdminJoined[] | null;
};

type ComercioClienteJoined = {
  legajo: string;
  nombre: string;
  cuit: string;
  tax_id?: string | null;
  tipo_persona: TipoPersona;
  correo: string;
};

type ComercioAdminJoined = { id: string; nombre: string; email: string };

export type Comercio = {
  id: string;
  usuario: string;
  legajo: string;
  nombreComercio?: string | null;
  cliente: {
    legajo: string;
    nombre: string;
    cuit: string;
    /** RFC del cliente. */
    taxId?: string | null;
    tipoPersona: TipoPersona;
    correo: string;
  } | null;
  categoriaId: number | null;
  categoria: CodigoCategoria | null;
  nivel: NivelComercio;
  estado: EstadoComercio;
  ejecutivoResponsableId?: string | null;
  ejecutivo: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  siteId?: string | null;
  puntosVenta: PuntoVenta[];
  createdAt: string;
  updatedAt: string;
};

export type ComercioInput = {
  usuario: string;
  legajo: string;
  nombreComercio?: string | null;
  categoriaId: number | null;
  nivel: NivelComercio;
  estado: EstadoComercio;
  ejecutivoResponsableId?: string | null;
  siteId?: string | null;
};

export type ClienteSelect = {
  legajo: string;
  nombre: string;
  correo: string;
  cuit?: string;
  /** RFC del cliente. */
  taxId?: string | null;
  tipoPersona?: TipoPersona;
  /** País del cliente: define el IVA por defecto de sus comisiones. */
  pais?: string | null;
};

// --- APIs externas (api_usuarios / api_endpoints / api_restricciones) ------

export type EstadoApiUsuario =
  "Pendiente Validación" | "Homologación" | "Producción" | "Suspendido" | "Deshabilitado";

export const ESTADOS_API_USUARIO: EstadoApiUsuario[] = [
  "Pendiente Validación",
  "Homologación",
  "Producción",
  "Suspendido",
  "Deshabilitado",
];

export type MetodoHttp = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export const METODOS_HTTP: MetodoHttp[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export type GrupoEndpoint =
  "Autenticación" | "Enlaces de pago" | "QR" | "SubAccounts" | "Transfer" | "User" | "Webhooks";

export const GRUPOS_ENDPOINT: GrupoEndpoint[] = [
  "Autenticación",
  "Enlaces de pago",
  "QR",
  "SubAccounts",
  "Transfer",
  "User",
  "Webhooks",
];

export type EstadoEndpoint = "Habilitado" | "Deshabilitado";
export const ESTADOS_ENDPOINT: EstadoEndpoint[] = ["Habilitado", "Deshabilitado"];

export type EstadoRestriccion = "Restringiendo" | "No restringiendo";
export const ESTADOS_RESTRICCION: EstadoRestriccion[] = ["Restringiendo", "No restringiendo"];

// --- api_usuarios -----------------------------------------------------------

export type ApiUsuarioRow = {
  id: string;
  codigo_usuario_api: string;
  usuario: string;
  nombre_completo: string;
  estado: EstadoApiUsuario;
  created_at: string;
  updated_at: string;
};

export type ApiUsuario = {
  id: string;
  codigoUsuarioApi: string;
  usuario: string;
  nombreCompleto: string;
  estado: EstadoApiUsuario;
  createdAt: string;
  updatedAt: string;
};

export type ApiUsuarioInput = {
  codigoUsuarioApi: string;
  usuario: string;
  nombreCompleto: string;
  estado?: EstadoApiUsuario;
};

// --- api_endpoints ----------------------------------------------------------

export type ApiEndpointRow = {
  id: string;
  nombre: string;
  path: string;
  metodo: MetodoHttp;
  descripcion: string | null;
  grupo: GrupoEndpoint;
  estado: EstadoEndpoint;
  rec: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiEndpoint = {
  id: string;
  nombre: string;
  path: string;
  metodo: MetodoHttp;
  descripcion: string | null;
  grupo: GrupoEndpoint;
  estado: EstadoEndpoint;
  rec: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiEndpointInput = {
  nombre: string;
  path: string;
  metodo: MetodoHttp;
  descripcion?: string | null;
  grupo: GrupoEndpoint;
  estado: EstadoEndpoint;
  rec: boolean;
};

// --- api_restricciones ------------------------------------------------------

export type ApiRestriccionRow = {
  id: string;
  api_usuario_id: string;
  estado: EstadoRestriccion;
  fecha_creacion: string;
  fecha_expiracion: string | null;
  created_at: string;
  api_usuarios?: ApiUsuarioJoined | ApiUsuarioJoined[] | null;
};

type ApiUsuarioJoined = {
  id: string;
  codigo_usuario_api: string;
  usuario: string;
  nombre_completo: string;
  estado: EstadoApiUsuario;
};

export type ApiRestriccion = {
  id: string;
  apiUsuarioId: string;
  apiUsuario: {
    id: string;
    codigoUsuarioApi: string;
    usuario: string;
    nombreCompleto: string;
    estado: EstadoApiUsuario;
  } | null;
  estado: EstadoRestriccion;
  fechaCreacion: string;
  fechaExpiracion: string | null;
  createdAt: string;
};

export type ApiRestriccionInput = {
  apiUsuarioId: string;
  estado: EstadoRestriccion;
  fechaExpiracion: string | null; // YYYY-MM-DD
};

// --- integraciones (catálogo) ------------------------------------------------

export type IntegracionRow = {
  id: string;
  nombre: string;
  proveedor: string;
  created_at: string;
};

export type Integracion = {
  id: string;
  nombre: string;
  proveedor: string;
  createdAt: string;
};

export type IntegracionInput = {
  id: string;
  nombre: string;
  proveedor: string;
};

// --- Notificaciones (catálogos + eventos) ------------------------------------

export type CanalNotificacionRow = {
  id: string;
  nombre: string;
  tipo: "Email" | "Telegram" | "WhatsApp";
  configuracion: Record<string, unknown> | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type CanalNotificacion = {
  id: string;
  nombre: string;
  tipo: "Email" | "Telegram" | "WhatsApp";
  configuracion: Record<string, unknown> | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CanalNotificacionInput = {
  nombre: string;
  tipo: "Email" | "Telegram" | "WhatsApp";
  configuracion?: JsonObject | null;
  activo?: boolean;
};

export type TipoEventoNotificacion = "evento" | "incidente";
export type EstadoEntrega = "pendiente" | "enviado" | "fallido" | "reintentando";

export type EventoNotificacionRow = {
  id: string;
  tipo: TipoEventoNotificacion;
  codigo_error_id: string | null;
  titulo: string;
  mensaje: string;
  audiencia: "Admin" | "Cliente" | "Ambos";
  canal: "Email" | "Telegram" | "WhatsApp";
  estado_entrega: EstadoEntrega;
  fecha: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  codigos_error?: { codigo: string; mensaje: string }[] | null;
};

export type EventoNotificacion = {
  id: string;
  tipo: TipoEventoNotificacion;
  codigoErrorId: string | null;
  titulo: string;
  mensaje: string;
  audiencia: "Admin" | "Cliente" | "Ambos";
  canal: "Email" | "Telegram" | "WhatsApp";
  estadoEntrega: EstadoEntrega;
  fecha: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  codigoError?: { codigo: string; mensaje: string } | null;
};

export type EventoNotificacionInput = {
  tipo: TipoEventoNotificacion;
  codigoErrorId: string | null;
  titulo: string;
  mensaje: string;
  audiencia: "Admin" | "Cliente" | "Ambos";
  canal: "Email" | "Telegram" | "WhatsApp";
  metadata?: JsonObject | null;
};

export type EventoNotificacionFiltros = {
  page: number;
  pageSize: number;
  search?: string;
  tipo?: TipoEventoNotificacion;
  audiencia?: "Admin" | "Cliente" | "Ambos";
  canal?: "Email" | "Telegram" | "WhatsApp";
  estadoEntrega?: EstadoEntrega;
  fechaDesde?: string;
  fechaHasta?: string;
};

// --- util ------------------------------------------------------------------

export type Pagination = {
  page: number;
  pageSize: number;
};

export type Page<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};
