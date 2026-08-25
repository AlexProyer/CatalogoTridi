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
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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

// ── PageHeading ──────────────────────────────────────────────────────────
// Título + subtítulo de página. Antes se escribía a mano en cada página
// (Categorías ya lo tenía, Productos iba a necesitar el mismo patrón) —
// se extrae acá para que agregar una tercera página no lo vuelva a duplicar.

export function PageHeading({
  title,
  subtitle,
  mobile = false,
}: {
  title: string
  subtitle?: string
  mobile?: boolean
}) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <h1
        style={{
          margin: '0 0 var(--space-1)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800 as unknown as number,
          fontSize: mobile ? 'var(--text-lg)' : 'var(--text-xl)',
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', maxWidth: '52ch' }}>
          {subtitle}
        </p>
      )}
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
  size = 'xs',
}: {
  icon?: ReactNode
  label: string
  tone?: 'outline' | 'solid' | 'plain'
  /** Escalones por encima del default ('xs') — para usos donde el chip
      necesita más presencia (ej. la tira de features de BottomBar). */
  size?: 'xs' | 'sm' | 'md'
}) {
  const fontSize = size === 'md' ? 'var(--text-md)' : size === 'sm' ? 'var(--text-sm)' : 'var(--text-xs)'
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--weight-bold)' as unknown as number,
    fontSize,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
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

// ── ImageCarousel ────────────────────────────────────────────────────────
// Foto principal navegable sin tener que bajar hasta las miniaturas: flechas
// (clic, mobile y desktop) + arrastre/swipe con Pointer Events, que a
// diferencia de Touch Events cubre dedo y mouse con el mismo código. La
// franja de miniaturas (ThumbnailStrip) sigue debajo — esto es un atajo
// encima de la foto, no la reemplaza.

export function ImageCarousel({
  images,
  activeIndex,
  onChange,
  alt,
  style,
  imgStyle,
}: {
  images: string[]
  activeIndex: number
  onChange: (index: number) => void
  alt: string
  style?: CSSProperties
  imgStyle?: CSSProperties
}) {
  const dragStartX = useRef<number | null>(null)
  // Si el pointerup que precede al click ya movió la foto (swipe), ese
  // mismo click no debe además abrir el lightbox — sin esto, cada swipe
  // en mobile abriría la pantalla completa por accidente.
  const wasDragRef = useRef(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const hasMultiple = images.length > 1

  const goTo = (i: number) => onChange((i + images.length) % images.length)
  const prev = () => goTo(activeIndex - 1)
  const next = () => goTo(activeIndex + 1)

  // Pointer Events (no Touch Events) para que el mismo código sirva de
  // arrastre con mouse en desktop y de swipe táctil en mobile.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStartX.current = e.clientX
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return
    const dx = e.clientX - dragStartX.current
    dragStartX.current = null
    const SWIPE_THRESHOLD = 40
    wasDragRef.current = Math.abs(dx) > SWIPE_THRESHOLD
    if (dx > SWIPE_THRESHOLD) prev()
    else if (dx < -SWIPE_THRESHOLD) next()
  }

  // Punto de partida (y de llegada, al cerrar) de la animación del
  // lightbox: la geometría exacta de la foto tal cual está en pantalla en
  // este momento, más su tamaño real (para no recortarla al mostrarla
  // completa).
  function getSourceGeometry() {
    const el = imgRef.current
    if (!el) return null
    return { rect: el.getBoundingClientRect(), naturalWidth: el.naturalWidth || el.width, naturalHeight: el.naturalHeight || el.height }
  }

  function openLightbox() {
    if (wasDragRef.current) { wasDragRef.current = false; return }
    openerRef.current = document.activeElement as HTMLElement | null
    setLightboxOpen(true)
  }
  function closeLightbox() {
    setLightboxOpen(false)
    openerRef.current?.focus?.()
  }

  return (
    <div
      style={{ position: 'relative', touchAction: 'pan-y', ...style }}
      onPointerDown={hasMultiple ? onPointerDown : undefined}
      onPointerUp={hasMultiple ? onPointerUp : undefined}
      onKeyDown={(e) => {
        if (hasMultiple && e.key === 'ArrowLeft') prev()
        else if (hasMultiple && e.key === 'ArrowRight') next()
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox() }
      }}
      tabIndex={0}
      role={hasMultiple ? 'group' : 'button'}
      aria-label={hasMultiple ? `Galería de fotos de ${alt}` : `Ampliar foto de ${alt}`}
      aria-roledescription={hasMultiple ? 'carrusel' : undefined}
    >
      <img
        ref={imgRef}
        src={images[activeIndex]}
        alt={alt}
        draggable={false}
        onClick={openLightbox}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none', cursor: 'zoom-in', ...imgStyle }}
      />
      {lightboxOpen && (
        <Lightbox
          images={images}
          activeIndex={activeIndex}
          onChange={onChange}
          alt={alt}
          onClose={closeLightbox}
          getSourceGeometry={getSourceGeometry}
        />
      )}
      {hasMultiple && (
        <>
          <button type="button" onClick={prev} aria-label="Foto anterior" className="carousel-arrow" style={{ ...buttonReset, ...carouselArrowStyle, left: 'var(--space-2)' }}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={next} aria-label="Foto siguiente" className="carousel-arrow" style={{ ...buttonReset, ...carouselArrowStyle, right: 'var(--space-2)' }}>
            <span aria-hidden="true">›</span>
          </button>
          <div style={{ position: 'absolute', bottom: 'var(--space-2)', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a foto ${i + 1}`}
                aria-pressed={i === activeIndex}
                className="carousel-dot"
                style={{
                  ...buttonReset,
                  width: i === activeIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 'var(--radius-full)',
                  background: i === activeIndex ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const carouselArrowStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 36,
  height: 36,
  borderRadius: 'var(--radius-full)',
  background: 'rgba(10,10,20,0.55)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 20,
  lineHeight: 1,
  color: '#fff',
}

// ── Lightbox ─────────────────────────────────────────────────────────────
// Pantalla completa para ver la foto sin recortar. La animación es FLIP
// (First-Last-Invert-Play): en vez de un fade genérico, el marco de la foto
// literalmente crece desde el rectángulo exacto donde estaba en la página
// hasta su tamaño final — y al cerrar hace el camino inverso, hacia la foto
// que quedó activa (puede no ser la misma con la que se abrió, si el
// usuario navegó adentro del lightbox). El tamaño final respeta la
// proporción real de la foto (naturalWidth/naturalHeight) para no
// recortarla ni dejarla estirada.
//
// Se anima con manipulación directa del DOM (no state de React) a
// propósito: el primer frame ("la foto ya está encogida, sin transición")
// tiene que pintarse antes que el segundo ("ahora sí anima a su tamaño
// final"), y esa secuencia de dos pasos es más confiable con refs que
// esperando a que React decida cuándo re-renderiza.

function computeLightboxRect(naturalWidth: number, naturalHeight: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const padX = vw < 640 ? 16 : 56
  const padY = vw < 640 ? 88 : 64
  const availW = Math.max(1, vw - padX * 2)
  const availH = Math.max(1, vh - padY * 2)
  const imgRatio = naturalWidth / naturalHeight || 1
  const availRatio = availW / availH
  const width = imgRatio > availRatio ? availW : availH * imgRatio
  const height = imgRatio > availRatio ? availW / imgRatio : availH
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height }
}

function Lightbox({
  images,
  activeIndex,
  onChange,
  alt,
  onClose,
  getSourceGeometry,
}: {
  images: string[]
  activeIndex: number
  onChange: (index: number) => void
  alt: string
  onClose: () => void
  getSourceGeometry: () => { rect: DOMRect; naturalWidth: number; naturalHeight: number } | null
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const dragStartX = useRef<number | null>(null)
  const restRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null)
  const closingRef = useRef(false)
  const [backdropVisible, setBackdropVisible] = useState(false)
  const hasMultiple = images.length > 1

  const goTo = (i: number) => onChange((i + images.length) % images.length)
  const prev = () => goTo(activeIndex - 1)
  const next = () => goTo(activeIndex + 1)

  function beginClose() {
    if (closingRef.current) return
    closingRef.current = true
    setBackdropVisible(false)
    const box = boxRef.current
    const rest = restRectRef.current
    const geo = getSourceGeometry()
    if (box && rest && geo) {
      const sx = geo.rect.width / rest.width
      const sy = geo.rect.height / rest.height
      const tx = geo.rect.left + geo.rect.width / 2 - (rest.left + rest.width / 2)
      const ty = geo.rect.top + geo.rect.height / 2 - (rest.top + rest.height / 2)
      box.style.transition = 'transform var(--lightbox-duration) var(--lightbox-ease)'
      box.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`
      let done = false
      const finish = () => { if (done) return; done = true; onClose() }
      box.addEventListener('transitionend', finish, { once: true })
      setTimeout(finish, 650)
    } else {
      setTimeout(onClose, 260)
    }
  }

  // Apertura: encoger el marco al tamaño/posición exactos de la foto en la
  // página (sin transición), forzar reflow, y recién ahí animar a su
  // tamaño final — ese orden es lo que hace que se sienta como que la
  // misma foto crece, no como una foto nueva apareciendo encima.
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const geo = getSourceGeometry()
    const rest = computeLightboxRect(geo?.naturalWidth ?? 1, geo?.naturalHeight ?? 1)
    restRectRef.current = rest
    box.style.left = `${rest.left}px`
    box.style.top = `${rest.top}px`
    box.style.width = `${rest.width}px`
    box.style.height = `${rest.height}px`
    if (geo) {
      const sx = geo.rect.width / rest.width
      const sy = geo.rect.height / rest.height
      const tx = geo.rect.left + geo.rect.width / 2 - (rest.left + rest.width / 2)
      const ty = geo.rect.top + geo.rect.height / 2 - (rest.top + rest.height / 2)
      box.style.transition = 'none'
      box.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`
      void box.offsetWidth // fuerza el reflow para que el navegador registre el punto de partida
    }
    const raf = requestAnimationFrame(() => {
      box.style.transition = 'transform var(--lightbox-duration) var(--lightbox-ease)'
      box.style.transform = 'translate(0px, 0px) scale(1, 1)'
      setBackdropVisible(true)
    })
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') beginClose()
      else if (e.key === 'ArrowLeft' && hasMultiple) prev()
      else if (e.key === 'ArrowRight' && hasMultiple) next()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, hasMultiple])

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStartX.current = e.clientX
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return
    const dx = e.clientX - dragStartX.current
    dragStartX.current = null
    const SWIPE_THRESHOLD = 50
    if (dx > SWIPE_THRESHOLD) prev()
    else if (dx < -SWIPE_THRESHOLD) next()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto de ${alt} en pantalla completa`}
      onClick={beginClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)' as unknown as number,
        background: 'rgba(6,6,10,0.92)', opacity: backdropVisible ? 1 : 0,
        transition: 'opacity var(--lightbox-duration) var(--lightbox-ease)',
        touchAction: 'none',
      }}
    >
      <div
        ref={boxRef}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={hasMultiple ? onPointerDown : undefined}
        onPointerUp={hasMultiple ? onPointerUp : undefined}
        style={{ position: 'fixed', transformOrigin: 'center center' }}
      >
        <img
          src={images[activeIndex]}
          alt={alt}
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
        />
      </div>

      <button ref={closeBtnRef} type="button" onClick={beginClose} aria-label="Cerrar" className="lightbox-close" style={{ ...buttonReset, position: 'fixed', top: 'var(--space-3)', right: 'var(--space-3)', ...lightboxIconStyle }}>
        <span aria-hidden="true">✕</span>
      </button>

      {hasMultiple && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Foto anterior" className="carousel-arrow" style={{ ...buttonReset, ...carouselArrowStyle, left: 'var(--space-3)' }}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); next() }} aria-label="Foto siguiente" className="carousel-arrow" style={{ ...buttonReset, ...carouselArrowStyle, right: 'var(--space-3)' }}>
            <span aria-hidden="true">›</span>
          </button>
          <div style={{ position: 'fixed', bottom: 'var(--space-3)', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); goTo(i) }}
                aria-label={`Ir a foto ${i + 1}`}
                aria-pressed={i === activeIndex}
                className="carousel-dot"
                style={{
                  ...buttonReset,
                  width: i === activeIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 'var(--radius-full)',
                  background: i === activeIndex ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>,
    document.body,
  )
}

const lightboxIconStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 'var(--radius-full)',
  background: 'rgba(10,10,20,0.55)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 16,
  lineHeight: 1,
  color: '#fff',
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
            textTransform: 'uppercase',
            color: item.id === activeId ? 'var(--color-text)' : 'var(--color-text-dim)',
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
