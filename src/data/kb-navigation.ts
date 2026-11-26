/* eslint-disable */
// Archivo generado automáticamente por scripts/generate-kb-nav.mjs (disparado por el hook git post-commit).
// No editar manualmente: se regenera en cada commit a partir de src/routeTree.gen.ts.
// Los títulos de marca se emiten como pageTitle(): el nombre sale de src/brand/brand.json.
import { pageTitle } from "@/brand/brand";

export const KB_NAVIGATION = `Estructura actual del panel administrativo (se genera automáticamente en cada cambio):

• Root:
   - Admin  (/admin)

• Administración:
   - Registros  (/admin/administracion/registros)
   - Reportes — Admin Panel  (/admin/administracion/reportes)
   - Soporte  (/admin/administracion/soporte)
   - Usuarios  (/admin/administracion/usuarios)
   - Actividad en backoffice — Admin Panel  (/admin/administracion/usuarios/actividad)
   - Roles y permisos — Admin Panel  (/admin/administracion/usuarios/roles)

• Cobros:
   - Sin-asignar  (/admin/cobros/sin-asignar)

• Comercios:
   - ${pageTitle("Comercios — Admin")}  (/admin/comercios)
   - ${pageTitle("APIs externas — Admin")}  (/admin/comercios/apis)
   - ${pageTitle("APIs externas — Endpoints — Admin")}  (/admin/comercios/apis/endpoints)
   - ${pageTitle("APIs externas — Restricciones — Admin")}  (/admin/comercios/apis/restricciones)
   - Comisiones-jpay  (/admin/comercios/comisiones-jpay)
   - ${pageTitle("Gestión — Admin")}  (/admin/comercios/gestion)
   - ${pageTitle("Códigos de categoría — Admin")}  (/admin/comercios/gestion/categoria)
   - ${pageTitle("Link de pago — Admin")}  (/admin/comercios/link-pago)
   - ${pageTitle("POS físico — Admin")}  (/admin/comercios/pos)
   - ${pageTitle("Suscripciones y domiciliación — Admin")}  (/admin/comercios/recurrentes)

• Configuración:
   - ${pageTitle("Configuración — Admin")}  (/admin/configuracion)
   - ${pageTitle("Configuraciones de login — Admin")}  (/admin/configuracion/configuraciones)
   - ${pageTitle("Logins configurados — Admin")}  (/admin/configuracion/logins)
   - ${pageTitle("País y proveedores — Admin")}  (/admin/configuracion/paises)

• Control:
   - $  (/admin/control/$)

• Envios:
   - Aprobaciones  (/admin/envios/aprobaciones)

• Finanzas:
   - Comisiones  (/admin/finanzas/comisiones)
   - Carga  (/admin/finanzas/comisiones/carga)
   - Cobradas  (/admin/finanzas/comisiones/cobradas)

• General:
   - ${pageTitle("Alertas — Admin")}  (/admin/general/alertas)
   - Listado de bloqueos — Admin Panel  (/admin/general/alertas/bloqueos)
   - Parámetros de alertas — Admin Panel  (/admin/general/alertas/parametros-alertas)
   - Parámetros de bloqueos — Admin Panel  (/admin/general/alertas/parametros-bloqueos)
   - ${pageTitle("Movimientos — Admin")}  (/admin/general/movimientos)
   - ${pageTitle("Cobro de comisiones — Movimientos — Admin")}  (/admin/general/movimientos/comisiones)
   - ${pageTitle("Conversiones — Movimientos — Admin")}  (/admin/general/movimientos/conversiones)
   - ${pageTitle("Depósitos — Movimientos — Admin")}  (/admin/general/movimientos/depositos)
   - ${pageTitle("Transferencias — Movimientos — Admin")}  (/admin/general/movimientos/transferencias)
   - ${pageTitle("Solicitudes de contacto — Admin")}  (/admin/general/solicitudes)
   - ${pageTitle("Usuarios — Admin")}  (/admin/general/usuarios)
   - ${pageTitle("Ficha de cliente — Admin")}  (/admin/general/usuarios/$legajo)
   - ${pageTitle("Usuarios con CLABE — Usuarios — Admin")}  (/admin/general/usuarios/clabe)
   - ${pageTitle("Carga de comisiones — Usuarios — Admin")}  (/admin/general/usuarios/comisiones)
   - ${pageTitle("Personas morales — Usuarios — Admin")}  (/admin/general/usuarios/juridicas)

• Comunicación:
   - Comunicación de incidentes — Admin Panel  (/admin/incidentes)

• Sistema:
   - ${pageTitle("Salud de módulos — Admin")}  (/admin/modulos)

• Sistema:
   - ${pageTitle("Sistema de Notificaciones — Admin")}  (/admin/notificaciones)

• Sistema:
   - ${pageTitle("Herramientas de prueba — Admin")}  (/admin/sistema/pruebas)

• Registros:
   - Registros  (/administracion/registros)

• Reportes:
   - Reportes  (/administracion/reportes)

• Soporte:
   - Soporte  (/administracion/soporte)

• Usuarios:
   - Usuarios  (/administracion/usuarios)

`;

export const KB_ROUTES: { path: string; title: string }[] = [
  { path: "/admin", title: "Admin" },
  { path: "/admin/administracion/registros", title: "Registros" },
  { path: "/admin/administracion/reportes", title: "Reportes — Admin Panel" },
  { path: "/admin/administracion/soporte", title: "Soporte" },
  { path: "/admin/administracion/usuarios", title: "Usuarios" },
  { path: "/admin/administracion/usuarios/actividad", title: "Actividad en backoffice — Admin Panel" },
  { path: "/admin/administracion/usuarios/roles", title: "Roles y permisos — Admin Panel" },
  { path: "/admin/cobros/sin-asignar", title: "Sin-asignar" },
  { path: "/admin/comercios", title: pageTitle("Comercios — Admin") },
  { path: "/admin/comercios/apis", title: pageTitle("APIs externas — Admin") },
  { path: "/admin/comercios/apis/endpoints", title: pageTitle("APIs externas — Endpoints — Admin") },
  { path: "/admin/comercios/apis/restricciones", title: pageTitle("APIs externas — Restricciones — Admin") },
  { path: "/admin/comercios/comisiones-jpay", title: "Comisiones-jpay" },
  { path: "/admin/comercios/gestion", title: pageTitle("Gestión — Admin") },
  { path: "/admin/comercios/gestion/categoria", title: pageTitle("Códigos de categoría — Admin") },
  { path: "/admin/comercios/link-pago", title: pageTitle("Link de pago — Admin") },
  { path: "/admin/comercios/pos", title: pageTitle("POS físico — Admin") },
  { path: "/admin/comercios/recurrentes", title: pageTitle("Suscripciones y domiciliación — Admin") },
  { path: "/admin/configuracion", title: pageTitle("Configuración — Admin") },
  { path: "/admin/configuracion/configuraciones", title: pageTitle("Configuraciones de login — Admin") },
  { path: "/admin/configuracion/logins", title: pageTitle("Logins configurados — Admin") },
  { path: "/admin/configuracion/paises", title: pageTitle("País y proveedores — Admin") },
  { path: "/admin/control/$", title: "$" },
  { path: "/admin/envios/aprobaciones", title: "Aprobaciones" },
  { path: "/admin/finanzas/comisiones", title: "Comisiones" },
  { path: "/admin/finanzas/comisiones/carga", title: "Carga" },
  { path: "/admin/finanzas/comisiones/cobradas", title: "Cobradas" },
  { path: "/admin/general/alertas", title: pageTitle("Alertas — Admin") },
  { path: "/admin/general/alertas/bloqueos", title: "Listado de bloqueos — Admin Panel" },
  { path: "/admin/general/alertas/parametros-alertas", title: "Parámetros de alertas — Admin Panel" },
  { path: "/admin/general/alertas/parametros-bloqueos", title: "Parámetros de bloqueos — Admin Panel" },
  { path: "/admin/general/movimientos", title: pageTitle("Movimientos — Admin") },
  { path: "/admin/general/movimientos/comisiones", title: pageTitle("Cobro de comisiones — Movimientos — Admin") },
  { path: "/admin/general/movimientos/conversiones", title: pageTitle("Conversiones — Movimientos — Admin") },
  { path: "/admin/general/movimientos/depositos", title: pageTitle("Depósitos — Movimientos — Admin") },
  { path: "/admin/general/movimientos/transferencias", title: pageTitle("Transferencias — Movimientos — Admin") },
  { path: "/admin/general/solicitudes", title: pageTitle("Solicitudes de contacto — Admin") },
  { path: "/admin/general/usuarios", title: pageTitle("Usuarios — Admin") },
  { path: "/admin/general/usuarios/$legajo", title: pageTitle("Ficha de cliente — Admin") },
  { path: "/admin/general/usuarios/clabe", title: pageTitle("Usuarios con CLABE — Usuarios — Admin") },
  { path: "/admin/general/usuarios/comisiones", title: pageTitle("Carga de comisiones — Usuarios — Admin") },
  { path: "/admin/general/usuarios/juridicas", title: pageTitle("Personas morales — Usuarios — Admin") },
  { path: "/admin/incidentes", title: "Comunicación de incidentes — Admin Panel" },
  { path: "/admin/modulos", title: pageTitle("Salud de módulos — Admin") },
  { path: "/admin/notificaciones", title: pageTitle("Sistema de Notificaciones — Admin") },
  { path: "/admin/sistema/pruebas", title: pageTitle("Herramientas de prueba — Admin") },
  { path: "/administracion/registros", title: "Registros" },
  { path: "/administracion/reportes", title: "Reportes" },
  { path: "/administracion/soporte", title: "Soporte" },
  { path: "/administracion/usuarios", title: "Usuarios" },
];
