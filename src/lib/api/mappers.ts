import type {
  AdminUser,
  AdminUserRow,
  ApiEndpoint,
  ApiEndpointRow,
  ApiRestriccion,
  ApiRestriccionRow,
  ApiUsuario,
  ApiUsuarioRow,
  CanalNotificacion,
  CanalNotificacionRow,
  Cliente,
  ClienteRow,
  Comercio,
  ComercioRow,
  ComisionCliente,
  ComisionClienteRow,
  EventoNotificacion,
  EventoNotificacionRow,
  Integracion,
  IntegracionRow,
  Movimiento,
  MovimientoRow,
  PuntoVenta,
  PuntoVentaRow,
  CodigoCategoria,
  CodigoCategoriaRow,
} from "./types";

export function toCliente(r: ClienteRow): Cliente {
  return {
    id: r.id,
    legajo: r.legajo,
    tipoPersona: r.tipo_persona,
    correo: r.correo,
    nombre: r.nombre,
    cuit: r.cuit,
    pais: r.pais ?? null,
    taxId: r.tax_id ?? null,
    taxIdTipo: r.tax_id_tipo ?? null,
    idPersonal: r.id_personal ?? null,
    idPersonalTipo: r.id_personal_tipo ?? null,
    regimenFiscal: r.regimen_fiscal ?? null,
    cuentaBancaria: r.cuenta_bancaria ?? null,
    cuentaBancariaTipo: r.cuenta_bancaria_tipo ?? null,
    estado: r.estado,
    fechaAlta: r.fecha_alta,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    emailVerificado: (r.email_verificado as boolean) ?? false,
    onboardingCompleto: (r.onboarding_completo as boolean) ?? false,
    cbu: (r.cbu as string | null) ?? null,
    cbuCancelado: (r.cbu_cancelado as boolean) ?? false,
    genero: (r.genero as string | null) ?? null,
    fechaNacimiento: (r.fecha_nacimiento as string | null) ?? null,
    ocupacion: (r.ocupacion as string | null) ?? null,
    origenFondos: (r.origen_fondos as string | null) ?? null,
    esPep: (r.es_pep as boolean) ?? false,
    tipoSociedad: (r.tipo_sociedad as string | null) ?? null,
    nombreLegal: (r.nombre_legal as string | null) ?? null,
    nombreFantasia: (r.nombre_fantasia as string | null) ?? null,
    fechaInscripcion: (r.fecha_inscripcion as string | null) ?? null,
    direccion: (r.direccion as string | null) ?? null,
    direccion2: (r.direccion2 as string | null) ?? null,
    ciudad: (r.ciudad as string | null) ?? null,
    provincia: (r.provincia as string | null) ?? null,
    cp: (r.cp as string | null) ?? null,
    estadoOnboarding: (r.estado_onboarding as string | null) ?? null,
    limiteTransferencia: (r.limite_transferencia as number | null) ?? null,
    limiteOpsDiarias: (r.limite_ops_diarias as number | null) ?? null,
    limiteMontoDiario: (r.limite_monto_diario as number | null) ?? null,
  };
}

export function toComision(r: ComisionClienteRow): ComisionCliente {
  const cli = firstOrNull(r.clientes);
  const sub = firstOrNull(r.subcuentas);
  return {
    id: r.id,
    clienteId: r.cliente_id,
    subcuentaId: r.subcuenta_id ?? null,
    subcuenta: sub ? { cbu: sub.cbu, nombre: sub.nombre } : null,
    operacion: r.operacion,
    tipo: r.tipo,
    modalidad: r.modalidad,
    porcentaje: r.porcentaje,
    montoFijo: r.monto_fijo,
    porcentajeImpuesto: r.porcentaje_impuesto,
    estado: r.estado,
    descripcion: r.descripcion,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    cliente: cli
      ? {
          legajo: cli.legajo,
          correo: cli.correo,
          cuit: cli.cuit,
          taxId: cli.tax_id ?? null,
          nombre: cli.nombre,
          tipoPersona: cli.tipo_persona,
        }
      : null,
  };
}

export function toMovimiento(r: MovimientoRow): Movimiento {
  const cli = firstOrNull(r.clientes);
  const estado = firstOrNull(r.estados_movimiento);
  return {
    id: r.id,
    clienteId: r.cliente_id,
    legajo: r.legajo,
    idTxn: r.id_txn,
    tipo: r.tipo,
    clabe: r.cvu,
    montoOperacion: r.monto_operacion,
    comision: r.comision,
    impuesto: r.impuesto,
    montoCobrado: r.monto_cobrado,
    estadoId: r.estado_id,
    estadoCodigo: estado?.codigo,
    estadoNombre: estado?.nombre,
    esFinal: estado?.es_final,
    fecha: r.fecha,
    createdAt: r.created_at,
    comercioId: (r as MovimientoRow).comercio_id ?? null,
    destinatarioNombre: (r as MovimientoRow).destinatario_nombre ?? null,
    destinatarioRfc: (r as MovimientoRow).destinatario_cuit ?? null,
    destinatarioBanco: (r as MovimientoRow).destinatario_banco ?? null,
    cliente: cli,
  };
}

export function toAdminUser(r: AdminUserRow): AdminUser {
  return {
    id: r.id,
    legajo: r.legajo,
    email: r.email,
    nombre: r.nombre,
    rolId: r.rol_id,
    activo: r.activo,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function firstOrNull<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export function toPuntoVenta(r: PuntoVentaRow): PuntoVenta {
  const com = r.comercios ?? null;
  const cli = firstOrNull(com?.clientes);
  return {
    id: r.id,
    comercioId: r.comercio_id,
    nombre: r.nombre,
    estado: r.estado as PuntoVenta["estado"],
    createdAt: r.created_at,
    tipo: (r as PuntoVentaRow).tipo ?? null,
    cajero: (r as PuntoVentaRow).cajero ?? null,
    qrUrl: (r as PuntoVentaRow).qr_url ?? null,
    alias: (r as PuntoVentaRow).alias ?? null,
    comercio: com
      ? {
          id: com.id,
          usuario: com.usuario,
          legajo: com.legajo,
          clienteNombre: cli?.nombre ?? undefined,
          clienteCorreo: cli?.correo ?? undefined,
        }
      : null,
  };
}

export function toComercio(r: ComercioRow): Comercio {
  const cli = firstOrNull(r.clientes);
  const cat = firstOrNull(r.codigos_categoria);
  const pdvs = (r.puntos_venta ?? []) as PuntoVentaRow[];
  const adminUser = firstOrNull(r.admin_users);
  return {
    id: r.id,
    usuario: r.usuario,
    legajo: r.legajo,
    nombreComercio: (r as unknown as { nombre_comercio?: string | null }).nombre_comercio ?? null,
    cliente: cli
      ? {
          legajo: cli.legajo,
          nombre: cli.nombre,
          cuit: cli.cuit,
          taxId: cli.tax_id ?? null,
          tipoPersona: cli.tipo_persona,
          correo: cli.correo,
        }
      : null,
    categoriaId: r.categoria_id,
    categoria: cat
      ? {
          id: cat.id,
          codigo: cat.codigo,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          estado: cat.estado,
          createdAt: cat.created_at,
          updatedAt: cat.updated_at,
        }
      : null,
    nivel: r.nivel,
    estado: r.estado,
    ejecutivoResponsableId:
      (r as unknown as { ejecutivo_responsable_id?: string | null }).ejecutivo_responsable_id ??
      null,
    ejecutivo: adminUser
      ? {
          id: adminUser.id,
          nombre: adminUser.nombre,
          email: adminUser.email,
        }
      : null,
    siteId: (r as unknown as { site_id?: string | null }).site_id ?? null,
    puntosVenta: pdvs.map(toPuntoVenta),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toCodigoCategoria(r: CodigoCategoriaRow): CodigoCategoria {
  return {
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion,
    estado: r.estado,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toApiUsuario(r: ApiUsuarioRow): ApiUsuario {
  return {
    id: r.id,
    codigoUsuarioApi: r.codigo_usuario_api,
    usuario: r.usuario,
    nombreCompleto: r.nombre_completo,
    estado: r.estado,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toApiEndpoint(r: ApiEndpointRow): ApiEndpoint {
  return {
    id: r.id,
    nombre: r.nombre,
    path: r.path,
    metodo: r.metodo,
    descripcion: r.descripcion,
    grupo: r.grupo,
    estado: r.estado,
    rec: r.rec,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toApiRestriccion(r: ApiRestriccionRow): ApiRestriccion {
  const u = firstOrNull(r.api_usuarios);
  return {
    id: r.id,
    apiUsuarioId: r.api_usuario_id,
    apiUsuario: u
      ? {
          id: u.id,
          codigoUsuarioApi: u.codigo_usuario_api,
          usuario: u.usuario,
          nombreCompleto: u.nombre_completo,
          estado: u.estado,
        }
      : null,
    estado: r.estado,
    fechaCreacion: r.fecha_creacion,
    fechaExpiracion: r.fecha_expiracion,
    createdAt: r.created_at,
  };
}

export function toIntegracion(r: IntegracionRow): Integracion {
  return {
    id: r.id,
    nombre: r.nombre,
    proveedor: r.proveedor,
    createdAt: r.created_at,
  };
}

export function toCanalNotificacion(r: CanalNotificacionRow): CanalNotificacion {
  return {
    id: r.id,
    nombre: r.nombre,
    tipo: r.tipo,
    configuracion: r.configuracion,
    activo: r.activo,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toEventoNotificacion(
  r: EventoNotificacionRow & {
    codigos_error?: { codigo: string; mensaje: string }[] | null;
  },
): EventoNotificacion {
  const ce = Array.isArray(r.codigos_error) ? r.codigos_error[0] : null;
  return {
    id: r.id,
    tipo: r.tipo,
    codigoErrorId: r.codigo_error_id,
    titulo: r.titulo,
    mensaje: r.mensaje,
    audiencia: r.audiencia,
    canal: r.canal,
    estadoEntrega: r.estado_entrega,
    fecha: r.fecha,
    metadata: r.metadata,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    codigoError: ce ? { codigo: ce.codigo, mensaje: ce.mensaje } : null,
  };
}
