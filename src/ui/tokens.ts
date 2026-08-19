// Constantes JS de la arquitectura visual compartida. El sitio decide su
// layout responsive en JS (useWidth(), no media queries CSS), así que estos
// valores son la contraparte de los breakpoints documentados en index.css —
// úsalos en vez de volver a escribir un número de breakpoint a mano.

// "Modo compacto": una sola fuente de verdad para toda decisión de texto,
// spacing o layout mobile-vs-desktop. Reemplaza los 5 valores distintos
// (400/420/500/580/600) que convivían sin razón antes de esta arquitectura.
export const MOBILE_BREAKPOINT = 500

// Breakpoints de densidad de grilla — una preocupación distinta de "es
// mobile": cuántas columnas caben. Antes tenían pares de umbrales distintos
// para categorías y productos sin motivo; ahora ambas grillas usan esta
// única función.
const GRID_BREAKPOINT_SM = 480
const GRID_BREAKPOINT_LG = 900

export function gridColumns(width: number): 2 | 3 | 4 {
  if (width < GRID_BREAKPOINT_SM) return 2
  if (width < GRID_BREAKPOINT_LG) return 3
  return 4
}
