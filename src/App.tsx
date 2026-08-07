import { useState, useEffect } from 'react'
import { categories, featuredProduct, company } from './data/products'

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
  const sub = light ? 'rgba(255,255,255,0.55)' : '#888'
  const sz = small ? 24 : 32
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: small ? 6 : 8 }}>
      <svg width={sz} height={sz} viewBox="0 0 32 32" fill="none">
        <polygon points="16,2 30,28 2,28" fill="#8B30D6" />
        <polygon points="16,10 24,26 8,26" fill="rgba(255,255,255,0.15)" />
        <circle cx="16" cy="20" r="3" fill="#fff" />
      </svg>
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

function BottomBar({ dark = false, pageNum }: { dark?: boolean; pageNum?: number }) {
  const bg = dark ? '#1A0A36' : '#8B30D6'
  return (
    <div style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 16px', flexShrink: 0 }}>
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
      {pageNum !== undefined && (
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, flexShrink: 0 }}>
          Pág. {String(pageNum).padStart(2, '0')}
        </div>
      )}
    </div>
  )
}

function CatalogHeader({ light = false, pageLabel }: { light?: boolean; pageLabel?: string }) {
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
      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: light ? 'rgba(255,255,255,0.3)' : '#bbb', letterSpacing: 2 }}>
        CATÁLOGO TRIDI {company.year}
      </div>
      <TridiLogo light={light} small={small} />
      {pageLabel && (
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 9, color: '#8B30D6', letterSpacing: 1 }}>{pageLabel}</div>
      )}
    </div>
  )
}

// ── Page 1: Cover ─────────────────────────────────────────────────────────

function CoverPage() {
  const w = useWidth()
  const mobile = w < 500

  return (
    <div style={{ background: '#080A14', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', right: '-5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,48,214,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,48,214,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `12px ${mobile ? 14 : 22}px`, position: 'relative', zIndex: 2 }}>
        <TridiLogo light small={mobile} />
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>CATÁLOGO {company.year}</div>
      </div>

      {/* Main */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: mobile ? 'column' : 'row',
        alignItems: mobile ? 'flex-start' : 'center',
        padding: `0 ${mobile ? 14 : 24}px ${mobile ? 10 : 0}px`,
        position: 'relative', zIndex: 2, gap: mobile ? 12 : 16,
      }}>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: mobile ? 'clamp(38px,14vw,60px)' : 'clamp(42px,7vw,68px)', color: '#fff', lineHeight: 0.88, letterSpacing: -1, textTransform: 'uppercase' }}>
            CATÁLOGO
          </div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: mobile ? 'clamp(28px,10vw,44px)' : 'clamp(32px,5.5vw,52px)', color: '#8B30D6', lineHeight: 0.88, letterSpacing: -1, textTransform: 'uppercase' }}>
            DE PRODUCTOS
          </div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: mobile ? 22 : 36, color: 'rgba(255,255,255,0.4)', lineHeight: 1, letterSpacing: 6, marginTop: 4 }}>
            {company.year}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {['🖨️ Impresión 3D', '🎨 Diseño Personalizado', '⚙️ Modelado 3D'].map(f => (
              <div key={f} style={{ background: 'rgba(139,48,214,0.15)', border: '1px solid rgba(139,48,214,0.35)', borderRadius: 4, padding: '3px 9px', fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        {!mobile && (
          <div style={{ width: 200, height: 240, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(139,48,214,0.3)', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1776426270359-0277f3595496?w=400&h=480&fit=crop&auto=format"
              alt="Figura impresa en 3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,20,0.7) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10, color: '#8B30D6', letterSpacing: 2 }}>FIGURA PREMIUM</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Impresión FLA · Alta calidad</div>
            </div>
          </div>
        )}
      </div>

      {/* Social footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `8px ${mobile ? 14 : 22}px`, background: 'rgba(139,48,214,0.08)', borderTop: '1px solid rgba(139,48,214,0.18)', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>📷 {company.instagram}</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>📞 {company.phone}</span>
        </div>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>🌐 {company.website}</span>
      </div>
    </div>
  )
}

// ── Page 2: Categories ────────────────────────────────────────────────────

function CategoriesPage({ onSelect }: { onSelect: (i: number) => void }) {
  const w = useWidth()
  const cols = w < 420 ? 2 : 3

  return (
    <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CatalogHeader />

      <div style={{ flex: 1, padding: `12px ${w < 500 ? 12 : 18}px`, overflow: 'auto' }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: w < 500 ? 24 : 30, color: '#0B0D1A', letterSpacing: -0.5, marginBottom: 2 }}>CATEGORÍAS</div>
        <div style={{ fontFamily: 'Barlow', fontSize: 10, color: '#999', marginBottom: 14 }}>Explora nuestra colección completa de figuras impresas en 3D.</div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
          {categories.map((cat, i) => (
            <div
              key={cat.name}
              onClick={() => onSelect(i)}
              style={{ background: '#0B0D1A', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(139,48,214,0.2)', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ height: w < 420 ? 72 : 90, overflow: 'hidden', position: 'relative' }}>
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(8,10,20,0.85))' }} />
              </div>
              <div style={{ padding: '7px 9px 9px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: 0.5 }}>{cat.name}</div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: cat.accent, letterSpacing: 1, marginTop: 1 }}>{cat.pag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomBar pageNum={2} />
    </div>
  )
}

// ── Page 3: Product Grid ───────────────────────────────────────────────────

function ProductCard({ p }: { p: typeof categories[number]['products'][number] }) {
  return (
    <div
      style={{ background: '#fff', border: '1px solid #EAEBF0', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 18px rgba(139,48,214,0.13)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ paddingTop: '85%', position: 'relative', background: '#F5F5FA', overflow: 'hidden' }}>
        <img src={p.img} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '8px 9px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 13, color: '#0B0D1A', letterSpacing: 0.3 }}>{p.name}</div>
        <div style={{ fontFamily: 'Barlow', fontSize: 8, color: '#bbb' }}>{p.code}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="1" y="4" width="7" height="1" fill="#8B30D6" /><rect x="4" y="1" width="1" height="7" fill="#8B30D6" /></svg>
          <span style={{ fontFamily: 'Barlow', fontSize: 9, color: '#666' }}>{p.size}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
          <StarBadge />
          <span style={{ fontFamily: 'Barlow', fontSize: 8, color: '#8B30D6', fontWeight: 600 }}>PLA Premium</span>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '1px solid #F0F0F5' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 15, color: '#0B0D1A' }}>{p.price}</div>
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
            <div style={{ fontFamily: 'Barlow', fontSize: 10, color: '#999', maxWidth: 260 }}>Figuras impresas en 3D de alta calidad. Ideales para coleccionistas y fans.</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: '50%', border: '3px solid #EAEBF0', background: 'linear-gradient(180deg,#fff 50%,#f0f0f5 50%)', flexShrink: 0 }} />
        </div>

        {cat.products.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 40, fontFamily: 'Barlow Condensed', color: '#bbb', fontSize: 14 }}>
            Próximamente — agrega productos en <code>src/data/products.ts</code>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
            {cat.products.map((p, i) => (
              <div key={p.name} onClick={() => onDetail(i)} style={{ cursor: 'pointer' }}>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomBar pageNum={4} />
    </div>
  )
}

// ── Page 4: Product Detail ─────────────────────────────────────────────────

function ProductDetailPage({ catIndex, productIndex }: { catIndex: number; productIndex: number }) {
  const w = useWidth()
  const mobile = w < 580
  const cat = categories[catIndex]
  const product = cat.products[productIndex] ?? cat.products[0]
  const fd = featuredProduct

  const allImgs = [product.img, ...fd.extraImgs]
  const [activeImg, setActiveImg] = useState(0)

  if (!product) return null

  const specsLeft = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {[
        { icon: '📏', label: product.size, sub: 'Altura aproximada' },
        { icon: '⚖️', label: fd.weight, sub: 'Peso estimado' },
        { icon: '⭐', label: fd.material, sub: 'Material de impresión' },
        { icon: '🎨', label: '6+ Colores disponibles', sub: '' },
        { icon: '🚚', label: fd.delivery, sub: 'Tiempo de entrega' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(139,48,214,0.15)', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0 }}>{s.icon}</div>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 11, color: '#fff' }}>{s.label}</div>
            {s.sub && <div style={{ fontFamily: 'Barlow', fontSize: 8, color: 'rgba(255,255,255,0.38)' }}>{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
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
            <div style={{ fontFamily: 'Barlow', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 7, lineHeight: 1.5 }}>{product.desc}</div>
          </div>

          {specsLeft}

          {/* Color swatches */}
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 6 }}>COLORES DISPONIBLES</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {fd.colorSwatches.map((c, i) => (
                <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.15)' }} />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: 6 }}>
            {allImgs.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ flex: 1, height: 56, borderRadius: 6, overflow: 'hidden', border: i === activeImg ? '2px solid #8B30D6' : '2px solid transparent', cursor: 'pointer', padding: 0, background: '#1a1c30' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: 'rgba(139,48,214,0.12)', border: '1px solid rgba(139,48,214,0.3)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 11, color: '#8B30D6', letterSpacing: 1 }}>¿QUIERES ALGO PERSONALIZADO?</div>
            <div style={{ fontFamily: 'Barlow', fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Pedidos a medida y colores especiales disponibles.</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10, color: '#fff', marginTop: 4 }}>📞 {company.phone}</div>
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

        <div style={{ fontFamily: 'Barlow Condensed', fontSize: 9, color: '#8B30D6', letterSpacing: 2, marginTop: 8, marginBottom: 2 }}>{product.code}</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 34, color: '#fff', lineHeight: 0.88, letterSpacing: -1 }}>{product.name}</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 26, color: '#8B30D6', marginTop: 6 }}>{product.price}</div>
        <div style={{ fontFamily: 'Barlow', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 7, lineHeight: 1.5, maxWidth: 210 }}>{product.desc}</div>

        <div style={{ marginTop: 12 }}>{specsLeft}</div>

        {/* Color swatches */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: 'rgba(255,255,255,0.32)', letterSpacing: 2, marginBottom: 6 }}>COLORES DISPONIBLES</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {fd.colorSwatches.map((c, i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.12)' }} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(139,48,214,0.18)' }}>
          <div style={{ background: 'rgba(139,48,214,0.1)', border: '1px solid rgba(139,48,214,0.28)', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 10, color: '#8B30D6', letterSpacing: 1 }}>¿QUIERES ALGO PERSONALIZADO?</div>
            <div style={{ fontFamily: 'Barlow', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Pedidos a medida y colores especiales disponibles.</div>
            <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10, color: '#fff', marginTop: 4 }}>📞 {company.phone}</div>
          </div>
        </div>
      </div>

      {/* Right — white */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: '#bbb', letterSpacing: 2 }}>CATÁLOGO TRIDI {company.year}</div>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 9, color: '#8B30D6', letterSpacing: 1 }}>Pág. 06</div>
        </div>

        <div style={{ flex: 1, padding: '10px 14px 8px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', background: '#F5F5FA', minHeight: 0 }}>
            <img src={allImgs[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {allImgs.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ flex: 1, height: 58, borderRadius: 6, overflow: 'hidden', border: i === activeImg ? '2px solid #8B30D6' : '2px solid transparent', cursor: 'pointer', padding: 0, background: '#F5F5FA' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: '1px solid #F0F0F5' }}>
            {['🖨️ Impresión 3D', '🌈 Alta calidad', '⚡ Entrega rápida'].map(f => (
              <span key={f} style={{ fontFamily: 'Barlow Condensed', fontSize: 8, color: '#aaa', letterSpacing: 0.5 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── App shell ──────────────────────────────────────────────────────────────

type PageId = 'cover' | 'categories' | 'grid' | 'detail'

export default function App() {
  const w = useWidth()
  const mobile = w < 500
  const [page, setPage] = useState<PageId>('cover')
  const [catIndex, setCatIndex] = useState(0)
  const [productIndex, setProductIndex] = useState(0)

  const NAV: { id: PageId; label: string }[] = [
    { id: 'cover', label: 'PORTADA' },
    { id: 'categories', label: 'CATEGORÍAS' },
    { id: 'grid', label: 'PRODUCTOS' },
    { id: 'detail', label: 'DETALLE' },
  ]

  const goCategory = (i: number) => {
    setCatIndex(i)
    setPage('grid')
  }

  const goDetail = (pi: number) => {
    setProductIndex(pi)
    setPage('detail')
  }

  const catalog = (
    page === 'cover'      ? <CoverPage /> :
    page === 'categories' ? <CategoriesPage onSelect={goCategory} /> :
    page === 'grid'       ? <ProductGridPage catIndex={catIndex} onDetail={goDetail} /> :
                            <ProductDetailPage catIndex={catIndex} productIndex={productIndex} />
  )

  const currentIdx = NAV.findIndex(n => n.id === page)

  return (
    <div style={{ minHeight: '100vh', background: '#080A14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: mobile ? '12px 8px' : '20px 16px' }}>
      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: mobile ? 9 : 10, letterSpacing: 1,
              color: n.id === page ? '#fff' : 'rgba(255,255,255,0.35)',
              background: n.id === page ? '#8B30D6' : 'transparent',
              border: 'none', borderRadius: 5,
              padding: mobile ? '5px 10px' : '5px 13px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Catalog viewport */}
      <div style={{
        width: '100%',
        maxWidth: page === 'detail' ? 860 : 800,
        height: mobile ? 'calc(100vh - 120px)' : 580,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 28px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(139,48,214,0.2)',
      }}>
        {catalog}
      </div>

      {/* Prev / Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
        <button
          onClick={() => currentIdx > 0 && setPage(NAV[currentIdx - 1].id)}
          disabled={currentIdx === 0}
          style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(139,48,214,0.35)', background: currentIdx === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(139,48,214,0.15)', color: currentIdx === 0 ? 'rgba(255,255,255,0.15)' : '#fff', cursor: currentIdx === 0 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
          {currentIdx + 1} / {NAV.length}
        </div>
        <button
          onClick={() => currentIdx < NAV.length - 1 && setPage(NAV[currentIdx + 1].id)}
          disabled={currentIdx === NAV.length - 1}
          style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(139,48,214,0.35)', background: currentIdx === NAV.length - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(139,48,214,0.15)', color: currentIdx === NAV.length - 1 ? 'rgba(255,255,255,0.15)' : '#fff', cursor: currentIdx === NAV.length - 1 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L10 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  )
}
