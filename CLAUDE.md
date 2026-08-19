# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Catálogo Tridi — a single-page product catalog site for a 3D-printing business
(figures/keychains/decor), built with the Figma Make React+Vite+Tailwind
scaffold described in AGENTS.md, deployed to Cloudflare Workers. Catalog
content (categories, products, company info) is edited by the non-technical
site owner through a Decap CMS admin panel at `/admin/` — **not** by editing
code. See `README.md` for the full editor-facing workflow documentation.

## Commands

- `pnpm dev` — runs `vite --host 0.0.0.0` (a dev server is normally already
  running on `$PORT`, default 8443; you usually don't need to start it)
- `pnpm build` — `vite build` (outputs to `dist/`, which `wrangler.jsonc`
  serves as static assets)
- `pnpm preview` — preview the production build
- `pnpm deploy` — `wrangler deploy` (manual deploy; in practice every
  `git push` to `main` triggers Cloudflare to build/deploy automatically —
  see Infrastructure below)
- `pnpm format` — `oxfmt`
- No test suite or linter is configured in this repo.

## Architecture

**Data flow: content JSON → `src/data/products.ts` → `src/App.tsx`.**

- `content/categories/*.json` — one file per category (e.g. `anime.json`,
  `pokemon.json`), each containing the category's metadata and its full list
  of products (name, price, size, weight, material, images, colors, desc).
- `content/settings/company.json` — single-file site-wide settings (name,
  phone, WhatsApp number, Instagram, delivery time, etc).
- `src/data/products.ts` uses `import.meta.glob('/content/categories/*.json', { eager: true })`
  to pull in every category file at build time, sorts by each category's
  `order` field, and exports `categories` and `company`. **Never hand-edit
  catalog content in this file or in `content/*.json` for day-to-day product
  changes** — that's the CMS's job via `/admin/`. Code changes only need to
  touch this file if the underlying data *shape* changes (new field, etc.),
  in which case `public/admin/config.yml` (the Decap CMS schema) must be
  updated to match.
- `src/App.tsx` is the entire application (~750 lines, single file): shared
  UI primitives (`TridiLogo`, `StarBadge`, contact-link helpers), then the
  four pages — `CoverPage`, `CategoriesPage`, a product grid page, and a
  product `DetailPage` — switched by a `PageId` union
  (`'cover' | 'categories' | 'grid' | 'detail' | 'not-found'`) held in
  top-level component state. There is no router library: navigation is done
  by hand with `history.pushState` + a `popstate` listener, and per-product
  URLs (`/producto/<category-slug>/<product-slug>`) are computed on the fly
  via `slugify()` — never persisted — so a product gets a working URL as soon
  as it's published from `/admin/`, and renaming/deleting a product simply
  makes the old URL 404 to a "Producto no encontrado" screen rather than
  breaking the app.
- Styling is inline `style={}` objects throughout `App.tsx` (not Tailwind
  classes), despite Tailwind v4 being wired up per AGENTS.md — match existing
  file's style when editing it.
- `trackEvent()` in `App.tsx` is a no-op analytics stub (console.log in dev
  only) — the single hook point for wiring a real analytics provider later.

## Infrastructure

- Repo: `github.com/AlexProyer/CatalogoTridi`, deployed to Cloudflare Workers
  (`wrangler.jsonc`: serves `./dist` as a SPA). Every push to `main` rebuilds
  and redeploys automatically.
- The `/admin/` Decap CMS panel (`public/admin/config.yml`, `index.html`)
  authenticates via GitHub OAuth through a separate proxy Worker,
  `tridi-decap-proxy` (code lives outside this repo, at
  `~/Documents/decap-proxy`). If CMS login breaks, check that proxy is
  deployed with its `GITHUB_OAUTH_ID`/`GITHUB_OAUTH_SECRET` secrets set.
- `public/admin/config.yml` is the **source of truth for the CMS field
  schema** — keep it in sync with the `Product`/`Category`/`CompanySettings`
  interfaces in `src/data/products.ts` whenever either changes.
