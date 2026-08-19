import { useState, useEffect } from 'react'
import { categories, company, type Product, type Category } from './data/products'

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
  if (match === 'not-found') return { page: 'not-found' as PageId, catIndex: 0, selected: null }
  if (match) return { page: 'detail' as PageId, catIndex: match.cat, selected: match }
  return { page: 'cover' as PageId, catIndex: 0, selected: null }
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

function TridiLogo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  const text = light ? '#fff' : '#0B0D1A'
  const sub = light ? 'rgba(255,255,255,0.65)' : '#6b6b6b'
  const sz = small ? 24 : 32
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: small ? 6 : 8 }}>
      <img src="/tridi-icon.png" alt="" width={sz} height={sz} style={{ objectFit: 'contain', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: small ? 13 : 16, letterSpacing: 3, color: text, lineHeight: 1 }}>
          {company.name}
        </div>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 400, fontSize: small ? 7 : 8, letterSpacing: 2, color: sub, lineHeight: 1 }}>
          {company.sub}
        </div>
      </div>
    </div>
  )
}

function StarBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', marginRight: 3, flexShrink: 0 }}>
      <polygon points="7,1 8.6,5 13,5.4 9.8,8.1 10.9,12.5 7,10.1 3.1,12.5 4.2,8.1 1,5.4 5.4,5" fill="#8B30D6" />
    </svg>
  )
}

function BottomBar({ dark = false }: { dark?: boolean }) {
  const bg = dark ? '#1A0A36' : '#8B30D6'
  return (
    <div style={{ background: bg, display: 'flex', alignItems: 'center', padding: '7px 16px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {[
          { icon: '🖨️', label: 'IMPRESIÓN 3D' },
          { icon: '🌈', label: 'MATERIALES PREMIUM' },
          { icon: '⚡', label: 'ENTREGA 3-5 DÍAS' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11 }}>{f.icon}</span>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 9, color: '#fff', letterSpacing: 1 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WhatsappFloatButton() {
  const w = useWidth()
  // En mobile, las 4 pantallas terminan con contenido pegado al borde
  // inferior (pie de portada, BottomBar, caja "¿personalizado?" del
  // detalle). Esa caja no se estira con el alto del viewport, así que en
  // teléfonos altos queda más lejos del borde — 180px cubre el caso real
  // medido (hasta ~159px en un viewport de 896px) con margen, sin tener
  // que conocer el layout de cada página individualmente.
  const base = w < 500 ? 180 : 14
  return (
    <a
      href={whatsappHref(company.whatsapp, WHATSAPP_GENERAL_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('whatsapp_float_click')}
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        right: 'calc(14px + env(safe-area-inset-right))',
        bottom: `calc(${base}px + env(safe-area-inset-bottom))`,
        width: 52, height: 52, borderRadius: '50%',
        background: '#8B30D6', boxShadow: '0 6px 20px rgba(139,48,214,0.5)',
        display: 'grid', placeItems: 'center',
        textDecoration: 'none', zIndex: 1000,
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }} aria-hidden="true">💬</span>
    </a>
  )
}

function CatalogHeader({ light = false }: { light?: boolean }) {
  const w = useWidth()
  const small = w < 500
  return (
    <div style={{
      background: light ? 'transparent' : '#fff',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: `8px ${small ? 12 : 18}px`,
      borderBottom: light ? 'none' : '1px solid #eee',
      flexShrink: 0,
    }}>
      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: light ? 'rgba(255,255,255,0.5)' : '#767676', letterSpacing: 2 }}>
        CATÁLOGO TRIDI {company.year}
      </div>
      <TridiLogo light={light} small={small} />
    </div>
  )
}

// ── Page 1: Cover ─────────────────────────────────────────────────────────

function CoverPage({ onViewCatalog }: { onViewCatalog: () => void }) {
  const w = useWidth()
  const mobile = w < 500

  return (
    <div style={{ background: '#080A14', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', right: '-5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,48,214,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,48,214,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `12px ${mobile ? 14 : 22}px`, position: 'relative', zIndex: 2 }}>
        <TridiLogo light small={mobile} />
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>CATÁLOGO {company.year}</div>
      </div>

      {/* Main */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: mobile ? 'column' : 'row',
        alignItems: mobile ? 'flex-start' : 'center', justifyContent: 'center',
        padding: `0 ${mobile ? 14 : 24}px ${mobile ? 10 : 0}px`,
        position: 'relative', zIndex: 2, gap: mobile ? 12 : 40,
        maxWidth: 1100, width: '100%', margin: '0 auto',
      }}>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: mobile ? 'clamp(38px,14vw,60px)' : 'clamp(42px,7vw,68px)', color: '#fff', lineHeight: 0.88, letterSpacing: -1, textTransform: 'uppercase' }}>
            CATÁLOGO
          </div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: mobile ? 'clamp(28px,10vw,44px)' : 'clamp(32px,5.5vw,52px)', color: '#8B30D6', lineHeight: 0.88, letterSpacing: -1, textTransform: 'uppercase' }}>
            DE PRODUCTOS
          </div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: mobile ? 22 : 36, color: 'rgba(255,255,255,0.6)', lineHeight: 1, letterSpacing: 6, marginTop: 4 }}>
            {company.year}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {['🖨️ Impresión 3D', '🎨 Diseño Personalizado', '⚙️ Modelado 3D'].map(f => (
              <div key={f} style={{ background: 'rgba(139,48,214,0.15)', border: '1px solid rgba(139,48,214,0.35)', borderRadius: 4, padding: mobile ? '4px 10px' : '6px 12px', fontFamily: 'Barlow Condensed', fontSize: mobile ? 10 : 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 }}>
                {f}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onViewCatalog}
            style={{
              all: 'unset', boxSizing: 'border-box', cursor: 'pointer', marginTop: mobile ? 18 : 24,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#8B30D6', color: '#fff',
              fontFamily: 'Barlow Condensed', fontWeight: 800, letterSpacing: 1,
              fontSize: mobile ? 12 : 13,
              padding: mobile ? '12px 20px' : '13px 24px',
              borderRadius: 8, boxShadow: '0 6px 18px rgba(139,48,214,0.4)',
            }}
          >
            VER CATÁLOGO <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Hero image */}
        {!mobile && (
          <div style={{ width: 'clamp(200px, 22vw, 320px)', height: 'clamp(240px, 46vh, 440px)', flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(139,48,214,0.3)', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1776426270359-0277f3595496?w=400&h=480&fit=crop&auto=format"
              alt="Figura impresa en 3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,20,0.85) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: '#8B30D6', letterSpacing: 1.5 }}>FIGURA PREMIUM</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Impresión FLA · Alta calidad</div>
            </div>
          </div>
        )}
      </div>

      {/* Social footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `8px ${mobile ? 14 : 22}px`, background: 'rgba(139,48,214,0.08)', borderTop: '1px solid rgba(139,48,214,0.18)', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <a href={instagramHref(company.instagram)} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textDecoration: 'none' }}>📷 {company.instagram}</a>
          <a href={telHref(company.phone)} style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textDecoration: 'none' }}>📞 {company.phone}</a>
        </div>
        <a href={websiteHref(company.website)} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textDecoration: 'none' }}>🌐 {company.website}</a>
      </div>
    </div>
  )
}

// ── Page 2: Categories ────────────────────────────────────────────────────

function CategoriesPage({ onSelect }: { onSelect: (i: number) => void }) {
  const w = useWidth()
  const mobile = w < 500
  const cols = w < 420 ? 2 : 3

  return (
    <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: mobile ? 'flex-start' : 'center',
        padding: `12px ${mobile ? 12 : 18}px`, overflow: 'auto',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: mobile ? 24 : 30, color: '#0B0D1A', letterSpacing: -0.5, marginBottom: 2 }}>CATEGORÍAS</div>
          <div style={{ fontFamily: 'Barlow', fontSize: 10, color: '#767676', marginBottom: 14 }}>Explora nuestra colección completa de figuras impresas en 3D.</div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {categories.map((cat, i) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelect(i)}
                style={{
                  all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%',
                  background: '#0B0D1A', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${cat.accent}55`, transition: 'transform 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ paddingTop: '58%', overflow: 'hidden', position: 'relative' }}>
                  <img src={cat.img} alt={cat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(8,10,20,0.85))' }} />
                </div>
                <div style={{ padding: '7px 9px 9px', textAlign: 'left', borderTop: `3px solid ${cat.accent}` }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: 0.5 }}>{cat.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  )
}

// ── Page 3: Product Grid ───────────────────────────────────────────────────

function ProductCard({ p }: { p: typeof categories[number]['products'][number] }) {
  const w = useWidth()
  // Coincide con los cortes de columnas de ProductGridPage: con 4 columnas
  // (w >= 600) las tarjetas quedan bastante más grandes, así que el texto
  // interno puede crecer con ellas en vez de quedarse en el tamaño mínimo.
  const compact = w < 600
  return (
    <div
      style={{ background: '#fff', border: '1px solid #EAEBF0', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 18px rgba(139,48,214,0.13)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ paddingTop: '85%', position: 'relative', background: '#F5F5FA', overflow: 'hidden' }}>
        <img src={p.img} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: compact ? '8px 9px 10px' : '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: compact ? 3 : 5 }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: compact ? 13 : 16, color: '#0B0D1A', letterSpacing: 0.3 }}>{p.name}</div>
        <div style={{ fontFamily: 'Barlow', fontSize: compact ? 8 : 11, color: '#767676' }}>{p.code}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <svg width={compact ? 9 : 11} height={compact ? 9 : 11} viewBox="0 0 9 9" fill="none"><rect x="1" y="4" width="7" height="1" fill="#8B30D6" /><rect x="4" y="1" width="1" height="7" fill="#8B30D6" /></svg>
          <span style={{ fontFamily: 'Barlow', fontSize: compact ? 9 : 12, color: '#666' }}>{p.size}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
          <StarBadge />
          <span style={{ fontFamily: 'Barlow', fontSize: compact ? 8 : 12, color: '#8B30D6', fontWeight: 600 }}>{p.material}</span>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: compact ? 6 : 10, borderTop: '1px solid #F0F0F5' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: compact ? 15 : 19, color: '#0B0D1A' }}>{p.price}</div>
        </div>
      </div>
    </div>
  )
}

function ProductGridPage({ catIndex, onDetail }: { catIndex: number; onDetail: (pi: number) => void }) {
  const w = useWidth()
  const cat = categories[catIndex]
  const cols = w < 400 ? 2 : w < 600 ? 3 : 4

  return (
    <div style={{ background: '#F8F8FC', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader />

      <div style={{ flex: 1, padding: `12px ${w < 500 ? 12 : 18}px`, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: w < 500 ? 24 : 28, color: '#0B0D1A', letterSpacing: -0.5 }}>{cat.name}</div>
            <div style={{ fontFamily: 'Barlow', fontSize: w < 500 ? 10 : 12, color: '#767676', maxWidth: 320 }}>Figuras impresas en 3D de alta calidad. Ideales para coleccionistas y fans.</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: '50%', border: '3px solid #EAEBF0', background: 'linear-gradient(180deg,#fff 50%,#f0f0f5 50%)', flexShrink: 0 }} />
        </div>

        {cat.products.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 40, fontFamily: 'Barlow Condensed', color: '#767676', fontSize: 14 }}>
            Próximamente. Estamos preparando nuevos productos para esta categoría.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {cat.products.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onDetail(i)}
                style={{ all: 'unset', boxSizing: 'border-box', display: 'block', width: '100%', cursor: 'pointer' }}
              >
                <ProductCard p={p} />
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomBar />
    </div>
  )
}

// ── Page 4: Product Detail ─────────────────────────────────────────────────

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
    <a
      href={interestedHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackInterested}
      aria-label={`Me interesa ${product.name} — contactar por WhatsApp`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: '#8B30D6', color: '#fff', textDecoration: 'none',
        fontFamily: 'Barlow Condensed', fontWeight: 800, letterSpacing: 1,
        fontSize: size === 'lg' ? 14 : 12,
        padding: size === 'lg' ? '13px 16px' : '10px 14px',
        borderRadius: 8, marginTop: size === 'lg' ? 10 : 8,
        boxShadow: '0 4px 14px rgba(139,48,214,0.35)',
      }}
    >
      <span aria-hidden="true">💬</span> ME INTERESA
    </a>
  )

  const specsLeft = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 7 : 11 }}>
      {[
        { icon: '📏', label: product.size, sub: 'Altura aproximada' },
        { icon: '⚖️', label: product.weight, sub: 'Peso estimado' },
        { icon: '⭐', label: product.material, sub: 'Material de impresión' },
        { icon: '🎨', label: `${product.colors.length} color${product.colors.length === 1 ? '' : 'es'} disponible${product.colors.length === 1 ? '' : 's'}`, sub: '' },
        { icon: '🚚', label: company.delivery, sub: 'Tiempo de entrega' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: mobile ? 8 : 10 }}>
          <div style={{ width: mobile ? 24 : 28, height: mobile ? 24 : 28, borderRadius: 6, background: 'rgba(139,48,214,0.15)', display: 'grid', placeItems: 'center', fontSize: mobile ? 11 : 13, flexShrink: 0 }}>{s.icon}</div>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: mobile ? 11 : 13, color: '#fff' }}>{s.label}</div>
            {s.sub && <div style={{ fontFamily: 'Barlow', fontSize: mobile ? 8 : 10, color: 'rgba(255,255,255,0.6)' }}>{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  )

  const colorPicker = (swatchSize: number) => (
    product.colors.length > 0 && (
      <div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: mobile ? 9 : 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 8 }}>COLORES DISPONIBLES</div>
        <div style={{ display: 'flex', gap: mobile ? 9 : 8, flexWrap: 'wrap' }}>
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setActiveColor(i)}
              aria-pressed={activeColor === i}
              aria-label={c.name}
              title={c.name}
              style={{
                all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
                width: swatchSize, height: swatchSize, borderRadius: '50%', background: c.hex,
                border: activeColor === i ? '2px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                boxShadow: activeColor === i ? '0 0 0 2px #8B30D6' : 'none',
              }}
            />
          ))}
        </div>
        <div style={{ fontFamily: 'Barlow', fontSize: mobile ? 9 : 11, color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>
          Color seleccionado: <span style={{ color: '#fff', fontWeight: 600 }}>{product.colors[activeColor]?.name}</span>
        </div>
      </div>
    )
  )

  if (mobile) {
    return (
      <div style={{ background: '#0D0F22', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
        <CatalogHeader light />

        {/* Hero image */}
        <div style={{ height: 200, overflow: 'hidden', flexShrink: 0 }}>
          <img src={allImgs[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: '#8B30D6', letterSpacing: 2 }}>{product.code}</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 32, color: '#fff', lineHeight: 0.9 }}>{product.name}</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 24, color: '#8B30D6', marginTop: 4 }}>{product.price}</div>
          </div>

          {/* Sticky: en mobile todo este bloque hace scroll dentro del
              contenedor de la página — sin esto, "ME INTERESA" queda arriba
              del todo y desaparece apenas el cliente baja a ver specs,
              colores o miniaturas. */}
          <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#0D0F22', margin: '0 -16px', padding: '8px 16px' }}>
            {interesaButton('lg')}
          </div>

          <div>
            <div style={{ fontFamily: 'Barlow', fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 7, lineHeight: 1.5 }}>{product.desc}</div>
          </div>

          {specsLeft}

          {colorPicker(30)}

          {/* Thumbnails */}
          {allImgs.length > 1 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {allImgs.map((img, i) => (
                <button key={i} type="button" onClick={() => setActiveImg(i)} aria-pressed={i === activeImg} aria-label={`Foto ${i + 1} de ${product.name}`} style={{ flex: 1, height: 56, borderRadius: 6, overflow: 'hidden', border: i === activeImg ? '2px solid #8B30D6' : '2px solid transparent', cursor: 'pointer', padding: 0, background: '#1a1c30' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ background: 'rgba(139,48,214,0.12)', border: '1px solid rgba(139,48,214,0.3)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 11, color: '#8B30D6', letterSpacing: 1 }}>¿QUIERES ALGO PERSONALIZADO?</div>
            <div style={{ fontFamily: 'Barlow', fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Pedidos a medida y colores especiales disponibles.</div>
            <a href={telHref(company.phone)} style={{ display: 'block', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10, color: '#fff', marginTop: 4, textDecoration: 'none' }}>📞 {company.phone}</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left — dark */}
      <div style={{ width: '44%', background: '#0D0F22', display: 'flex', flexDirection: 'column', padding: '12px 16px', flexShrink: 0, overflow: 'auto' }}>
        <CatalogHeader light />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: '#8B30D6', letterSpacing: 2, marginTop: 8, marginBottom: 2 }}>{product.code}</div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 34, color: '#fff', lineHeight: 0.88, letterSpacing: -1 }}>{product.name}</div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 26, color: '#8B30D6', marginTop: 6 }}>{product.price}</div>
          <div style={{ maxWidth: 380, marginTop: 4 }}>{interesaButton('sm')}</div>
          <div style={{ fontFamily: 'Barlow', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 10, lineHeight: 1.6, maxWidth: 380 }}>{product.desc}</div>

          <div style={{ marginTop: 20 }}>{specsLeft}</div>

          <div style={{ marginTop: 20 }}>{colorPicker(24)}</div>

          {/* CTA */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(139,48,214,0.18)' }}>
            <div style={{ background: 'rgba(139,48,214,0.1)', border: '1px solid rgba(139,48,214,0.28)', borderRadius: 8, padding: '14px 16px', maxWidth: 380 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 13, color: '#8B30D6', letterSpacing: 1 }}>¿QUIERES ALGO PERSONALIZADO?</div>
              <div style={{ fontFamily: 'Barlow', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>Pedidos a medida y colores especiales disponibles.</div>
              <a href={telHref(company.phone)} style={{ display: 'block', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: '#fff', marginTop: 6, textDecoration: 'none' }}>📞 {company.phone}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right — white */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: '#767676', letterSpacing: 2 }}>CATÁLOGO TRIDI {company.year}</div>
        </div>

        <div style={{ flex: 1, padding: '10px 14px 8px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', background: '#F5F5FA', minHeight: 0 }}>
            <img src={allImgs[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {allImgs.length > 1 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {allImgs.map((img, i) => (
                <button key={i} type="button" onClick={() => setActiveImg(i)} aria-pressed={i === activeImg} aria-label={`Foto ${i + 1} de ${product.name}`} style={{ flex: 1, height: 58, borderRadius: 6, overflow: 'hidden', border: i === activeImg ? '2px solid #8B30D6' : '2px solid transparent', cursor: 'pointer', padding: 0, background: '#F5F5FA' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: '1px solid #F0F0F5' }}>
            {['🖨️ Impresión 3D', '🌈 Alta calidad', '⚡ Entrega rápida'].map(f => (
              <span key={f} style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: '#767676', letterSpacing: 0.5 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página 404 ───────────────────────────────────────────────────────────

function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: '#0D0F22', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader light />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 64, color: '#8B30D6', lineHeight: 1 }}>404</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 20, color: '#fff' }}>Producto no encontrado</div>
        <div style={{ fontFamily: 'Barlow', fontSize: 11, color: 'rgba(255,255,255,0.65)', maxWidth: 280, lineHeight: 1.5 }}>
          El link que seguiste puede haber cambiado o el producto ya no está disponible.
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            all: 'unset', boxSizing: 'border-box', cursor: 'pointer', marginTop: 8,
            background: '#8B30D6', color: '#fff',
            fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 12, letterSpacing: 1,
            padding: '11px 22px', borderRadius: 8,
          }}
        >
          VER CATEGORÍAS
        </button>
      </div>
    </div>
  )
}

// ── App shell ──────────────────────────────────────────────────────────────

type PageId = 'cover' | 'categories' | 'grid' | 'detail' | 'not-found'

export default function App() {
  const w = useWidth()
  const mobile = w < 500
  const [page, setPage] = useState<PageId>(() => computeInitialRoute().page)
  const [catIndex, setCatIndex] = useState(() => computeInitialRoute().catIndex)
  // null hasta que el usuario elige un producto — así "DETALLE" no aparece
  // en la navegación como si fuera una sección propia sin contexto.
  const [selected, setSelected] = useState<{ cat: number; product: number } | null>(() => computeInitialRoute().selected)

  // Botón atrás/adelante del navegador — vuelve a resolver el estado desde
  // la URL actual, igual que en la carga inicial.
  useEffect(() => {
    const onPopState = () => {
      const match = matchProductPath(window.location.pathname)
      if (match === 'not-found') {
        setPage('not-found')
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
      setSelected(null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // "PRODUCTOS" siempre muestra categories[catIndex] (por defecto la
  // primera), aunque el usuario nunca haya pasado por "CATEGORÍAS" — el
  // nombre de la categoría en la etiqueta evita que parezca "todos los
  // productos" cuando en realidad es solo una categoría puntual.
  const NAV: { id: PageId; label: string }[] = [
    { id: 'cover', label: 'INICIO' },
    { id: 'categories', label: 'CATEGORÍAS' },
    { id: 'grid', label: `PRODUCTOS · ${categories[catIndex].name.toUpperCase()}` },
    ...(selected ? [{ id: 'detail' as PageId, label: 'DETALLE' }] : []),
  ]

  const goCategory = (i: number) => {
    setCatIndex(i)
    setPage('grid')
    history.pushState(null, '', '/')
  }

  const goDetail = (pi: number) => {
    setSelected({ cat: catIndex, product: pi })
    setPage('detail')
    history.pushState(null, '', productPath(categories[catIndex], categories[catIndex].products[pi]))
  }

  const goHome = () => {
    setPage('categories')
    setSelected(null)
    history.pushState(null, '', '/')
  }

  const catalog = (
    page === 'cover'      ? <CoverPage onViewCatalog={goHome} /> :
    page === 'categories' ? <CategoriesPage onSelect={goCategory} /> :
    page === 'grid'       ? <ProductGridPage catIndex={catIndex} onDetail={goDetail} /> :
    page === 'not-found'  ? <NotFoundPage onBack={goHome} /> :
    selected              ? <ProductDetailPage catIndex={selected.cat} productIndex={selected.product} /> :
                            <CategoriesPage onSelect={goCategory} />
  )

  return (
    <div style={{ height: '100dvh', background: '#080A14', display: 'flex', flexDirection: 'column' }}>
      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: 3, padding: mobile ? '8px 12px' : '10px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(139,48,214,0.15)', flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0 }}>
        {NAV.map(n => (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              setPage(n.id)
              if (n.id === 'detail' && selected) {
                history.pushState(null, '', productPath(categories[selected.cat], categories[selected.cat].products[selected.product]))
              } else {
                history.pushState(null, '', '/')
              }
            }}
            style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: mobile ? 9 : 10, letterSpacing: 1,
              color: n.id === page ? '#fff' : 'rgba(255,255,255,0.55)',
              background: n.id === page ? '#8B30D6' : 'transparent',
              border: 'none', borderRadius: 5,
              padding: mobile ? '10px 12px' : '5px 13px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Catalog content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {catalog}
      </div>

      <WhatsappFloatButton />
    </div>
  )
}
