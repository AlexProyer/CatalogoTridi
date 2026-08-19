// Componentes base de la arquitectura visual compartida ("Taller Nocturno").
//
// Consumen los tokens de src/index.css vía var(--token) en estilos inline
// (color, spacing, tipografía, layout) y usan clases reales solo para
// estados de interacción (:hover / :active / :focus-visible), que un objeto
// style de React no puede expresar.
//
// A diferencia del resto de App.tsx, ninguno de estos usa `all: 'unset'`:
// esa fue la causa raíz de que el anillo de foco quedara invisible en todo
// el sitio (ver index.css). Acá se resetean solo las propiedades que hace
// falta resetear, dejando que el navegador y la regla global de
// :focus-visible sigan haciendo su trabajo.
//
// Todavía no están conectados a App.tsx — son la base para el rediseño
// página por página que viene después.

import type { CSSProperties, ReactNode } from 'react'

const buttonReset: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
}

// ── Eyebrow ──────────────────────────────────────────────────────────────
// Label chico en mayúsculas. Cubre tanto chrome decorativo ("CATÁLOGO TRIDI
// 2026") como labels funcionales ("COLORES DISPONIBLES") — el tono decide
// el contraste, no dos componentes distintos.

export function Eyebrow({
  children,
  tone = 'functional',
  mono = false,
  style,
}: {
  children: ReactNode
  tone?: 'functional' | 'decorative'
  mono?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
        fontSize: 'var(--text-xs)',
        fontWeight: mono ? 'var(--weight-medium)' as unknown as number : 'var(--weight-medium)' as unknown as number,
        letterSpacing: mono ? '0.04em' : '0.14em',
        textTransform: mono ? 'none' : 'uppercase',
        color: tone === 'functional' ? 'var(--color-text-dim)' : 'var(--color-text-faint)',
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Button ───────────────────────────────────────────────────────────────
// CTA sólido (WhatsApp, "ver catálogo", "ver categorías") o variante ghost
// para acciones secundarias. Renderiza <a> si recibe href, <button> si no.

type ButtonCommonProps = {
  children: ReactNode
  variant?: 'solid' | 'ghost'
  size?: 'sm' | 'lg'
  icon?: ReactNode
  fullWidth?: boolean
  style?: CSSProperties
  'aria-label'?: string
}

type ButtonAsButton = ButtonCommonProps & {
  href?: undefined
  onClick?: () => void
  type?: 'button' | 'submit'
}

type ButtonAsLink = ButtonCommonProps & {
  href: string
  target?: string
  rel?: string
  onClick?: () => void
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant = 'solid', size = 'lg', icon, fullWidth, style, ...rest } = props

  const shared: CSSProperties = {
    ...buttonReset,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    width: fullWidth ? '100%' : undefined,
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--weight-bold)' as unknown as number,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontSize: size === 'lg' ? 'var(--text-sm)' : 'var(--text-xs)',
    padding: size === 'lg' ? 'var(--space-4) var(--space-5)' : 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius)',
    background: variant === 'solid' ? 'var(--color-accent)' : 'transparent',
    color: variant === 'solid' ? 'var(--color-on-accent)' : 'var(--color-accent-text)',
    border: variant === 'ghost' ? 'var(--border-hairline)' : 'none',
    textDecoration: 'none',
    ...style,
  }

  const className = variant === 'ghost' ? 'btn btn--ghost' : 'btn'

  if ('href' in props && props.href) {
    const { href, target, rel } = rest as ButtonAsLink
    return (
      <a href={href} target={target} rel={rel} className={className} style={shared} onClick={props.onClick}>
        {icon}
        {children}
      </a>
    )
  }

  const { type = 'button', onClick } = rest as ButtonAsButton
  return (
    <button type={type} className={className} style={shared} onClick={onClick}>
      {icon}
      {children}
    </button>
  )
}

// ── TextLink ─────────────────────────────────────────────────────────────

export function TextLink({
  href,
  children,
  external = false,
  style,
}: {
  href: string
  children: ReactNode
  external?: boolean
  style?: CSSProperties
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="link"
      style={{
        color: 'var(--color-text-dim)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        ...style,
      }}
    >
      {children}
    </a>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────
// Cáscara visual compartida por CategoryCard y ProductCard. Sin sombra en
// reposo — el hover glow (definido en index.css) es la única señal de
// elevación, coherente con "brillo, no elevación".

export function Card({
  children,
  onClick,
  accentColor,
  style,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  /** Color de acento de categoría (dato del CMS) — la única segunda capa de
      color permitida, aplicada como borde/franja vía estilo inline porque
      es dato, no token. */
  accentColor?: string
  style?: CSSProperties
  'aria-label'?: string
}) {
  const shared: CSSProperties = {
    display: 'block',
    width: '100%',
    background: 'var(--color-surface)',
    border: accentColor ? `1px solid ${accentColor}55` : 'var(--border-hairline)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    ...style,
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="card card--interactive"
        style={{ ...buttonReset, ...shared }}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="card" style={shared}>
      {children}
    </div>
  )
}

// ── FeatureChip ──────────────────────────────────────────────────────────
// Un solo componente para lo que antes eran 3 implementaciones divergentes
// (badges de portada, items de BottomBar, tira del detalle de producto).

export function FeatureChip({
  icon,
  label,
  tone = 'outline',
}: {
  icon?: ReactNode
  label: string
  tone?: 'outline' | 'solid' | 'plain'
}) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--weight-bold)' as unknown as number,
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.02em',
    borderRadius: 'var(--radius)',
    color: tone === 'plain' ? 'var(--color-text-faint)' : 'var(--color-text)',
  }

  if (tone === 'outline') {
    base.padding = 'var(--space-1) var(--space-3)'
    base.border = '1px solid var(--color-accent)'
    base.background = 'var(--color-accent-soft)'
  } else if (tone === 'solid') {
    base.padding = '0'
    base.background = 'transparent'
  }

  return (
    <span className="chip" style={base}>
      {icon}
      {label}
    </span>
  )
}

// ── CtaBox ───────────────────────────────────────────────────────────────
// Antes duplicada casi al pixel entre el layout mobile y desktop del
// detalle de producto. Una sola implementación, parametrizada por tamaño.

export function CtaBox({
  title,
  description,
  phone,
  phoneHref,
  size = 'lg',
}: {
  title: string
  description: string
  phone: string
  phoneHref: string
  size?: 'sm' | 'lg'
}) {
  return (
    <div
      style={{
        background: 'var(--color-accent-soft)',
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius)',
        padding: size === 'lg' ? 'var(--space-4)' : 'var(--space-3)',
      }}
    >
      <Eyebrow tone="functional" style={{ color: 'var(--color-accent-text)', fontSize: size === 'lg' ? 'var(--text-sm)' : 'var(--text-xs)' }}>
        {title}
      </Eyebrow>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', marginTop: 'var(--space-1)' }}>
        {description}
      </div>
      <TextLink href={phoneHref} style={{ display: 'block', color: 'var(--color-text)', fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-medium)' as unknown as number, marginTop: 'var(--space-2)' }}>
        {phone}
      </TextLink>
    </div>
  )
}

// ── SwatchPicker ─────────────────────────────────────────────────────────
// El círculo visible se mantiene chico (coherente con la escala de la UI),
// pero el área clickeable respeta el mínimo de 44px de touch target — no
// hacen falta coincidir (hallazgo A3 de la auditoría).

export function SwatchPicker({
  colors,
  activeIndex,
  onChange,
  swatchSize = 20,
}: {
  colors: { name: string; hex: string }[]
  activeIndex: number
  onChange: (index: number) => void
  swatchSize?: number
}) {
  const hitArea = Math.max(44, swatchSize + 20)
  return (
    <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
      {colors.map((c, i) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onChange(i)}
          aria-pressed={activeIndex === i}
          aria-label={c.name}
          title={c.name}
          className="swatch"
          style={{
            ...buttonReset,
            width: hitArea,
            height: hitArea,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <span
            style={{
              width: swatchSize,
              height: swatchSize,
              borderRadius: 'var(--radius-full)',
              background: c.hex,
              border: activeIndex === i ? '2px solid var(--color-text)' : '2px solid var(--color-border)',
              boxShadow: activeIndex === i ? '0 0 0 2px var(--color-accent)' : 'none',
            }}
          />
        </button>
      ))}
    </div>
  )
}

// ── ThumbnailStrip ───────────────────────────────────────────────────────
// Antes duplicada entre el layout mobile y desktop del detalle. Franja de
// altura fija, ancho flexible por foto — no está atada a --ratio-* porque
// cada foto conserva su propio recorte dentro de la miniatura.

export function ThumbnailStrip({
  images,
  activeIndex,
  onChange,
  alt,
  height = 58,
}: {
  images: string[]
  activeIndex: number
  onChange: (index: number) => void
  alt: string
  height?: number
}) {
  if (images.length <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      {images.map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-pressed={i === activeIndex}
          aria-label={`Foto ${i + 1} de ${alt}`}
          className="thumb"
          style={{
            ...buttonReset,
            flex: 1,
            height,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            background: 'var(--color-surface-raised)',
            border: i === activeIndex ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
        >
          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </button>
      ))}
    </div>
  )
}

// ── NavTabs ──────────────────────────────────────────────────────────────
// Altura mínima de 44px en el touch target (hallazgo B8 de la auditoría) y
// estado activo por línea inferior, no pastilla rellena (spec de Dirección
// 1: "menos app genérica, más panel de instrumento").

export function NavTabs({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; label: string }[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          data-active={item.id === activeId}
          className="nav-tab"
          style={{
            ...buttonReset,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)' as unknown as number,
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.04em',
            color: item.id === activeId ? 'var(--color-text)' : 'var(--color-text-dim)',
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
