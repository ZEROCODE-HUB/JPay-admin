import { brand } from "@/brand/brand";

export type KbEntry = {
  keywords: string[];
  response: string;
};

export const KB: KbEntry[] = [
  {
    keywords: [
      "transacción",
      "movimiento",
      "estado",
      "SPEI",
      "en progreso",
      "aprobado",
      "rechazado",
      "pendiente",
      "saldo",
      "recaudadora",
    ],
    response: `Una transacción nace EN PROGRESO: el saldo se descuenta para el cliente, pero el dinero aún no salió realmente. La plataforma espera la confirmación de Cobre. Si confirma, la transferencia SPEI queda con su clave de rastreo —prueba de salida— y pasa a APROBADO. Si no, pasa a RECHAZADO y el saldo se revierte. ${brand.shortName} solo disponibiliza saldos; la verdad de si el dinero se movió vive en la cuenta en Cobre.`,
  },
  {
    keywords: [
      "clave de rastreo",
      "buscar spei",
      "transferencia spei",
      "buscar depósito",
      "buscar transferencia",
      "consultas frecuentes",
    ],
    response:
      "En Administración → Soporte → Consultas frecuentes puedes buscar un depósito o una transferencia SPEI por clave de rastreo, TXID o ID de Cobre. El resultado muestra el cliente, el monto, el estado y los datos de la contraparte.",
  },
  {
    keywords: ["alerta", "bloqueo", "compliance", "suspender", "suspensión", "cuenta bloqueada"],
    response:
      "Alerta = solo notifica, queda pendiente de revisión manual. Bloqueo = suspende la cuenta automáticamente hasta revisión de compliance.",
  },
  {
    keywords: ["parámetros de alertas", "umbral alertas", "límite depósitos", "reglas de alerta"],
    response:
      "General → Alertas → Parámetros de alertas: se configuran los umbrales y reglas que generan alertas (por ejemplo 'Límite de depósitos excedidos'). Las alertas solo notifican y quedan pendientes de revisión manual; no suspenden la cuenta por sí solas.",
  },
  {
    keywords: ["parámetros de bloqueos", "umbral bloqueo", "bloqueo automático"],
    response:
      "General → Alertas → Parámetros de bloqueos: se configuran los umbrales que activan el bloqueo automático de una cuenta hasta revisión de compliance. A diferencia de las alertas, un bloqueo sí suspende la cuenta.",
  },
  {
    keywords: [
      "listado de bloqueos",
      "lista de bloqueos",
      "cuentas bloqueadas",
      "gestionar bloqueos",
      "bloqueos activos",
    ],
    response:
      "General → Alertas → Listado de bloqueos: gestión de cuentas bloqueadas automáticamente. Desde aquí se revisan y administran los bloqueos generados por los parámetros de bloqueo.",
  },
  {
    keywords: ["comercios", "comercio", "pago por referencia", "gestión de comercios"],
    response:
      "El menú está agrupado por lo que quieres hacer:\n\n• Clientes: clientes, comercios (alta, edición y canales) y usuarios con CLABE.\n• Cobros: depósitos SPEI, depósitos sin asignar, links de pago (Ecart Pay), suscripciones y domiciliación, y POS físico.\n• Envíos: aprobaciones pendientes, transferencias y conversiones a dólares.\n• Control: conciliación, contracargos y reembolsos, alertas y bloqueos, y todos los movimientos.\n• Finanzas JPay: comisiones, fondos y reportes.\n• Sistema: integraciones, salud de módulos, notificaciones, usuarios backoffice, soporte, comunicación de incidentes y APIs externas.",
  },
  {
    keywords: [
      "gestion de comercios",
      "alta de comercio",
      "nuevo comercio",
      "asociar canal",
      "desasociar",
      "suspender comercio",
    ],
    response:
      "Comercios (Clientes → Comercios) es el listado centralizado de todos los comercios. Desde aquí se puede: crear un comercio nuevo (usuario, número de cliente, nombre, categoría, nivel, estado), editar, ver el detalle con sus canales y puntos de venta, y eliminar. También se activa o suspende el comercio. Los cambios se reflejan en las demás vistas de Comercios.",
  },
  {
    keywords: ["link de pago", "link-pago", "cobrar link"],
    response:
      "Los links de pago permiten cobrar mediante un link generado desde el portal de empresas (Ecart Pay). En Cobros → Links de pago se ven los links creados, su estado y sus pagos.",
  },
  {
    keywords: ["reportes", "reporte", "administración reportes"],
    response:
      "En Administración → Reportes hay un hub con tarjetas para cada tipo: Cobros con Ecart Pay, Reportes de Comisiones y Actividad de Usuarios. Cada uno abre su propia vista con tablas, filtros y descargas.",
  },
  {
    keywords: ["comisiones", "reporte en curso", "período comisiones", "reportes de comisiones"],
    response:
      "Reportes de Comisiones: un reporte por período (primer día de mes). El período actual se marca como 'Reporte en curso' (badge y banner), con las comisiones acumuladas hasta el momento.",
  },
  {
    keywords: [
      "actividad de usuarios",
      "actividad usuarios",
      "legajo",
      "reporte actividad",
      "actividad backoffice",
    ],
    response:
      "Actividad de Usuarios: se busca por Número de cliente y rango de fechas. La tabla muestra Número de cliente, Email, Fecha, Hora, Tipo de transacción, Monto, Estado, Nombre, Destino, RFC, Destinatario, CLABE y CLABE del cliente; se puede exportar a Excel con esos mismos campos.",
  },
  {
    keywords: [
      "usuarios backoffice",
      "roles",
      "personal",
      "administración usuarios",
      "cambiar contraseña",
      "staff",
      "equipo",
    ],
    response:
      "Administración → Usuarios backoffice: gestión del personal interno que opera el panel. Desde aquí se administran las cuentas (nombre, apellido, email, rol y estado), se puede ver el detalle, editar, cambiar la contraseña y eliminar usuarios. Los estados posibles incluyen Activado, Desactivado, No verificado, Pendiente de verificación de email, Suspendido y Pendiente de validación.",
  },
  {
    keywords: [
      "roles y permisos",
      "rol admin",
      "rol compliance",
      "rol management",
      "rol accounting",
      "rol reader",
      "permisos",
      "recursos",
    ],
    response:
      "Administración → Usuarios → Roles y permisos: define los roles del backoffice y sus permisos por recurso (Usuarios, Movimientos, Alertas, Soporte, Backoffice, Reportes, Registros, Módulos, Configuración, Incidentes). Cada permiso tiene Leer, Modificar, Crear y Borrar. Roles base: Admin (todo), Compliance (lectura + modifica Alertas/Usuarios), Management (lectura + modifica todo salvo Configuración, crea Reportes/Incidentes), Accounting (solo lectura de Movimientos/Reportes/Registros), Reader (solo lectura) y User (sin permisos). Se pueden crear y editar roles.",
  },
  {
    keywords: [
      "registros",
      "fondos",
      "actividad registros",
      "administración registros",
      "fondos por usuario",
      "subcuentas",
    ],
    response:
      "Administración → Registros → Fondos por usuario: listado de los fondos de cada usuario con sus subcuentas (un mismo número de cliente puede tener varias subcuentas, cada una con su CLABE y su saldo). Muestra Número de cliente, Email, Nombre, Subcuenta, CLABE, Disponible, Retenido y Estado. Permite ver el detalle de cada fondo y descargar el Excel.",
  },
  {
    keywords: [
      "total de fondos",
      "control crítico",
      "diferencia banco",
      "formula 1",
      "formula 2",
      "interno de usuarios",
      "impuestos cobrados",
    ],
    response: `Administración → Registros → Total de fondos: control crítico que detecta cuándo ${brand.name} informa a los clientes un monto mayor al real en la cuenta recaudadora. Usa dos fórmulas en MXN:\n\n• Fórmula 1: Interno de usuarios + Impuestos cobrados − Banco.\n• Fórmula 2: Interno de usuarios (nuevo) − Banco.\n\nSi la diferencia da negativa se marca en rojo; el objetivo es que siempre cuadre con el banco.`,
  },
  {
    keywords: [
      "soporte",
      "consultas frecuentes",
      "bloqueo de funciones",
      "administración soporte",
      "bloqueo por función",
      "habilitar función",
      "deshabilitar función",
    ],
    response:
      "Administración → Soporte:\n\n• Consultas frecuentes: busca un depósito o una transferencia SPEI por clave de rastreo, TXID o ID de Cobre.\n• Bloqueo de funciones: habilita/deshabilita funcionalidades de la plataforma para todos o para un usuario puntual. Los tipos de bloqueo son Login, Registro, Depósito, Retiro, Transferencia interna y Comprar.",
  },
  {
    keywords: ["usuarios general", "personas físicas", "morales", "clabe", "comisiones usuario"],
    response:
      "Clientes → Clientes: es el ABC de las cuentas de los clientes de la plataforma, con pestañas:\n\n• Personas físicas: listado de clientes (número de cliente, correo, nombres, apellidos, estado, fecha de registro) con acciones como suspender o eliminar.\n• Personas morales: gestión de empresas.\n• Usuarios con CLABE: subcuentas con su CLABE (la asigna Cobre).\n\nLas comisiones por cliente se cargan en Finanzas JPay → Comisiones → Carga por cliente.",
  },
  {
    keywords: [
      "ficha de usuario",
      "detalle usuario",
      "ver usuario",
      "perfil usuario",
      "consulta usuario por número de cliente",
    ],
    response:
      "General → Usuarios → Ficha de usuario: desde el listado de personas físicas se accede a la ficha completa de un usuario (ruta /admin/general/usuarios/$legajo) con toda su información y operaciones.",
  },
  {
    keywords: [
      "personas morales",
      "empresas",
      "reactivar persona moral",
      "reactivar juridica",
      "gestión de empresas",
    ],
    response:
      "General → Usuarios → Personas morales: gestión de las empresas registradas en la plataforma, incluyendo la reactivación de personas morales.",
  },
  {
    keywords: ["usuarios con clabe", "clabe de usuario", "subcuenta clabe", "alta en cobre"],
    response:
      "General → Usuarios → Usuarios con CLABE: listado de las subcuentas con su CLABE. La CLABE la asigna Cobre al aprobar el alta del cliente (detalle del cliente → pestaña Cobre); desde aquí se puede habilitar o deshabilitar cada subcuenta.",
  },
  {
    keywords: [
      "carga de comisiones",
      "comisiones por usuario",
      "deshabilitar comisión",
      "asignar comisión",
    ],
    response:
      "Finanzas JPay → Comisiones tiene tres pestañas:\n\n• Ingresos JPay: cuánto le corresponde a JPay por comercio y producto, y los pagos recibidos.\n• Cobradas: movimientos en los que se cobró comisión.\n• Carga por cliente: asignación de comisiones a cada cliente, con la opción de deshabilitar la comisión de un cliente puntual.",
  },
  {
    keywords: [
      "movimientos",
      "movimientos general",
      "tipos de movimiento",
      "8 tipos",
      "todos los movimientos",
    ],
    response:
      "General → Movimientos: agrupa todos los movimientos de la plataforma en pestañas:\n\n• Todos los movimientos: historial completo (depósitos, transferencias SPEI, conversiones a dólares, comisiones, etc.) con estado APROBADO / EN PROGRESO / RECHAZADO y detalle por movimiento.\n• Depósitos, Transferencias y Conversiones a dólares: cada pestaña filtra el historial por tipo. Las comisiones cobradas están en Finanzas JPay → Comisiones.",
  },
  {
    keywords: [
      "alertas general",
      "parámetros de alertas",
      "configuración de alertas",
      "listado de alertas",
      "alertas pendientes",
      "revisar alerta",
      "marcar revisada",
    ],
    response:
      "General → Alertas: listado de alertas (depósito excedido, intento fallido, transferencia repetida, horario inusual, etc.) con estado Pendiente/Revisado/Resuelto. Incluye pestañas para ver el detalle, revisar y resolver cada alerta, y la configuración de Parámetros de alertas y Parámetros de bloqueos.",
  },
  {
    keywords: [
      "configuración",
      "integraciones",
      "logins",
      "configuraciones",
      "gestor de integraciones",
    ],
    response:
      "Configuración:\n\n• Gestor de Integraciones (Configuración): panel de estado de las integraciones (Cobre, Ecart Pay) con salud, última/próxima ejecución y ejecuciones totales. En modo desarrollador se ven controles técnicos (configurar logs, ejecutar todos o uno específico, actualizar datos).\n• Logins configurados: programación (cron), última/próxima ejecución, tiempo restante y ejecuciones de cada login.\n• País y proveedores: configuración de México, sus módulos, la conexión con los proveedores, webhooks, umbrales de aprobación, MSI y simuladores. La conciliación y las disputas están en Control.",
  },
  {
    keywords: [
      "logins configurados",
      "programación cron",
      "próxima ejecución",
      "ejecuciones login",
    ],
    response:
      "Configuración → Logins configurados: detalle de cada login de integración con su programación (cron, por ej. */15 * * * *), última y próxima ejecución, tiempo restante y total de ejecuciones.",
  },
  {
    keywords: [
      "apis externas",
      "endpoints",
      "restricciones api",
      "apis comercios",
      "super accounts",
      "subaccounts",
      "sub cuentas",
    ],
    response:
      "Comercios → APIs externas: gestión de la integración con los comercios:\n\n• Usuarios: usuarios de API habilitados, con su estado de integración.\n• Endpoints: endpoints de integración (incluye SubAccounts y el flag REC Sí/No) y su estado.\n• Restricciones: restricciones de acceso para los comercios.\n• Resolvers: integraciones con bancos/entidades.",
  },
  {
    keywords: [
      "endpoints",
      "subaccounts",
      "rec",
      "endpoint activar",
      "endpoint desactivar",
      "flag rec",
    ],
    response:
      "Comercios → APIs externas → Endpoints: lista los endpoints de integración disponibles (por ejemplo SubAccounts) con un flag REC (Sí/No). Se pueden activar, desactivar y ver el detalle de cada endpoint.",
  },
  {
    keywords: [
      "restricciones",
      "nueva restricción",
      "editar restricción",
      "restricciones api",
      "restringir comercio",
    ],
    response:
      "Comercios → APIs externas → Restricciones: restricciones de acceso/configuración para los comercios. Se pueden crear con 'Nueva restricción', editar y eliminar cada una.",
  },
  {
    keywords: [
      "módulos",
      "salud de módulos",
      "sistema módulos",
      "estado módulos",
      "estado servicios",
      "kyc",
      "kyb",
      "api pública",
      "webhooks",
    ],
    response:
      "Sistema → Salud de módulos: panel de estado de los servicios/módulos de la plataforma (API Pública, Procesador SPEI / CLABE, POS físico, Webhooks, Conciliación Batch, Módulo de Pagos, KYC/KYB, Notificaciones, Ecart Pay, Transferencias). Cada módulo muestra Operativo/Degradado/Caído y su latencia, con estadísticas generales (totales, operativos, degradados, caídos y latencia promedio).",
  },
  {
    keywords: [
      "incidentes",
      "comunicación de incidentes",
      "mensaje de difusión",
      "nuevo mensaje",
      "segmento",
      "mantenimiento",
      "borrador",
      "enviado",
    ],
    response:
      "Comunicación → Incidentes: notificación proactiva a clientes ante incidentes o mantenimientos. Permite crear un 'Nuevo mensaje de difusión' (asunto, contenido y segmento: Todos, Módulo POS físico, Módulo Link de pago, Comercios, Usuarios activos). Hay un historial con estado Enviado o Borrador, y se puede ver el detalle de cada mensaje.",
  },
  {
    keywords: [
      "notificaciones",
      "centro de notificaciones",
      "eventos de negocio",
      "destinatarios",
      "canal telegram",
      "canal whatsapp",
      "canal email",
      "entregado",
    ],
    response:
      "Sistema → Notificaciones: centro de notificaciones de eventos de negocio (timeout con un proveedor, procesador de pagos caído, acceso sospechoso, KYC vencido, etc.). Cada evento muestra a quién afecta, destinatarios (Admin, Cliente o Ambos), canal (Email, Telegram o WhatsApp) y si fue entregado.",
  },
  {
    keywords: [
      "aprobaciones",
      "aprobar envío",
      "aprobar transferencia",
      "aprobar lote",
      "envíos pendientes",
    ],
    response:
      "Envíos → Aprobaciones pendientes: transferencias SPEI, envíos en dólares y lotes que pasan el monto de aprobación de Cobre. Al aprobar sale a Cobre; al rechazar se libera el saldo. El contador del menú y del Dashboard muestra cuántos esperan.",
  },
  {
    keywords: ["depósitos sin asignar", "sin asignar", "devolver depósito", "depósito sin dueño"],
    response:
      "Cobros → Depósitos sin asignar: SPEI que llegó a un Balance o CLABE que no es de ningún comercio. Se pueden devolver al remitente (el monto completo, una sola vez).",
  },
  {
    keywords: ["conciliación", "conciliar", "diferencias", "cuadre"],
    response:
      "Control → Conciliación: cruce diario de las operaciones de JPay con Ecart Pay y con Cobre (una pestaña por proveedor), con la bandeja de diferencias abiertas y el botón para conciliar en el momento.",
  },
  {
    keywords: ["contracargos", "contracargo", "reembolsos", "disputas", "chargeback"],
    response:
      "Control → Contracargos y reembolsos: contracargos que abrieron los bancos en Ecart Pay y reembolsos que hay que verificar a mano.",
  },
];
