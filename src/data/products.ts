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
  price: string            // Precio (ej: "$35,000")
  weight: string            // Peso estimado (ej: "120 g")
  material: string           // Material de impresión (ej: "PLA Premium")
  img: string                 // URL de la imagen principal
  extraImgs: string[]          // URLs de fotos adicionales (puede ir vacío)
  colors: ProductColor[]        // Colores disponibles para este producto
  desc: string                   // Descripción corta del producto
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
      extraImgs: p.extraImgs ?? [],
      colors: p.colors ?? [],
      weight: p.weight ?? '',
      desc: p.desc ?? '',
    })),
  }))

export const company: CompanySettings = Object.values(companySettings)[0].default
