import { useState, useEffect } from 'react'
import { categories, company, type Product, type Category } from './data/products'
import { MOBILE_BREAKPOINT, gridColumns } from './ui/tokens'
import { Card, Eyebrow, Button, TextLink, FeatureChip, CtaBox, SwatchPicker, ThumbnailStrip, NavTabs, PageHeading } from './ui/primitives'

// ── Contact link helpers ────────────────────────────────────────────────────

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function instagramHref(handle: string) {
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

function websiteHref(url: string) {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}

function whatsappHref(phoneDigits: string, message: string) {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
}

const WHATSAPP_GENERAL_MESSAGE = 'Hola, quisiera obtener información sobre sus productos.'

function whatsappProductMessage(product: Product, selectedColorName: string | null) {
  const lines = [`Hola, me interesa el producto ${product.name} (Código: ${product.code}).`]
  if (selectedColorName) lines.push(`Color: ${selectedColorName}.`)
  lines.push(`Precio: ${product.price}.`)
  lines.push('¿Me pueden confirmar disponibilidad y cómo realizar la compra?')
  return lines.join('\n')
}

// ── Rutas por producto (sin librería de routing) ────────────────────────────
// El slug se calcula al vuelo a partir del nombre — no se guarda en ningún
// lado — así que un producto o categoría nuevo agregado desde /admin/ ya
// tiene una URL propia apenas se publica, sin tocar código.

function slugify(text: string) {
  return text
    .normalize('NFD').replace(new RegExp('[̀-ͯ]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function productPath(cat: Category, product: Product) {
  return `/producto/${slugify(cat.name)}/${slugify(product.name)}`
}

type RouteMatch = { cat: number; product: number } | 'not-found' | null

function matchProductPath(pathname: string): RouteMatch {
  const m = pathname.match(/^\/producto\/([^/]+)\/([^/]+)\/?$/)
  if (!m) return null
  const catSlug = decodeURIComponent(m[1])
  const productSlug = decodeURIComponent(m[2])
  const catIndex = categories.findIndex(c => slugify(c.name) === catSlug)
  if (catIndex === -1) return 'not-found'
  const productIndex = categories[catIndex].products.findIndex(p => slugify(p.name) === productSlug)
  if (productIndex === -1) return 'not-found'
  return { cat: catIndex, product: productIndex }
}

function computeInitialRoute() {
  const match = matchProductPath(window.location.pathname)
  // catIndex es null salvo que la URL ya apunte a un producto puntual —
  // "ninguna categoría elegida todavía" es un estado real, no la categoría
  // 0 disfrazada.
  if (match === 'not-found') return { page: 'not-found' as PageId, catIndex: null as number | null, selected: null }
  if (match) return { page: 'detail' as PageId, catIndex: match.cat as number | null, selected: match }
  return { page: 'cover' as PageId, catIndex: null as number | null, selected: null }
}

// ── Analytics (sin proveedor todavía) ───────────────────────────────────────
// Punto único para enganchar un proveedor real (GA4, Meta Pixel, etc.) más
// adelante sin tocar los componentes que ya llaman a trackEvent.
function trackEvent(name: string, data?: Record<string, unknown>) {
  if (import.meta.env.DEV) console.log('[track]', name, data)
}

// ── Responsive hook ───────────────────────────────────────────────────────

function useWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

// ── Shared components ─────────────────────────────────────────────────────
// Ahora que las 5 páginas comparten el mismo fondo oscuro, TridiLogo,
// CatalogHeader y BottomBar ya no necesitan una variante clara — se
// simplifican en vez de arrastrar una rama muerta.

function TridiLogo({ small = false }: { small?: boolean }) {
  const sz = small ? 24 : 32
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: small ? 6 : 8 }}>
      <img src="/tridi-icon.png" alt="" width={sz} height={sz} style={{ objectFit: 'contain', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: small ? 13 : 16, letterSpacing: 3, color: 'var(--color-text)', lineHeight: 1 }}>
          {company.name}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400 as unknown as number, fontSize: small ? 7 : 8, letterSpacing: 2, color: 'var(--color-text-dim)', lineHeight: 1 }}>
          {company.sub}
        </div>
      </div>
    </div>
  )
}

function StarBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ display: 'inline', marginRight: 3, flexShrink: 0 }}>
      <polygon points="7,1 8.6,5 13,5.4 9.8,8.1 10.9,12.5 7,10.1 3.1,12.5 4.2,8.1 1,5.4 5.4,5" style={{ fill: 'var(--color-accent)' }} />
    </svg>
  )
}

function BottomBar() {
  return (
    <div className="bottom-bar" style={{ background: 'var(--color-accent)', display: 'flex', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
        {[
          { icon: '🖨️', label: 'Impresión 3D' },
          { icon: '🌈', label: 'Materiales premium' },
          { icon: '⚡', label: 'Entrega 3-5 días' },
        ].map(f => (
          <FeatureChip key={f.label} tone="solid" size="sm" icon={<span aria-hidden="true" style={{ fontSize: 14 }}>{f.icon}</span>} label={f.label} />
        ))}
      </div>
    </div>
  )
}

function WhatsappFloatButton({ page }: { page: PageId }) {
  const w = useWidth()
  const mobile = w < MOBILE_BREAKPOINT

  // Se mide la altura real de BottomBar (si está montado) en vez de
  // adivinar un número fijo — un número fijo ya se desincronizó una vez
  // apenas el footer cambió de tamaño, y va a volver a pasar cada vez que
  // cambie texto, padding o si algún día envuelve a dos líneas en una
  // pantalla angosta. ResizeObserver lo mantiene correcto siempre.
  const [bottomBarHeight, setBottomBarHeight] = useState(0)
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.bottom-bar')
    if (!el) {
      setBottomBarHeight(0)
      return
    }
    const observer = new ResizeObserver(entries => {
      setBottomBarHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [page])

  // Otro contenido pegado al borde inferior en mobile (pie social de
  // portada, caja "¿personalizado?" del detalle) no es un componente único
  // reutilizado, así que no se puede medir igual — para esos casos se
  // mantiene un margen fijo generoso, calibrado sobre el caso más alto.
  const OTHER_MOBILE_BOTTOM_CONTENT = 180
  const base = bottomBarHeight > 0
    ? bottomBarHeight + 20
    : mobile ? OTHER_MOBILE_BOTTOM_CONTENT : 14
  return (
    <a
      href={whatsappHref(company.whatsapp, WHATSAPP_GENERAL_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('whatsapp_float_click')}
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
      className="fab"
      style={{
        position: 'fixed',
        right: 'calc(14px + env(safe-area-inset-right))',
        bottom: `calc(${base}px + env(safe-area-inset-bottom))`,
        width: 52, height: 52, borderRadius: 'var(--radius-full)',
        background: 'var(--color-accent)', boxShadow: 'var(--shadow-floating)',
        display: 'grid', placeItems: 'center',
        textDecoration: 'none', zIndex: 'var(--z-floating)' as unknown as number,
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }} aria-hidden="true">💬</span>
    </a>
  )
}

// El logo ya no vive acá — vive una sola vez en la barra superior
// compartida (App()), fijo en una esquina, para que no "salte" de lugar
// entre páginas. Este header solo aporta el eyebrow de contexto.
function CatalogHeader() {
  const w = useWidth()
  const small = w < MOBILE_BREAKPOINT
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: `var(--space-2) ${small ? 'var(--space-3)' : 'var(--space-page-x-desktop)'}`,
      flexShrink: 0,
    }}>
      <Eyebrow tone="decorative">Catálogo Tridi {company.year}</Eyebrow>
    </div>
  )
}

// ── Page 1: Cover ─────────────────────────────────────────────────────────
// Propósito: primera impresión de marca y una única salida (ver catálogo).
// A diferencia de las páginas de listado, tiene licencia para un momento
// tipográfico grande (el hero) — es la única excepción documentada a la
// escala tipográfica del sistema.

function CoverPage({ onViewCatalog }: { onViewCatalog: () => void }) {
  const w = useWidth()
  const mobile = w < MOBILE_BREAKPOINT

  return (
    <main style={{ background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', right: '-5%', width: 280, height: 280, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 30%, transparent) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 200, height: 200, borderRadius: 'var(--radius-full)', background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* El logo ya no va acá — vive fijo en la barra superior compartida
          (ver App()), así no salta de lado entre esta página y las demás. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: `var(--space-3) ${mobile ? 'var(--space-3)' : 'var(--space-page-x-desktop)'}`, position: 'relative', zIndex: 'var(--z-raised)' as unknown as number }}>
        <Eyebrow tone="decorative">Catálogo {company.year}</Eyebrow>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: mobile ? 'column' : 'row',
        alignItems: mobile ? 'flex-start' : 'center', justifyContent: 'center',
        padding: `0 ${mobile ? 'var(--space-3)' : 'var(--space-page-x-desktop)'} ${mobile ? 'var(--space-3)' : '0'}`,
        position: 'relative', zIndex: 'var(--z-raised)' as unknown as number, gap: mobile ? 'var(--space-3)' : 'var(--space-8)',
        maxWidth: 'var(--container-max)', width: '100%', margin: '0 auto',
      }}>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900 as unknown as number, fontSize: mobile ? 'clamp(38px,14vw,60px)' : 'clamp(42px,7vw,68px)', color: 'var(--color-text)', lineHeight: 0.88, letterSpacing: '-0.02em' }}>
            Catálogo
          </h1>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900 as unknown as number, fontSize: mobile ? 'clamp(28px,10vw,44px)' : 'clamp(32px,5.5vw,52px)', color: 'var(--color-accent)', lineHeight: 0.88, letterSpacing: '-0.02em' }}>
            de productos
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)' as unknown as number, fontSize: mobile ? 22 : 36, color: 'var(--color-text-dim)', lineHeight: 1, letterSpacing: 6, marginTop: 'var(--space-1)' }}>
            {company.year}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            {['🖨️ Impresión 3D', '🎨 Diseño personalizado', '⚙️ Modelado 3D'].map(f => (
              <FeatureChip key={f} label={f} tone="outline" />
            ))}
          </div>

          <div style={{ marginTop: mobile ? 'var(--space-4)' : 'var(--space-5)' }}>
            <Button onClick={onViewCatalog} icon={<span aria-hidden="true">→</span>}>
              Ver catálogo
            </Button>
          </div>
        </div>

        {/* Hero image */}
        {!mobile && (
          <div style={{ width: 'clamp(200px, 22vw, 320px)', height: 'clamp(240px, 46vh, 440px)', flexShrink: 0, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1776426270359-0277f3595496?w=400&h=480&fit=crop&auto=format"
              alt="Figura impresa en 3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)', right: 'var(--space-3)' }}>
              <Eyebrow style={{ color: 'var(--color-accent-text)' }}>Figura premium</Eyebrow>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', marginTop: 2 }}>Impresión FLA · Alta calidad</div>
            </div>
          </div>
        )}
      </div>

      {/* Social footer — mismo tamaño de texto que BottomBar (var(--text-sm))
          para que los dos "footers" del sitio queden estandarizados. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `var(--space-3) ${mobile ? 'var(--space-3)' : 'var(--space-page-x-desktop)'}`, background: 'var(--color-accent-soft)', borderTop: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)', position: 'relative', zIndex: 'var(--z-raised)' as unknown as number, flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <TextLink href={instagramHref(company.instagram)} external style={{ fontSize: 'var(--text-sm)' }}>📷 {company.instagram}</TextLink>
          <TextLink href={telHref(company.phone)} style={{ fontSize: 'var(--text-sm)' }}>📞 {company.phone}</TextLink>
        </div>
        <TextLink href={websiteHref(company.website)} external style={{ fontSize: 'var(--text-sm)' }}>🌐 {company.website}</TextLink>
      </div>
    </main>
  )
}

// ── Page 2: Categories ────────────────────────────────────────────────────
// Propósito: elegir una categoría. Página piloto — referencia visual del
// resto del sitio.

function CategoriesPage({ onSelect }: { onSelect: (i: number) => void }) {
  const w = useWidth()
  const mobile = w < MOBILE_BREAKPOINT
  const cols = gridColumns(w)

  return (
    <main style={{ background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: mobile ? 'flex-start' : 'center',
        padding: `var(--space-3) ${mobile ? 'var(--space-page-x)' : 'var(--space-page-x-desktop)'}`,
        overflow: 'auto',
      }}>
        <div style={{ maxWidth: 'var(--container-max)', width: '100%', margin: '0 auto' }}>
          <PageHeading title="Categorías" subtitle="Explora nuestra colección completa de figuras impresas en 3D." mobile={mobile} />

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'var(--grid-gap)' }}>
            {categories.map((cat, i) => (
              <Card key={cat.name} accentColor={cat.accent} onClick={() => onSelect(i)} aria-label={cat.name}>
                <div style={{ aspectRatio: 'var(--ratio-cover)', overflow: 'hidden', position: 'relative' }}>
                  {/* alt="" a propósito: el nombre ya lo anuncia el aria-label
                      del Card — duplicarlo en la imagen sería ruido para
                      lectores de pantalla. */}
                  <img src={cat.img} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(8,10,20,0.85))' }} />
                </div>
                <div style={{ padding: 'var(--space-2) var(--space-3) var(--space-3)', textAlign: 'left', borderTop: `3px solid ${cat.accent}` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: 'var(--text-sm)', color: 'var(--color-text)', letterSpacing: '0.01em' }}>
                    {cat.name}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomBar />
    </main>
  )
}

// ── Page 3: Product Grid ───────────────────────────────────────────────────
// Propósito: elegir un producto dentro de una categoría. Mismo patrón de
// grilla que Categorías (es la composición correcta para "elegir una cosa
// de una lista"), pero con contenido de tarjeta distinto — precio, material,
// tamaño — y un estado vacío con salida real en vez de un texto muerto.

function ProductCard({ p }: { p: typeof categories[number]['products'][number] }) {
  const w = useWidth()
  // Coincide con los cortes de columnas de ProductGridPage: con 4 columnas
  // (w >= 900) las tarjetas quedan bastante más grandes, así que el texto
  // interno puede crecer con ellas en vez de quedarse en el tamaño mínimo.
  const compact = w < 900
  return (
    <>
      <div style={{ aspectRatio: 'var(--ratio-square)', position: 'relative', background: 'var(--color-surface-raised)', overflow: 'hidden' }}>
        <img src={p.img} alt={p.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: compact ? 'var(--space-2) var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-4) var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: compact ? 3 : 5 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: compact ? 'var(--text-sm)' : 'var(--text-md)', color: 'var(--color-text)', letterSpacing: '0.01em' }}>{p.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{p.code}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <svg width="11" height="11" viewBox="0 0 9 9" fill="none" aria-hidden="true"><rect x="1" y="4" width="7" height="1" style={{ fill: 'var(--color-accent)' }} /><rect x="4" y="1" width="1" height="7" style={{ fill: 'var(--color-accent)' }} /></svg>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>{p.size}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
          <StarBadge />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-accent-text)', fontWeight: 'var(--weight-medium)' as unknown as number }}>{p.material}</span>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: compact ? 'var(--space-2)' : 'var(--space-3)', borderTop: 'var(--border-hairline)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: compact ? 'var(--text-md)' : 'var(--text-lg)', color: 'var(--color-text)' }}>{p.price}</div>
        </div>
      </div>
    </>
  )
}

function ProductGridPage({ catIndex, onDetail }: { catIndex: number; onDetail: (pi: number) => void }) {
  const w = useWidth()
  const mobile = w < MOBILE_BREAKPOINT
  const cat = categories[catIndex]
  const cols = gridColumns(w)
  const emptyHref = whatsappHref(company.whatsapp, `Hola, me interesa la categoría ${cat.name}. ¿Cuándo van a tener productos disponibles?`)

  return (
    <main style={{ background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader />

      <div style={{ flex: 1, padding: `var(--space-3) ${mobile ? 'var(--space-page-x)' : 'var(--space-page-x-desktop)'}`, overflow: 'auto' }}>
        <div style={{ maxWidth: 'var(--container-max)', width: '100%', margin: '0 auto' }}>
          <PageHeading title={cat.name} subtitle="Figuras impresas en 3D de alta calidad. Ideales para coleccionistas y fans." mobile={mobile} />

          {cat.products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-9) var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', fontSize: 'var(--text-md)' }}>
                Todavía no hay productos publicados en {cat.name}.
              </div>
              <Button href={emptyHref} target="_blank" rel="noopener noreferrer" variant="ghost" icon={<span aria-hidden="true">💬</span>}>
                Avisame por WhatsApp
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'var(--grid-gap)' }}>
              {cat.products.map((p, i) => (
                <Card key={p.name} onClick={() => onDetail(i)} aria-label={p.name} style={{ display: 'flex', flexDirection: 'column' }}>
                  <ProductCard p={p} />
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomBar />
    </main>
  )
}

// ── Page 4: Product Detail ─────────────────────────────────────────────────
// Propósito: convertir. Es la página donde se decide la compra, así que
// conserva su propia composición de dos ramas (mobile apilado / desktop
// split) en vez de forzar el layout de grilla de las otras páginas — acá
// la función es distinta (un producto, no una lista) y la composición lo
// refleja.

function ProductDetailPage({ catIndex, productIndex }: { catIndex: number; productIndex: number }) {
  const w = useWidth()
  const mobile = w < 580
  const cat = categories[catIndex]
  const product = cat.products[productIndex] ?? cat.products[0]

  const allImgs = [product.img, ...product.extraImgs]
  const [activeImg, setActiveImg] = useState(0)
  const [activeColor, setActiveColor] = useState(0)

  // Un producto distinto puede tener menos fotos/colores que el anterior —
  // sin este reset, un índice guardado del producto previo podría apuntar
  // a una foto o color que no existe en el nuevo producto.
  useEffect(() => {
    setActiveImg(0)
    setActiveColor(0)
  }, [product.code])

  if (!product) return null

  // Un solo color no es una elección real del cliente — no vale la pena
  // mencionarlo en el mensaje de WhatsApp.
  const selectedColorName = product.colors.length > 1 ? (product.colors[activeColor]?.name ?? null) : null
  const interestedHref = whatsappHref(company.whatsapp, whatsappProductMessage(product, selectedColorName))
  const trackInterested = () => trackEvent('cta_me_interesa_click', { code: product.code, color: selectedColorName })

  const interesaButton = (size: 'sm' | 'lg') => (
    <Button
      href={interestedHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackInterested}
      aria-label={`Me interesa ${product.name} — contactar por WhatsApp`}
      size={size}
      fullWidth={size === 'lg'}
      icon={<span aria-hidden="true">💬</span>}
    >
      Me interesa
    </Button>
  )

  const specsLeft = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 'var(--space-2)' : 'var(--space-3)' }}>
      {[
        { icon: '📏', label: product.size, sub: 'Altura aproximada' },
        { icon: '⚖️', label: product.weight, sub: 'Peso estimado' },
        { icon: '⭐', label: product.material, sub: 'Material de impresión' },
        { icon: '🎨', label: `${product.colors.length} color${product.colors.length === 1 ? '' : 'es'} disponible${product.colors.length === 1 ? '' : 's'}`, sub: '' },
        { icon: '🚚', label: company.delivery, sub: 'Tiempo de entrega' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: mobile ? 'var(--space-2)' : 'var(--space-3)' }}>
          <div aria-hidden="true" style={{ width: mobile ? 24 : 28, height: mobile ? 24 : 28, borderRadius: 'var(--radius)', background: 'var(--color-accent-soft)', display: 'grid', placeItems: 'center', fontSize: mobile ? 11 : 13, flexShrink: 0 }}>{s.icon}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-medium)' as unknown as number, fontSize: mobile ? 'var(--text-xs)' : 'var(--text-sm)', color: 'var(--color-text)' }}>{s.label}</div>
            {s.sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  )

  const colorPicker = (swatchSize: number) => (
    product.colors.length > 0 && (
      <div>
        <Eyebrow>Colores disponibles</Eyebrow>
        <div style={{ marginTop: 'var(--space-2)' }}>
          <SwatchPicker colors={product.colors} activeIndex={activeColor} onChange={setActiveColor} swatchSize={swatchSize} />
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', marginTop: 'var(--space-2)' }}>
          Color seleccionado: <span style={{ color: 'var(--color-text)', fontWeight: 'var(--weight-medium)' as unknown as number }}>{product.colors[activeColor]?.name}</span>
        </div>
      </div>
    )
  )

  const ctaBox = (size: 'sm' | 'lg') => (
    <CtaBox
      title="¿Quieres algo personalizado?"
      description="Pedidos a medida y colores especiales disponibles."
      phone={company.phone}
      phoneHref={telHref(company.phone)}
      size={size}
    />
  )

  if (mobile) {
    return (
      <main style={{ background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
        <CatalogHeader />

        {/* Hero image */}
        <div style={{ height: 200, overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface)' }}>
          <img src={allImgs[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        </div>

        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <Eyebrow mono>{product.code}</Eyebrow>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900 as unknown as number, fontSize: 'var(--text-2xl)', color: 'var(--color-text)', lineHeight: 0.95 }}>{product.name}</h1>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: 'var(--text-lg)', color: 'var(--color-accent-text)', marginTop: 'var(--space-1)' }}>{product.price}</div>
          </div>

          {/* Sticky: en mobile todo este bloque hace scroll dentro del
              contenedor de la página — sin esto, "Me interesa" queda arriba
              del todo y desaparece apenas el cliente baja a ver specs,
              colores o miniaturas. */}
          <div style={{ position: 'sticky', top: 0, zIndex: 'var(--z-sticky)' as unknown as number, background: 'var(--color-bg)', margin: '0 calc(var(--space-4) * -1)', padding: 'var(--space-2) var(--space-4)' }}>
            {interesaButton('lg')}
          </div>

          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>{product.desc}</div>

          {specsLeft}

          {colorPicker(30)}

          {allImgs.length > 1 && (
            <ThumbnailStrip images={allImgs} activeIndex={activeImg} onChange={setActiveImg} alt={product.name} height={56} />
          )}

          {ctaBox('lg')}
        </div>
      </main>
    )
  }

  return (
    <main style={{ display: 'flex', height: '100%' }}>
      {/* Left — specs y CTA */}
      <div style={{ width: '44%', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', padding: 'var(--space-3) var(--space-4)', flexShrink: 0, overflow: 'auto' }}>
        <CatalogHeader />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
          <Eyebrow mono style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>{product.code}</Eyebrow>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900 as unknown as number, fontSize: 'var(--text-2xl)', color: 'var(--color-text)', lineHeight: 0.9, letterSpacing: '-0.01em' }}>{product.name}</h1>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: 'var(--text-xl)', color: 'var(--color-accent-text)', marginTop: 'var(--space-2)' }}>{product.price}</div>
          <div style={{ maxWidth: 380, marginTop: 'var(--space-2)' }}>{interesaButton('sm')}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)', marginTop: 'var(--space-3)', lineHeight: 1.6, maxWidth: 380 }}>{product.desc}</div>

          <div style={{ marginTop: 'var(--space-6)' }}>{specsLeft}</div>

          <div style={{ marginTop: 'var(--space-6)' }}>{colorPicker(24)}</div>

          <div style={{ marginTop: 'var(--space-7)', paddingTop: 'var(--space-5)', borderTop: 'var(--border-hairline)', maxWidth: 380 }}>
            {ctaBox('sm')}
          </div>
        </div>
      </div>

      {/* Right — galería, sobre una superficie más clara para que las fotos
          se sientan sobre una mesa de luz, no perdidas en el mismo negro
          del resto de la página. */}
      <div style={{ flex: 1, background: 'var(--color-surface-raised)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'var(--space-2) var(--space-4)', flexShrink: 0 }}>
          <Eyebrow tone="decorative">Catálogo Tridi {company.year}</Eyebrow>
        </div>

        <div style={{ flex: 1, padding: '0 var(--space-4) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', overflow: 'hidden' }}>
          <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--color-surface)', minHeight: 0 }}>
            <img src={allImgs[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {allImgs.length > 1 && (
            <ThumbnailStrip images={allImgs} activeIndex={activeImg} onChange={setActiveImg} alt={product.name} height={58} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: 'var(--border-hairline)' }}>
            {['🖨️ Impresión 3D', '🌈 Alta calidad', '⚡ Entrega rápida'].map(f => (
              <FeatureChip key={f} label={f} tone="plain" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Página 404 ───────────────────────────────────────────────────────────
// Propósito: recuperar a alguien que llegó a un link roto, sin salir del
// tono de marca. El número "404" es, como el hero de portada, un momento
// tipográfico deliberado — no forma parte de la escala de las demás páginas.

function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <main style={{ background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', padding: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900 as unknown as number, fontSize: 'var(--text-3xl)', color: 'var(--color-accent)', lineHeight: 1 }}>404</div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 as unknown as number, fontSize: 'var(--text-lg)', color: 'var(--color-text)' }}>Producto no encontrado</h1>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', maxWidth: 280, lineHeight: 1.5 }}>
          El link que seguiste puede haber cambiado o el producto ya no está disponible.
        </div>
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button onClick={onBack}>Ver categorías</Button>
        </div>
      </div>
    </main>
  )
}

// ── App shell ──────────────────────────────────────────────────────────────

type PageId = 'cover' | 'categories' | 'grid' | 'detail' | 'not-found'

export default function App() {
  const w = useWidth()
  const mobile = w < MOBILE_BREAKPOINT
  const [page, setPage] = useState<PageId>(() => computeInitialRoute().page)
  // null hasta que el usuario elige una categoría — así "Productos" no
  // muestra una categoría fantasma que nadie eligió (por ej. "Marvel" por
  // defecto solo porque es la primera del arreglo).
  const [catIndex, setCatIndex] = useState<number | null>(() => computeInitialRoute().catIndex)
  // null hasta que el usuario elige un producto — así "Detalle" no aparece
  // en la navegación como si fuera una sección propia sin contexto.
  const [selected, setSelected] = useState<{ cat: number; product: number } | null>(() => computeInitialRoute().selected)

  // Botón atrás/adelante del navegador — vuelve a resolver el estado desde
  // la URL actual, igual que en la carga inicial.
  useEffect(() => {
    const onPopState = () => {
      const match = matchProductPath(window.location.pathname)
      if (match === 'not-found') {
        setPage('not-found')
        setCatIndex(null)
        setSelected(null)
        return
      }
      if (match) {
        setCatIndex(match.cat)
        setSelected(match)
        setPage('detail')
        return
      }
      setPage('cover')
      setCatIndex(null)
      setSelected(null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // "Productos" solo aparece una vez que el usuario eligió una categoría —
  // antes de eso no hay nada real que mostrar ahí.
  const NAV: { id: PageId; label: string }[] = [
    { id: 'cover', label: 'Inicio' },
    { id: 'categories', label: 'Categorías' },
    ...(catIndex !== null ? [{ id: 'grid' as PageId, label: `Productos · ${categories[catIndex].name}` }] : []),
    ...(selected ? [{ id: 'detail' as PageId, label: 'Detalle' }] : []),
  ]

  const goCategory = (i: number) => {
    setCatIndex(i)
    setPage('grid')
    history.pushState(null, '', '/')
  }

  const goDetail = (pi: number) => {
    if (catIndex === null) return
    setSelected({ cat: catIndex, product: pi })
    setPage('detail')
    history.pushState(null, '', productPath(categories[catIndex], categories[catIndex].products[pi]))
  }

  const goHome = () => {
    setPage('categories')
    setCatIndex(null)
    setSelected(null)
    history.pushState(null, '', '/')
  }

  const handleNavSelect = (id: string) => {
    const navId = id as PageId
    // Volver a Inicio o a Categorías deja atrás cualquier categoría/producto
    // elegido — si no, "Productos" seguiría mostrando la última categoría
    // visitada aunque el usuario ya volvió al punto de partida.
    if (navId === 'cover' || navId === 'categories') {
      setCatIndex(null)
      setSelected(null)
    }
    setPage(navId)
    if (navId === 'detail' && selected) {
      history.pushState(null, '', productPath(categories[selected.cat], categories[selected.cat].products[selected.product]))
    } else {
      history.pushState(null, '', '/')
    }
  }

  const catalog = (
    page === 'cover'      ? <CoverPage onViewCatalog={goHome} /> :
    page === 'categories' ? <CategoriesPage onSelect={goCategory} /> :
    page === 'grid' && catIndex !== null ? <ProductGridPage catIndex={catIndex} onDetail={goDetail} /> :
    page === 'not-found'  ? <NotFoundPage onBack={goHome} /> :
    selected              ? <ProductDetailPage catIndex={selected.cat} productIndex={selected.product} /> :
                            <CategoriesPage onSelect={goCategory} />
  )

  return (
    <div style={{ height: '100dvh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Logo fijo a la izquierda + tabs — se renderiza acá una sola vez
          para las 5 páginas, así no cambia de posición al navegar (antes
          cada página lo dibujaba por su cuenta, en un lado distinto). */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: mobile ? 'var(--space-2) var(--space-3)' : 'var(--space-3) var(--space-page-x-desktop)',
        background: 'var(--color-surface)', borderBottom: 'var(--border-hairline)', flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => handleNavSelect('cover')}
          aria-label="Ir al inicio"
          className="logo-link"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexShrink: 0 }}
        >
          <TridiLogo small={mobile} />
        </button>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <NavTabs items={NAV} activeId={page} onSelect={handleNavSelect} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {catalog}
      </div>

      <WhatsappFloatButton page={page} />
    </div>
  )
}
