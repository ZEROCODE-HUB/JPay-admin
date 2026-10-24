# Pendientes

Problemas conocidos del código que hay que resolver **antes de poner la plataforma en producción**.
Ordenados por prioridad. Ver también `PENDIENTES.md` en `JPay-empresas`.

## 1. CRÍTICO — `crear-admin` no verifica quién la llama

`supabase/functions/crear-admin` crea usuarios administradores (con el rol que se le pase) usando
la service role, sin validar el JWT ni el rol de quien la invoca. Con la clave pública (anon) de
Supabase alcanza para crearse un administrador.

**Qué hacer**
- [ ] Exigir el JWT del llamador (`auth.getUser(token)`) y verificar que sea un administrador con
      permiso para crear usuarios antes de operar.
- [ ] Revisar `verify_jwt` y el resto de las funciones (`eliminar-usuario`,
      `cambiar-estado-movimiento`, `get-document-url`) con el mismo criterio.

## 2. ALTO — Admin determinado por dominio de email (debe ser por rol)

La Edge Function `doc-url` (en `JPay-empresas`), que este panel usa para ver documentos de
clientes, decide si un usuario es administrador por el dominio de su email. Ser admin tiene que
depender de un rol asignado en la base, no del email.

- [ ] Unificar con el sistema de roles/permisos del panel (`src/lib/permissions.ts`), para que el
      backend y el panel usen la misma fuente de verdad.
- [ ] Revisar que ninguna pantalla ni política RLS decida permisos por email.

## 3. MEDIO — Nombres heredados en columnas de la base

Columnas como `tasa_molipay_pct`, `tasa_molipay_monto`, `comision_molipay`,
`comision_molipay_monto` y `comision_molipay_base` conservan nombres heredados porque el código
debe coincidir con la base. Renombrarlas con una migración (columnas, vistas y funciones) y
actualizar el código en el mismo cambio.

## 4. Configuración

- [ ] Reemplazar los datos ficticios de `src/brand/brand.json` (ver `BRANDING.md`).
- [ ] La pantalla de configuración muestra hosts de ejemplo (`redis.internal`, `db.internal`,
      `login.internal`): son textos de muestra, no configuración real.
