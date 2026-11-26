# Comercios: qué son y cómo se usan

Última revisión: 26/11/2026. (La versión anterior de este documento describía el menú heredado de
Argentina, que ya no existe.) La guía completa de conexiones está en
`JPay-empresas/docs/OPERACION.md`.

## Qué es un comercio

- **Cliente** (`clientes`, por `legajo`): la persona o empresa dueña de la cuenta.
- **Comercio** (`comercios`): el negocio de ese cliente con el que **cobra con tarjeta**. Es a lo
  que se le cuelgan la conexión con Ecart Pay, los links de pago, las suscripciones, la
  domiciliación y los puntos físicos (sucursales, cajas, terminales).

El comercio se crea solo: cuando el cliente pasa a activado o se aprueba su verificación, un
disparador (`_comercio_al_aprobar_kyc`, migraciones 1063 y 1064) le crea uno con su nombre
comercial. Nadie tiene que «asignarlo» a mano. Un admin puede crear comercios adicionales desde
**Comercios › Gestión** para un cliente que opere más de un negocio.

## Qué se conecta por cliente y qué por comercio

| Servicio                                        | Proveedor | Se conecta por                  | Dónde                          |
| ----------------------------------------------- | --------- | ------------------------------- | ------------------------------ |
| Cuenta SPEI (CLABE, transferencias, dólares)    | Cobre     | **Cliente** (una sola)          | Ficha del cliente › Conexiones |
| Cobros con tarjeta (links, suscripciones, POS…) | Ecart Pay | **Comercio** (una por cada uno) | Ficha del cliente › Conexiones |

Si un cliente tiene tres comercios: una sola cuenta SPEI y tres conexiones de cobros con tarjeta,
cada una con la cuenta de Ecart Pay de ese comercio.

## Quién hace la conexión

- **Admin** (ficha del cliente › pestaña Conexiones):
  - _Cobros con tarjeta_: «Vincular» abre Ecart Pay; se inicia sesión con la cuenta de ese comercio
    y se autoriza. Vuelve a la ficha con el resultado. También «Desvincular».
  - _Cuenta Cobre propia_: User ID + clave de API del cliente → valida, guarda en Vault, vincula su
    Balance (CLABE) y suscribe los avisos, todo en un paso.
  - _Alta como Subcliente_: enviar sus datos KYB a Cobre (más abajo en la misma pestaña).
- **Cliente** (portal › Conexiones): ve el estado, puede vincular él mismo su cuenta de cobros
  (mismo OAuth) y pedir la activación con un formulario. No ve los nombres de los proveedores ni
  carga claves.

Las solicitudes de los clientes llegan a **Clientes › Solicitudes de contacto** y por correo.

## Limitación con varios comercios

En el portal, las pantallas que operan los cobros (Cobros con tarjeta, Suscripciones, Puntos
físicos, Retiros) trabajan con el primer comercio del cliente. Conexiones sí los muestra todos.
Si se van a usar clientes con varios comercios, hay que agregar el selector en esas pantallas.

## Pantallas del panel relacionadas

- **Comercios › Gestión**: alta, edición y estado de comercios.
- **Comercios › Link de pago / Suscripciones y domiciliación / POS físico**: lo cobrado por cada
  comercio.
- **Sistema › Integraciones**: conexión de la plataforma con cada proveedor, lista de comercios
  conectados, avisos (webhooks), conciliación y correo.
