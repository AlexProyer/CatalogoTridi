# Catálogo Tridi — cómo editar productos sin tocar código

El catálogo ahora se administra desde un panel web en
**[catalogo-tridi.alexbuitrago156.workers.dev/admin/](https://catalogo-tridi.alexbuitrago156.workers.dev/admin/)**.
Desde ahí podés agregar, editar o borrar categorías y productos, y subir fotos
directo desde el celular o la compu — no hace falta abrir ningún archivo de
código.

## Compartir el link de un producto

Cada producto tiene su propia URL, por ejemplo:
`catalogo-tridi.alexbuitrago156.workers.dev/producto/anime/goku`. Se genera
sola a partir del nombre de la categoría y del producto — no hay que
configurar nada, y funciona apenas publicás el producto desde `/admin/`.
Sirve para pegar el link directo en Instagram, WhatsApp, etc.

Si compartís un link y después le cambiás el nombre al producto (o lo
borrás), ese link viejo deja de funcionar y muestra una página de "Producto
no encontrado" con un botón para volver a Categorías — no rompe el sitio.

## Cómo agregar un producto nuevo

1. Entrá a `/admin/` y hacé clic en **"Iniciar sesión con GitHub"**.
2. Elegí la colección **Categorías**, abrí la categoría donde va el producto
   (ej: "Pokémon").
3. Bajá hasta **Productos** y hacé clic en **"Add"** (agregar).
4. Completá: código (opcional), nombre, tamaño (ej: `15 cm`), precio (ej:
   `$35,000`), peso (ej: `120 g`), material (ej: `PLA Premium`), descripción
   corta, y subí la **foto principal**.
5. Si tenés más fotos del mismo producto, agregalas en **"Fotos adicionales"**
   — si no cargás ninguna, el detalle del producto solo muestra la foto
   principal (sin miniaturas). Si querés ofrecer varios colores, agregalos en
   **"Colores disponibles"** (nombre + color) — el cliente va a poder elegir
   cuál quiere ver en la página de detalle.
6. Hacé clic en **"Publish"** (arriba a la derecha). El sitio se reconstruye
   solo — el cambio queda visible en 1-2 minutos.

Cada producto tiene sus propios datos — cambiar el peso, material, fotos o
colores de un producto no afecta a ningún otro.

Para editar o borrar un producto existente, es el mismo camino: entrá a la
categoría, buscá el producto en la lista y editá los campos o usá el ícono de
basura para eliminarlo.

Para agregar una **categoría nueva**, usá "Add categoría" desde la pantalla
principal de la colección — necesita nombre, imagen de portada, color de
acento, y un número de **orden** (define en qué posición aparece en la lista
de categorías; usá números salteados como 10, 20, 30 para poder insertar
categorías en el medio después).

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
| Peso / Material | Fila de especificaciones en la página de detalle de ese producto |
| Foto principal | Tarjeta del producto y foto grande del detalle |
| Fotos adicionales | Miniaturas debajo de la foto principal en el detalle (si hay al menos una) |
| Colores disponibles | Círculos seleccionables en el detalle — el cliente puede tocarlos para ver cuál eligió |
| Descripción | Texto corto debajo del precio en la página de detalle |
| Categoría → Color de acento | Franja de color en las tarjetas de categoría |
| Configuración → Datos de la empresa | Teléfono, Instagram, sitio web, año, tiempo de entrega y **WhatsApp** (botón "ME INTERESA" del detalle y botón flotante de todo el sitio) |

## Botones de WhatsApp

Hay dos, con propósitos distintos:

- **"💬 ME INTERESA"** — en la página de detalle de cada producto, cerca del
  precio. Abre WhatsApp con un mensaje ya armado que incluye nombre, código,
  precio y el color que el cliente tenga seleccionado en ese momento (si el
  producto tiene un solo color, o ninguno, esa línea no aparece).
- **Botón flotante (💬 morado, esquina inferior)** — visible en las 4
  pantallas, para cuando el cliente todavía no está viendo un producto
  puntual. Abre WhatsApp con un mensaje genérico de contacto.

Ambos usan el mismo número, definido una sola vez en **Configuración → Datos
de la empresa → WhatsApp** (formato: solo números con código de país, ej.
`573174271275`, sin `+` ni espacios).

## Por qué no se agregaron dependencias al sitio

El panel (Decap CMS) vive en una página aparte (`/admin/`) que carga su propio
script desde un CDN solo cuando alguien visita esa URL — no agrega nada al
catálogo que ven los clientes, el tiempo de carga es idéntico a antes. La única
dependencia nueva en `package.json` es `wrangler` (la herramienta de línea de
comandos de Cloudflare) — se usa solo durante el build/deploy, nunca se envía
al navegador.

## Infraestructura

- **Repo**: [github.com/AlexProyer/CatalogoTridi](https://github.com/AlexProyer/CatalogoTridi)
- **Sitio (Cloudflare Workers)**: [catalogo-tridi.alexbuitrago156.workers.dev](https://catalogo-tridi.alexbuitrago156.workers.dev)
- **Panel**: [catalogo-tridi.alexbuitrago156.workers.dev/admin/](https://catalogo-tridi.alexbuitrago156.workers.dev/admin/)

El login del panel usa GitHub como backend, que necesita un pequeño servidor
intermediario para el intercambio OAuth (GitHub no permite hacerlo 100% desde
el navegador). Ese intermediario es otro Worker aparte,
[tridi-decap-proxy](https://tridi-decap-proxy.alexbuitrago156.workers.dev)
(código en `~/Documents/decap-proxy`, clonado de
[sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)), con
la OAuth App de GitHub "Panel Tridi" configurada para hablar con él. Si el
login del panel deja de funcionar algún día, revisar primero que ese Worker
esté desplegado y con sus secrets (`GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET`)
cargados en Cloudflare → Workers & Pages → `tridi-decap-proxy` → Settings →
Variables and Secrets.

Cada `git push` a `main` reconstruye y redeploya el sitio automáticamente. El
editor de Figma Make se puede seguir usando para retocar el diseño cuando haga
falta — lo único que cambia es que **publicar** pasa a ser "guardar en GitHub
→ Cloudflare construye y despliega solo", en vez de `figma make deploy`.
