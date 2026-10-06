# Aether_Business · xfan.xyz

Web de contenido sobre aerotermia y bombas de calor, monetizada con Google AdSense. Está hecha con [Astro](https://astro.build) y se publica en Cloudflare Pages.

- [Plan de nicho (informe SEO/negocio)](docs/01-plan-nicho-aerotermia.md)
- [Checklist de lanzamiento](docs/02-checklist-lanzamiento.md)

## Estructura

| Ruta | Qué es |
|---|---|
| `src/content/articulos/*.md` | Artículos. El nombre del archivo es la URL (`precio-aerotermia.md` → `/precio-aerotermia/`). |
| `src/consts.ts` | Nombre de la web, datos del titular, categorías e ID de AdSense. |
| `src/pages/` | Inicio, categorías, páginas legales, contacto y sobre nosotros. |
| `src/styles/global.css` | Estilos. |

## Publicar un artículo nuevo

Crea un archivo `.md` en `src/content/articulos/` con esta cabecera y súbelo a la rama:

```md
---
title: "Título SEO del artículo"
description: "Meta descripción de 120-160 caracteres."
category: precios   # precios | consumo | como-funciona | marcas | ayudas | averias-mantenimiento | instalaciones
pubDate: 2026-10-10
faq:
  - q: "¿Pregunta?"
    a: "Respuesta."
---

Texto del artículo en Markdown...
```

Cloudflare Pages reconstruye la web automáticamente con cada push.

## Activar AdSense

Cuando Google apruebe la cuenta, pon tu ID de editor en `ADSENSE_CLIENT` dentro de `src/consts.ts` (por ejemplo `'ca-pub-1234567890123456'`) y crea `public/ads.txt` con la línea que te indique AdSense.

## Desarrollo local

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # genera dist/
```

## Despliegue en Cloudflare (Workers con static assets)

El proyecto de Cloudflare se llama `proyecto-adsense` y usa `wrangler.jsonc`.

- Rama de producción: `Proyecto_AdSense`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Variable de build: `NODE_VERSION` = `22` (Astro necesita Node 22.12 o superior; también lo indica `.nvmrc`)
