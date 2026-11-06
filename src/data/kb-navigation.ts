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
   - Total de fondos — Admin Panel  (/admin/administracion/registros/total)
   - Reportes — Admin Panel  (/admin/administracion/reportes)
   - Soporte  (/admin/administracion/soporte)
   - Bloqueo de funciones — Admin Panel  (/admin/administracion/soporte/bloqueo)
   - Usuarios  (/admin/administracion/usuarios)
   - Actividad en backoffice — Admin Panel  (/admin/administracion/usuarios/actividad)
   - Roles y permisos — Admin Panel  (/admin/administracion/usuarios/roles)

• Cobros:
   - ${pageTitle("Depósitos sin asignar — Admin")}  (/admin/cobros/sin-asignar)

• Comercios:
   - ${pageTitle("Comercios — Admin")}  (/admin/comercios)
   - ${pageTitle("APIs externas — Admin")}  (/admin/comercios/apis)
   - ${pageTitle("APIs externas — Endpoints — Admin")}  (/admin/comercios/apis/endpoints)
   - ${pageTitle("APIs externas — Restricciones — Admin")}  (/admin/comercios/apis/restricciones)
   - Comisiones-jpay  (/admin/comercios/comisiones-jpay)
   - ${pageTitle("Gestión — Admin")}  (/admin/comercios/gestion)
   - ${pageTitle("Códigos de categoría — Admin")}  (/admin/comercios/gestion/categoria)
   - ${pageTitle("Links de pago — Admin")}  (/admin/comercios/link-pago)
   - ${pageTitle("POS físico — Admin")}  (/admin/comercios/pos)
   - ${pageTitle("Suscripciones y domiciliación — Admin")}  (/admin/comercios/recurrentes)

• Configuración:
   - ${pageTitle("Configuración — Admin")}  (/admin/configuracion)
   - ${pageTitle("Logins configurados — Admin")}  (/admin/configuracion/logins)
   - ${pageTitle("País y proveedores — Admin")}  (/admin/configuracion/paises)

• Control:
   - ${pageTitle("Conciliación — Admin")}  (/admin/control/conciliacion)
   - ${pageTitle("Conciliación con Cobre — Admin")}  (/admin/control/conciliacion/cobre)
   - ${pageTitle("Conciliación con Ecart Pay — Admin")}  (/admin/control/conciliacion/ecartpay)
   - ${pageTitle("Contracargos y reembolsos — Admin")}  (/admin/control/disputas)

• Envios:
   - ${pageTitle("Aprobaciones pendientes — Admin")}  (/admin/envios/aprobaciones)

• Finanzas:
   - ${pageTitle("Comisiones — Admin")}  (/admin/finanzas/comisiones)
   - ${pageTitle("Carga de comisiones — Admin")}  (/admin/finanzas/comisiones/carga)
   - ${pageTitle("Comisiones cobradas — Admin")}  (/admin/finanzas/comisiones/cobradas)

• General:
   - ${pageTitle("Alertas y bloqueos — Admin")}  (/admin/general/alertas)
   - ${pageTitle("Listado de bloqueos — Admin")}  (/admin/general/alertas/bloqueos)
   - ${pageTitle("Parámetros de alertas — Admin")}  (/admin/general/alertas/parametros-alertas)
   - ${pageTitle("Parámetros de bloqueos — Admin")}  (/admin/general/alertas/parametros-bloqueos)
   - ${pageTitle("Movimientos — Admin")}  (/admin/general/movimientos)
   - Comisiones  (/admin/general/movimientos/comisiones)
   - ${pageTitle("Conversiones — Movimientos — Admin")}  (/admin/general/movimientos/conversiones)
   - ${pageTitle("Depósitos — Movimientos — Admin")}  (/admin/general/movimientos/depositos)
   - ${pageTitle("Transferencias — Movimientos — Admin")}  (/admin/general/movimientos/transferencias)
   - ${pageTitle("Clientes — Admin")}  (/admin/general/usuarios)
   - ${pageTitle("Ficha de cliente — Admin")}  (/admin/general/usuarios/$legajo)
   - ${pageTitle("Usuarios con CLABE — Usuarios — Admin")}  (/admin/general/usuarios/clabe)
   - Comisiones  (/admin/general/usuarios/comisiones)
   - ${pageTitle("Personas morales — Usuarios — Admin")}  (/admin/general/usuarios/juridicas)

• Comunicación:
   - Comunicación de incidentes — Admin Panel  (/admin/incidentes)

• Sistema:
   - ${pageTitle("Salud de módulos — Admin")}  (/admin/modulos)

• Sistema:
   - ${pageTitle("Sistema de Notificaciones — Admin")}  (/admin/notificaciones)

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
  { path: "/admin/administracion/registros/total", title: "Total de fondos — Admin Panel" },
  { path: "/admin/administracion/reportes", title: "Reportes — Admin Panel" },
  { path: "/admin/administracion/soporte", title: "Soporte" },
  { path: "/admin/administracion/soporte/bloqueo", title: "Bloqueo de funciones — Admin Panel" },
  { path: "/admin/administracion/usuarios", title: "Usuarios" },
  { path: "/admin/administracion/usuarios/actividad", title: "Actividad en backoffice — Admin Panel" },
  { path: "/admin/administracion/usuarios/roles", title: "Roles y permisos — Admin Panel" },
  { path: "/admin/cobros/sin-asignar", title: pageTitle("Depósitos sin asignar — Admin") },
  { path: "/admin/comercios", title: pageTitle("Comercios — Admin") },
  { path: "/admin/comercios/apis", title: pageTitle("APIs externas — Admin") },
  { path: "/admin/comercios/apis/endpoints", title: pageTitle("APIs externas — Endpoints — Admin") },
  { path: "/admin/comercios/apis/restricciones", title: pageTitle("APIs externas — Restricciones — Admin") },
  { path: "/admin/comercios/comisiones-jpay", title: "Comisiones-jpay" },
  { path: "/admin/comercios/gestion", title: pageTitle("Gestión — Admin") },
  { path: "/admin/comercios/gestion/categoria", title: pageTitle("Códigos de categoría — Admin") },
  { path: "/admin/comercios/link-pago", title: pageTitle("Links de pago — Admin") },
  { path: "/admin/comercios/pos", title: pageTitle("POS físico — Admin") },
  { path: "/admin/comercios/recurrentes", title: pageTitle("Suscripciones y domiciliación — Admin") },
  { path: "/admin/configuracion", title: pageTitle("Configuración — Admin") },
  { path: "/admin/configuracion/logins", title: pageTitle("Logins configurados — Admin") },
  { path: "/admin/configuracion/paises", title: pageTitle("País y proveedores — Admin") },
  { path: "/admin/control/conciliacion", title: pageTitle("Conciliación — Admin") },
  { path: "/admin/control/conciliacion/cobre", title: pageTitle("Conciliación con Cobre — Admin") },
  { path: "/admin/control/conciliacion/ecartpay", title: pageTitle("Conciliación con Ecart Pay — Admin") },
  { path: "/admin/control/disputas", title: pageTitle("Contracargos y reembolsos — Admin") },
  { path: "/admin/envios/aprobaciones", title: pageTitle("Aprobaciones pendientes — Admin") },
  { path: "/admin/finanzas/comisiones", title: pageTitle("Comisiones — Admin") },
  { path: "/admin/finanzas/comisiones/carga", title: pageTitle("Carga de comisiones — Admin") },
  { path: "/admin/finanzas/comisiones/cobradas", title: pageTitle("Comisiones cobradas — Admin") },
  { path: "/admin/general/alertas", title: pageTitle("Alertas y bloqueos — Admin") },
  { path: "/admin/general/alertas/bloqueos", title: pageTitle("Listado de bloqueos — Admin") },
  { path: "/admin/general/alertas/parametros-alertas", title: pageTitle("Parámetros de alertas — Admin") },
  { path: "/admin/general/alertas/parametros-bloqueos", title: pageTitle("Parámetros de bloqueos — Admin") },
  { path: "/admin/general/movimientos", title: pageTitle("Movimientos — Admin") },
  { path: "/admin/general/movimientos/comisiones", title: "Comisiones" },
  { path: "/admin/general/movimientos/conversiones", title: pageTitle("Conversiones — Movimientos — Admin") },
  { path: "/admin/general/movimientos/depositos", title: pageTitle("Depósitos — Movimientos — Admin") },
  { path: "/admin/general/movimientos/transferencias", title: pageTitle("Transferencias — Movimientos — Admin") },
  { path: "/admin/general/usuarios", title: pageTitle("Clientes — Admin") },
  { path: "/admin/general/usuarios/$legajo", title: pageTitle("Ficha de cliente — Admin") },
  { path: "/admin/general/usuarios/clabe", title: pageTitle("Usuarios con CLABE — Usuarios — Admin") },
  { path: "/admin/general/usuarios/comisiones", title: "Comisiones" },
  { path: "/admin/general/usuarios/juridicas", title: pageTitle("Personas morales — Usuarios — Admin") },
  { path: "/admin/incidentes", title: "Comunicación de incidentes — Admin Panel" },
  { path: "/admin/modulos", title: pageTitle("Salud de módulos — Admin") },
  { path: "/admin/notificaciones", title: pageTitle("Sistema de Notificaciones — Admin") },
  { path: "/administracion/registros", title: "Registros" },
  { path: "/administracion/reportes", title: "Reportes" },
  { path: "/administracion/soporte", title: "Soporte" },
  { path: "/administracion/usuarios", title: "Usuarios" },
];
