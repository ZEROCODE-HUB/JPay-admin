# JPay Admin

Panel de administración (backoffice) de JPay: usuarios y legajos, movimientos, comercios, links
de pago, lotes de acreditación, adelantos, contracargos, impuestos, reportes regulatorios
(BCRA/AFIP), alertas y configuración.

Stack: React 19 + TanStack Start/Router, Tailwind CSS v4, Supabase (base de datos, auth y Edge
Functions en `supabase/`).

## Puesta en marcha

```bash
npm ci
cp .env.example .env   # completar las variables
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` / `npm run build` | Desarrollo / build de producción (antes sincronizan la marca) |
| `npm run typecheck` | Chequeo de tipos |
| `npm run lint` | ESLint |
| `npm run brand:sync` | Regenera los archivos derivados de `src/brand/brand.json` |
| `npm run brand:check` | Verifica que la marca no esté escrita a mano en el código (corre en CI) |
| `npm run brand:assets` | Regenera `hero.webp` y `og-image.png` desde la marca |
| `npm run gen:kb` / `npm run gen:docs` | Regeneran la navegación del asistente y la doc de comportamiento |

## Documentación

- [`BRANDING.md`](BRANDING.md): cómo funciona la marca (nombre, colores, tipografías, logos).
- [`PENDIENTES.md`](PENDIENTES.md): problemas conocidos a resolver antes de producción.
- [`ESTADO_ACTUAL.md`](ESTADO_ACTUAL.md): reglas de negocio confirmadas.
- [`FLUJO_COMERCIOS.md`](FLUJO_COMERCIOS.md), [`CONTRATO_DATOS.md`](CONTRATO_DATOS.md).

> Los datos de empresa y contacto de `src/brand/brand.json` son **ficticios** (dominio
> `.example`): reemplazarlos por los reales antes de publicar.
