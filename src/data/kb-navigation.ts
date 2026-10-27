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

• Comercios:
   - ${pageTitle("Comercios — Admin")}  (/admin/comercios)
   - ${pageTitle("APIs externas — Admin")}  (/admin/comercios/apis)
   - ${pageTitle("APIs externas — Endpoints — Admin")}  (/admin/comercios/apis/endpoints)
   - ${pageTitle("Resolvers — APIs externas — Admin")}  (/admin/comercios/apis/resolvers)
   - ${pageTitle("APIs externas — Restricciones — Admin")}  (/admin/comercios/apis/restricciones)
   - ${pageTitle("Gestión — Admin")}  (/admin/comercios/gestion)
   - ${pageTitle("Códigos de categoría — Admin")}  (/admin/comercios/gestion/categoria)
   - ${pageTitle("Métodos de pago — Gestión — Admin")}  (/admin/comercios/gestion/metodos-pago)
   - ${pageTitle("Impuestos — Admin")}  (/admin/comercios/impuestos)
   - ${pageTitle("Débitos y créditos — Admin")}  (/admin/comercios/impuestos/debitos-creditos)
   - ${pageTitle("Ingresos Brutos — Admin")}  (/admin/comercios/impuestos/ingresos-brutos)
   - ${pageTitle("Usuarios con impuestos — Admin")}  (/admin/comercios/impuestos/usuarios)
   - ${pageTitle("Link de pago — Admin")}  (/admin/comercios/link-pago)
   - ${pageTitle("Adelantos de Dinero — Links de Pago — Admin")}  (/admin/comercios/link-pago/adelantos)
   - ${pageTitle("Calendario de Acreditaciones — Links de Pago — Admin")}  (/admin/comercios/link-pago/calendario-acreditaciones)
   - ${pageTitle("Contracargos — Links de Pago — Admin")}  (/admin/comercios/link-pago/contracargos)
   - ${pageTitle("Lotes de Acreditación — Links de Pago — Admin")}  (/admin/comercios/link-pago/lotes)
   - ${pageTitle("Lotes de Venta — Links de Pago — Admin")}  (/admin/comercios/link-pago/lotes-venta)
   - ${pageTitle("Resumen general — Link de Pago — Admin")}  (/admin/comercios/link-pago/resumen)
   - ${pageTitle("Pagos con transferencia — Admin")}  (/admin/comercios/transferencia)

• Configuración:
   - ${pageTitle("Configuración — Admin")}  (/admin/configuracion)
   - ${pageTitle("Configuraciones de login — Admin")}  (/admin/configuracion/configuraciones)
   - ${pageTitle("Logins configurados — Admin")}  (/admin/configuracion/logins)

• General:
   - ${pageTitle("Alertas — Admin")}  (/admin/general/alertas)
   - Listado de bloqueos — Admin Panel  (/admin/general/alertas/bloqueos)
   - Parámetros de alertas — Admin Panel  (/admin/general/alertas/parametros-alertas)
   - Parámetros de bloqueos — Admin Panel  (/admin/general/alertas/parametros-bloqueos)
   - ${pageTitle("Movimientos — Admin")}  (/admin/general/movimientos)
   - ${pageTitle("Cobros QR — Movimientos — Admin")}  (/admin/general/movimientos/cobros-qr)
   - ${pageTitle("Cobro de comisiones — Movimientos — Admin")}  (/admin/general/movimientos/comisiones)
   - ${pageTitle("Depósitos — Movimientos — Admin")}  (/admin/general/movimientos/depositos)
   - ${pageTitle("Impuestos cobrados — Movimientos — Admin")}  (/admin/general/movimientos/impuestos)
   - ${pageTitle("Pagos QR — Movimientos — Admin")}  (/admin/general/movimientos/pagos-qr)
   - ${pageTitle("Pagos con tarjeta — Movimientos — Admin")}  (/admin/general/movimientos/pagos-tarjeta)
   - ${pageTitle("Retiros — Movimientos — Admin")}  (/admin/general/movimientos/retiros)
   - ${pageTitle("Usuarios — Admin")}  (/admin/general/usuarios)
   - ${pageTitle("Ficha de cliente — Admin")}  (/admin/general/usuarios/$legajo)
   - ${pageTitle("Carga de comisiones — Usuarios — Admin")}  (/admin/general/usuarios/comisiones)
   - ${pageTitle("Usuarios con CVU — Usuarios — Admin")}  (/admin/general/usuarios/cvu)
   - ${pageTitle("Personas jurídicas — Usuarios — Admin")}  (/admin/general/usuarios/juridicas)

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
  { path: "/admin/comercios", title: pageTitle("Comercios — Admin") },
  { path: "/admin/comercios/apis", title: pageTitle("APIs externas — Admin") },
  { path: "/admin/comercios/apis/endpoints", title: pageTitle("APIs externas — Endpoints — Admin") },
  { path: "/admin/comercios/apis/resolvers", title: pageTitle("Resolvers — APIs externas — Admin") },
  { path: "/admin/comercios/apis/restricciones", title: pageTitle("APIs externas — Restricciones — Admin") },
  { path: "/admin/comercios/gestion", title: pageTitle("Gestión — Admin") },
  { path: "/admin/comercios/gestion/categoria", title: pageTitle("Códigos de categoría — Admin") },
  { path: "/admin/comercios/gestion/metodos-pago", title: pageTitle("Métodos de pago — Gestión — Admin") },
  { path: "/admin/comercios/impuestos", title: pageTitle("Impuestos — Admin") },
  { path: "/admin/comercios/impuestos/debitos-creditos", title: pageTitle("Débitos y créditos — Admin") },
  { path: "/admin/comercios/impuestos/ingresos-brutos", title: pageTitle("Ingresos Brutos — Admin") },
  { path: "/admin/comercios/impuestos/usuarios", title: pageTitle("Usuarios con impuestos — Admin") },
  { path: "/admin/comercios/link-pago", title: pageTitle("Link de pago — Admin") },
  { path: "/admin/comercios/link-pago/adelantos", title: pageTitle("Adelantos de Dinero — Links de Pago — Admin") },
  { path: "/admin/comercios/link-pago/calendario-acreditaciones", title: pageTitle("Calendario de Acreditaciones — Links de Pago — Admin") },
  { path: "/admin/comercios/link-pago/contracargos", title: pageTitle("Contracargos — Links de Pago — Admin") },
  { path: "/admin/comercios/link-pago/lotes", title: pageTitle("Lotes de Acreditación — Links de Pago — Admin") },
  { path: "/admin/comercios/link-pago/lotes-venta", title: pageTitle("Lotes de Venta — Links de Pago — Admin") },
  { path: "/admin/comercios/link-pago/resumen", title: pageTitle("Resumen general — Link de Pago — Admin") },
  { path: "/admin/comercios/transferencia", title: pageTitle("Pagos con transferencia — Admin") },
  { path: "/admin/configuracion", title: pageTitle("Configuración — Admin") },
  { path: "/admin/configuracion/configuraciones", title: pageTitle("Configuraciones de login — Admin") },
  { path: "/admin/configuracion/logins", title: pageTitle("Logins configurados — Admin") },
  { path: "/admin/general/alertas", title: pageTitle("Alertas — Admin") },
  { path: "/admin/general/alertas/bloqueos", title: "Listado de bloqueos — Admin Panel" },
  { path: "/admin/general/alertas/parametros-alertas", title: "Parámetros de alertas — Admin Panel" },
  { path: "/admin/general/alertas/parametros-bloqueos", title: "Parámetros de bloqueos — Admin Panel" },
  { path: "/admin/general/movimientos", title: pageTitle("Movimientos — Admin") },
  { path: "/admin/general/movimientos/cobros-qr", title: pageTitle("Cobros QR — Movimientos — Admin") },
  { path: "/admin/general/movimientos/comisiones", title: pageTitle("Cobro de comisiones — Movimientos — Admin") },
  { path: "/admin/general/movimientos/depositos", title: pageTitle("Depósitos — Movimientos — Admin") },
  { path: "/admin/general/movimientos/impuestos", title: pageTitle("Impuestos cobrados — Movimientos — Admin") },
  { path: "/admin/general/movimientos/pagos-qr", title: pageTitle("Pagos QR — Movimientos — Admin") },
  { path: "/admin/general/movimientos/pagos-tarjeta", title: pageTitle("Pagos con tarjeta — Movimientos — Admin") },
  { path: "/admin/general/movimientos/retiros", title: pageTitle("Retiros — Movimientos — Admin") },
  { path: "/admin/general/usuarios", title: pageTitle("Usuarios — Admin") },
  { path: "/admin/general/usuarios/$legajo", title: pageTitle("Ficha de cliente — Admin") },
  { path: "/admin/general/usuarios/comisiones", title: pageTitle("Carga de comisiones — Usuarios — Admin") },
  { path: "/admin/general/usuarios/cvu", title: pageTitle("Usuarios con CVU — Usuarios — Admin") },
  { path: "/admin/general/usuarios/juridicas", title: pageTitle("Personas jurídicas — Usuarios — Admin") },
  { path: "/admin/incidentes", title: "Comunicación de incidentes — Admin Panel" },
  { path: "/admin/modulos", title: pageTitle("Salud de módulos — Admin") },
  { path: "/admin/notificaciones", title: pageTitle("Sistema de Notificaciones — Admin") },
  { path: "/administracion/registros", title: "Registros" },
  { path: "/administracion/reportes", title: "Reportes" },
  { path: "/administracion/soporte", title: "Soporte" },
  { path: "/administracion/usuarios", title: "Usuarios" },
];
