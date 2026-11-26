# Pendientes

Lo que falta resolver **antes de operar con clientes reales** desde el panel. La lista completa y
la guía de operación (conexiones, correo, funciones, seguridad) están en el repo `JPay-empresas`:
`PENDIENTES.md` y `docs/OPERACION.md`.

Última revisión: 26/11/2026.

## 1. Configuración

- [ ] **Correo (Resend)**: Sistema › Integraciones › Correo → pegar la clave, remitente de un
      dominio verificado, buzón que recibe las solicitudes y «Enviar prueba».
- [ ] **Datos de la marca**: reemplazar los de ejemplo en `src/brand/brand.json` (ver `BRANDING.md`).
- [ ] La pantalla de configuración muestra hosts de ejemplo (`redis.internal`, `db.internal`,
      `login.internal`): son textos de muestra, no configuración real.

- [ ] **Barrido de comisiones** (Integraciones → «Cobre: barrido de comisiones»): crear o vincular
      la cuenta de comisiones, elegir el modo y probar un barrido con $1 en Cobre real.

## 2. Envíos

- [ ] **Código por correo y aprobaciones apagados**: en la configuración de Cobre `exigir_otp` está
      en falso y no hay monto de aprobación. Prenderlos después de cargar Resend.
- [ ] **Dólares**: cargar los Balances Global y USA de la cuenta de la plataforma cuando Cobre los
      habilite (hoy vacíos: los envíos en dólares no operan).

## 3. Limpieza

- [ ] Columnas con nombres heredados (`tasa_molipay_pct`, `comision_molipay*`): renombrarlas con
      una migración que cambie columnas, vistas, funciones y código a la vez.
- [ ] `ESTADO_ACTUAL.md` describe el panel anterior al refactor y a México: sirve solo como
      historia.

## Resuelto (para referencia)

- 26/11/2026 — Se quitaron «Total de fondos» (montos fijos inventados) y «Bloqueo de funciones»
  (no guardaba nada; los bloqueos reales están en Alertas y bloqueos). El dashboard, Registros,
  Actividad y Notificaciones ya leen la base. Exportación CSV sin fórmulas.

- 26/11/2026 — Las fotos del KYC muestran «Cargando…» mientras se pide el enlace firmado y mientras
  baja la imagen (antes decían «Sin archivo» y parecía que no había documentos).
- 26/11/2026 — Ficha del cliente › Conexiones: el admin vincula los cobros con tarjeta de cada
  comercio y la cuenta Cobre del cliente; el cliente ya no carga claves.
- 11/2026 — `crear-admin`, `eliminar-usuario` y `plaft-control-terroristas` validan a quien llama;
  `doc-url` decide el administrador por rol.
