// ─────────────────────────────────────────────────────────────────────────────
// Ensambla los datos del catálogo desde content/ (editable con el panel /admin/).
// No edites este archivo para cambiar productos — usa el panel o los JSON en content/.
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
  code: string   // Código SKU del producto
  name: string   // Nombre del producto
  size: string   // Tamaño (ej: "15 cm")
  price: string  // Precio (ej: "$35,000")
  img: string    // URL de la imagen (Unsplash, local, etc.)
  desc: string   // Descripción corta del producto
}

export interface Category {
  name: string   // Nombre de la categoría
  pag: string    // Número de página en el catálogo
  img: string    // URL de imagen de portada
  accent: string // Color de acento en hex
  order: number  // Orden de aparición
  products: Product[]
}

interface CompanySettings {
  name: string
  sub: string
  phone: string
  instagram: string
  website: string
  year: string
}

interface FeaturedSettings {
  weight: string
  material: string
  delivery: string
  colorSwatches: string[]
  extraImgs: string[]
}

const categoryModules = import.meta.glob<{ default: Category }>('/content/categories/*.json', { eager: true })
const companySettings = (import.meta.glob<{ default: CompanySettings }>('/content/settings/company.json', { eager: true }))
const featuredSettings = (import.meta.glob<{ default: FeaturedSettings }>('/content/settings/featured.json', { eager: true }))

export const categories: Category[] = Object.values(categoryModules)
  .map(m => m.default)
  .sort((a, b) => a.order - b.order)

export const company: CompanySettings = Object.values(companySettings)[0].default

const featured: FeaturedSettings = Object.values(featuredSettings)[0].default

// ─── Producto estrella para la página de detalle ──────────────────────────
export const featuredProduct = {
  weight: featured.weight,
  material: featured.material,
  delivery: featured.delivery,
  colorSwatches: featured.colorSwatches,
  extraImgs: featured.extraImgs,
}
