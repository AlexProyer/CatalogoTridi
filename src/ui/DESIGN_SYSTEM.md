# Taller Nocturno — arquitectura visual compartida

Dirección visual 1 del catálogo Tridi. `DESIGN_VARIANCE: 3` · `MOTION_INTENSITY: 3` · `VISUAL_DENSITY: 5`.

Este documento es la referencia para redecorar cada página. Los tokens viven en
`src/index.css` (`:root`), los componentes base en `src/ui/primitives.tsx`, la
constante de breakpoint en `src/ui/tokens.ts`. Nada de esto está conectado a
`App.tsx` todavía — es la base para el rediseño página por página que sigue.

## Por qué CSS nativo y no Tailwind/Motion

El proyecto tiene Tailwind v4 instalado pero nunca usado (todo es `style={{}}`
inline), y no tiene Motion ni GSAP como dependencia. Migrar a esas librerías
sería un cambio de stack no pedido. Con `MOTION_INTENSITY: 3` (hover/active
únicos, sin coreografía) tampoco hace falta esa maquinaria. La arquitectura
usa **CSS custom properties** para tokens y **clases reales** solo para
estados de interacción (`:hover`, `:active`, `:focus-visible`) — un objeto
`style` de React no puede expresar una pseudo-clase.

## 1. Colores

Roles semánticos, no valores. `:root` tiene hoy los valores de modo oscuro
(único tema que se envía); `[data-theme="light"]` traduce cada rol para
cuando exista un toggle — mismo lenguaje "con la luz encendida", no un
rebrand improvisado.

| Token | Oscuro (hoy) | Claro (reservado) | Uso |
|---|---|---|---|
| `--color-bg` | `#0A0C16` | `#F2F1F5` | fondo de página — reemplaza los 3 negros que convivían sin razón |
| `--color-surface` | `#12152A` | `#FFFFFF` | tarjetas, paneles |
| `--color-surface-raised` | `#171A33` | `#F7F6FA` | fondo de miniatura, superficie hover |
| `--color-border` | `#2A2D45` | `#E2E0EA` | borde por defecto |
| `--color-text` | `#F4F3F8` | `#14121C` | texto primario |
| `--color-text-dim` | `#A6A2BA` | `#5A5668` | texto secundario, pasa AA |
| `--color-text-faint` | `#716D82` | `#8B87A0` | solo chrome decorativo (eyebrows de marca) |
| `--color-accent` | `#8B30D6` | `#7A28BE` | acento único de marca |
| `--color-accent-soft` | `rgba(139,48,214,.15)` | `rgba(122,40,190,.1)` | fondos de badge/CTA-box |
| `--color-accent-text` | `#C9A6F0` | `#6B1FAE` | violeta seguro para texto chico (ver nota) |
| `--color-on-accent` | `#FFFFFF` | `#FFFFFF` | texto sobre superficie de acento sólida |

**Nota de contraste:** la auditoría encontró que `#8B30D6` a menos de 18px
sobre `--color-bg` da ~3.1:1, por debajo de AA (4.5:1). `--color-accent-text`
existe específicamente para eso — texto violeta chico usa este token, nunca
`--color-accent` directo.

**Color Consistency Lock:** un solo acento fijo por sitio. El `accent` por
categoría (dato del CMS, ya conectado a las tarjetas) es la única segunda
capa de color permitida, y se aplica vía estilo inline (`${cat.accent}55`)
porque es dato, no token — nunca se agrega un tercer color ad hoc.

## 2. Tipografías

- `--font-display: 'Barlow Condensed'` — títulos, precios, eyebrows.
- `--font-body: 'Barlow'` — cuerpo.
- `--font-mono` (nuevo, sistema) — código SKU y specs, para que se lean como
  datos y no como prosa mal alineada.

## 3. Font weights

`--weight-body: 500` · `--weight-medium: 600` · `--weight-bold: 700` ·
`--weight-display: 800` · `--weight-display-heavy: 900` (solo el titular de
portada — es el único lugar con licencia para el peso máximo).

## 4. Type scale

Ratio 1.25, base 13px: `--text-xs 13` / `--text-sm 16` / `--text-md 20` /
`--text-lg 25` / `--text-xl 31` / `--text-2xl 39` / `--text-3xl 49`. El hero
de portada usa `clamp()` fuera de esta escala a propósito — es el único
momento tipográfico grande del sitio.

## 5. Spacing scale

`--space-1` a `--space-10` = 4/8/12/16/20/24/32/40/56/72px. Reemplaza los
valores sueltos (6, 7, 9, 10, 14, 18, 22...) que aparecían sin patrón.

## 6. Container widths

`--container-max: 1160px` — unifica el 1100 (portada) y 1200 (categorías)
que convivían sin razón.

## 7. Grid

`--grid-gap: var(--space-2)` (8px). Columnas via `gridColumns()` en
`src/ui/tokens.ts`: 2 (`<480px`) / 3 (`480–899px`) / 4 (`≥900px`) — una sola
función para categorías y productos, que antes tenían pares de umbrales
distintos sin motivo.

## 8. Breakpoints

`MOBILE_BREAKPOINT = 500` en `src/ui/tokens.ts` — única fuente de verdad
para "modo compacto" (texto, spacing, layout). Reemplaza los 5 valores
distintos (400/420/500/580/600) que la auditoría encontró. Los breakpoints
de columnas de grilla (480/900) son una preocupación aparte — cuántas
columnas caben, no si el layout es compacto — y viven en la misma función
para no repetirse.

## 9. Border radius

`--radius: 4px` en toda la UI rectangular (Shape Consistency Lock — un solo
radio, sin excepciones "porque queda mejor acá"). `--radius-full` es la
única excepción documentada, reservada a controles circulares (swatches,
botón flotante de WhatsApp): es otra categoría de forma, no una segunda
escala de radio compitiendo con la primera.

## 10. Borders

`--border-hairline: 1px solid var(--color-border)`, el default. Los bordes
de acento por categoría usan el hex del CMS con sufijo de alpha
(`${cat.accent}55`), documentado en el componente `Card`.

## 11. Shadows

Sin sombra de elevación en reposo — la jerarquía viene de brillo y borde,
no de "estar levantado". Dos tokens: `--shadow-glow` (hover/focus de
tarjetas y botones) y `--shadow-floating` (elementos realmente flotantes
sobre contenido: CTA sticky, botón de WhatsApp).

## 12. Image ratios

`--ratio-cover: 16/9` (portada de categoría) · `--ratio-square: 1/1`
(foto de producto) · `--ratio-portrait: 3/4` (figura hero de portada). Las
miniaturas de galería son franja de altura fija (58px), ancho flexible —
no están atadas a un ratio porque cada foto conserva su propio recorte.

## 13. Botones

Componente `Button` (`src/ui/primitives.tsx`). Variante `solid` (CTA
principal, fondo de acento) y `ghost` (borde, para acciones secundarias que
todavía no existen en el sitio pero van a hacer falta). Estado presionado
explícito (`:active { scale(0.98) }`) — el sitio no tenía ninguno.

## 14. Links

Componente `TextLink`. Sin subrayado en reposo, subrayado + color más claro
en hover/focus. Usa `--color-text-dim`, no `--color-accent` directo (mismo
motivo de contraste que el punto 1).

## 15. Cards

Componente `Card`, base compartida de `CategoryCard` y `ProductCard`.
Superficie + borde + radio, sin sombra en reposo, glow solo si es
interactiva (`onClick` presente → se renderiza como `<button>` con reset
targeted, no `all: unset`).

## 16. Navegación

Componente `NavTabs`. Indicador de estado activo por línea inferior (no
pastilla rellena — "panel de instrumento", no "app genérica"). Altura
mínima de touch target 44px (antes ~32px, hallazgo de la auditoría).

## 17. Footer

Dos regiones con roles distintos, no forzadas a fusionarse: la tira de
features (`BottomBar`, visible en categorías/productos) y el footer social
de portada (Instagram/teléfono/sitio, solo en el punto de entrada). Comparten
tokens de tipografía y color, pero conceptualmente son cosas distintas —
reassurance de marca vs. contacto — y el documento no obliga una unificación
falsa.

## 18. Section spacing

`--space-section-y` (32px mobile / 56px desktop vía `--space-section-y-desktop`)
entre regiones de página. `--space-page-x` (12px / 20px) para el padding
horizontal. Reemplaza los paddings ad hoc por página.

## 19. Animation timings & easing

Un solo par: `--motion-duration: 120ms`, `--motion-ease: linear`. Lineal a
propósito — confirma un estado, no entretiene. `MOTION_INTENSITY: 3` no
incluye entradas, reveals ni parallax.

## 20. Hover behavior

- Botones y tarjetas interactivas → `--shadow-glow` (no `scale`).
- Links y tabs de navegación → color/subrayado.
- Swatches → `scale(1.05)` leve, es un control físico de selección, no una
  tarjeta.
- Ningún elemento usa el `scale(1.02)` de tarjeta que tenía el sitio antes.

## 21. Focus states

Regla global en `index.css`, ya en producción: `:focus-visible` con
`!important` (necesario porque los elementos interactivos usan
`all: unset` inline). Los componentes nuevos en `primitives.tsx` evitan
`all: unset` — resetean solo lo necesario — así que a futuro esa regla deja
de ser indispensable, pero se mantiene por compatibilidad con el código
existente hasta que se migre.

## Qué se convirtió en componente reutilizable

| Componente | Reemplaza |
|---|---|
| `Eyebrow` | 4+ labels sueltos con estilos casi idénticos (año, SKU, "colores disponibles") |
| `Button` | 3 CTAs con el mismo patrón repetido a mano |
| `TextLink` | Los links de contacto del footer y la caja de personalizado |
| `Card` | Base compartida de `CategoryCard`/`ProductCard` |
| `FeatureChip` | Las 3 implementaciones divergentes de "chip de feature" |
| `CtaBox` | La caja "¿personalizado?" duplicada mobile/desktop |
| `SwatchPicker` | El selector de color, ahora con touch target correcto |
| `ThumbnailStrip` | La galería de miniaturas duplicada mobile/desktop |
| `NavTabs` | Los tabs de navegación, hoy inline en `App()` |

`TridiLogo`, `CatalogHeader`, `StarBadge`, `WhatsappFloatButton` y
`BottomBar` ya eran de única fuente en `App.tsx` — se migran a
`primitives.tsx` con los nuevos tokens cuando empiece el rediseño de cada
página, no antes, para no tocar nada visual todavía.

## Qué no cambia con esta arquitectura

Rutas y slugs, `whatsappProductMessage`, los nombres de evento de
`trackEvent`, y el pipeline de contenido (`content/*.json` ↔
`public/admin/config.yml`) — fuera de alcance, tal como se definió en el
protocolo de rediseño "preservar".
