// ─────────────────────────────────────────────────────────────────────────────
// Ensambla los datos del catálogo desde content/ (editable con el panel /admin/).
// No edites este archivo para cambiar productos — usa el panel o los JSON en content/.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductColor {
  name: string // Nombre del color (ej: "Morado")
  hex: string  // Color en hex (ej: "#8B30D6")
}

export interface Product {
  code: string          // Código SKU del producto
  name: string           // Nombre del producto
  size: string            // Tamaño (ej: "15 cm")
  price: number            // Precio en pesos, solo el número (ej: 35000) — se formatea con formatPrice() al mostrarlo
  weight: string            // Peso estimado (ej: "120 g")
  material: string           // Material de impresión (ej: "PLA Premium")
  img: string                 // URL de la imagen principal
  extraImgs: string[]          // URLs de fotos adicionales (puede ir vacío)
  colors: ProductColor[]        // Colores disponibles para este producto
  desc: string                   // Descripción corta del producto
}

// Único punto donde se le da forma de precio en pesos colombianos al número
// crudo que guarda el panel — así el editor solo escribe dígitos (el widget
// `number` del CMS ya le impide escribir texto) y nunca puede quedar un
// precio "plano" o con un formato distinto al del resto del catálogo.
const priceFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
export function formatPrice(value: number): string {
  return priceFormatter.format(value)
}

export interface Category {
  name: string    // Nombre de la categoría
  img: string     // URL de imagen de portada
  accent: string  // Color de acento en hex
  order: number   // Orden de aparición
  products: Product[]
}

interface CompanySettings {
  name: string
  sub: string
  phone: string
  instagram: string
  website: string
  year: string
  delivery: string // Tiempo de entrega general (ej: "3 – 5 días hábiles")
  whatsapp: string // Número de WhatsApp en formato internacional sin signos (ej: "573174271275")
}

const categoryModules = import.meta.glob<{ default: Category }>('/content/categories/*.json', { eager: true })
const companySettings = import.meta.glob<{ default: CompanySettings }>('/content/settings/company.json', { eager: true })

// El panel (Decap CMS) omite por completo una clave de tipo lista (colors,
// extraImgs) cuando queda vacía, en vez de guardar `[]` — así que un
// producto nuevo sin colores o sin fotos adicionales llega acá con esos
// campos en `undefined`. Sin este saneo, `product.colors.length` o el
// spread de `extraImgs` explotan al renderizar el detalle.
export const categories: Category[] = Object.values(categoryModules)
  .map(m => m.default)
  .sort((a, b) => a.order - b.order)
  .map(cat => ({
    ...cat,
    products: cat.products.map(p => ({
      ...p,
      code: p.code ?? '',
      extraImgs: p.extraImgs ?? [],
      colors: p.colors ?? [],
      weight: p.weight ?? '',
      desc: p.desc ?? '',
      // Number(...) por si queda algún precio viejo guardado como texto
      // (ej. "$35,000" de antes de que el campo fuera numérico) — así no
      // se rompe con NaN, se ve $0 y es evidente que hay que corregirlo.
      price: typeof p.price === 'number' ? p.price : Number(String(p.price).replace(/[^0-9.-]/g, '')) || 0,
    })),
  }))

export const company: CompanySettings = Object.values(companySettings)[0].default
