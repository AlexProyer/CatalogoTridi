# Catálogo Tridi — cómo editar productos sin tocar código

El catálogo ahora se administra desde un panel web en **`/admin/`** (por ejemplo
`https://tu-sitio.pages.dev/admin/`). Desde ahí podés agregar, editar o borrar
categorías y productos, y subir fotos directo desde el celular o la compu — no
hace falta abrir ningún archivo de código.

> Nota de configuración inicial: hasta que se complete el setup de infraestructura
> (repo de GitHub + Cloudflare Pages + OAuth App, ver más abajo), el panel no va a
> poder guardar cambios reales — solo funciona una vez conectado a un repo real.

## Cómo agregar un producto nuevo

1. Entrá a `/admin/` y hacé clic en **"Iniciar sesión con GitHub"**.
2. Elegí la colección **Categorías**, abrí la categoría donde va el producto
   (ej: "Pokémon").
3. Bajá hasta **Productos** y hacé clic en **"Add"** (agregar).
4. Completá: código (opcional), nombre, tamaño (ej: `15 cm`), precio (ej:
   `$35,000`), descripción corta, y subí la foto tocando el campo **Foto**.
5. Hacé clic en **"Publish"** (arriba a la derecha). El sitio se reconstruye
   solo — el cambio queda visible en 1-2 minutos.

Para editar o borrar un producto existente, es el mismo camino: entrá a la
categoría, buscá el producto en la lista y editá los campos o usá el ícono de
basura para eliminarlo.

Para agregar una **categoría nueva**, usá "Add categoría" desde la pantalla
principal de la colección — necesita nombre, texto de página (ej: `Pág. 04`),
imagen de portada, color de acento, y un número de **orden** (define en qué
posición aparece en la lista de categorías; usá números salteados como 10, 20,
30 para poder insertar categorías en el medio después).

## Fotos: formato y tamaño recomendado

- **Cuadradas** (proporción 1:1) — el catálogo las recorta automáticamente,
  pero se ven mejor si ya vienen cuadradas.
- Tamaño recomendado: **800×800 px**. No hace falta más resolución para cómo
  se muestran en el catálogo.
- Formato JPG o PNG, livianas (idealmente menos de 500 KB) — las fotos quedan
  guardadas dentro del propio repositorio del sitio, así que fotos muy pesadas
  hacen más lento el proceso de guardado y descarga del repo con el tiempo.

## Qué controla cada campo

| Campo | Dónde se ve |
|---|---|
| Nombre / Precio / Tamaño / Código | Tarjeta del producto y página de detalle |
| Foto | Tarjeta del producto y foto principal del detalle |
| Descripción | Texto corto debajo del precio en la página de detalle |
| Categoría → Color de acento | Color de la etiqueta "Pág. XX" en la portada de categorías |
| Configuración → Datos de la empresa | Teléfono, Instagram, sitio web y año que aparecen en el pie de cada página |
| Configuración → Producto destacado | Peso, material, tiempo de entrega y colores disponibles que se muestran en toda página de detalle |

## Por qué no se agregaron dependencias al sitio

El panel (Decap CMS) vive en una página aparte (`/admin/`) que carga su propio
script desde un CDN solo cuando alguien visita esa URL. **No se agregó nada al
`package.json`** ni al catálogo que ven los clientes — el tiempo de carga del
catálogo público es idéntico a antes.

## Infraestructura necesaria (una sola vez)

Este panel necesita que el sitio esté en un repositorio de GitHub y se publique
con Cloudflare Pages (en vez del deploy propio de Figma Make). El repo ya está
creado: [github.com/AlexProyer/CatalogoTridi](https://github.com/AlexProyer/CatalogoTridi),
y [public/admin/config.yml](public/admin/config.yml) ya apunta ahí. Faltan 2
pasos, cada uno requiere tu cuenta:

1. **Cloudflare Pages** → crear un proyecto nuevo conectado a ese repo.
   Comando de build: `pnpm build` — carpeta de salida: `dist`.
2. **GitHub → Settings → Developer settings → OAuth Apps** → crear una OAuth
   App nueva. *Homepage URL*: la URL de tu sitio en Cloudflare Pages.
   *Authorization callback URL*: esa misma URL + `/admin/`.

El editor de Figma Make se puede seguir usando para retocar el diseño cuando
haga falta — lo único que cambia es que **publicar** pasa a ser "guardar en
GitHub → Cloudflare Pages construye solo", en vez de `figma make deploy`.
