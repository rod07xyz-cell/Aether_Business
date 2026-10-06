# Checklist de lanzamiento – web de aerotermia

Basado en el plan `01-plan-nicho-aerotermia.md`. Marca cada paso al completarlo.

## A. Dominio y publicación

- [x] **Dominio**: `xfan.xyz` (Namecheap), nameservers apuntando a Cloudflare.
- [x] Web estática (Astro) en este repositorio, rama `Proyecto_AdSense`.
- [x] Publicada en Cloudflare Workers (`proyecto-adsense`) con dominios `xfan.xyz` y `www.xfan.xyz`.
- [ ] Certificado SSL activo y **Always Use HTTPS** activado (SSL/TLS → Edge Certificates).
- [ ] Regla de redirección `www` → sin `www` (Rules → Redirect Rules → "Redirect from WWW to root").
- [ ] Comprobar historial del dominio: buscar `site:xfan.xyz` en Google y revisarlo en web.archive.org.

## B. Google y legal

- [ ] **Google Search Console**: propiedad de dominio `xfan.xyz`, verificación TXT y envío de `sitemap-index.xml`.
- [ ] Decidir si añadir NIF en el aviso legal (LSSI).
- [ ] **Google AdSense** con 30‑40 artículos publicados; después poner el ID en `src/consts.ts`, crear `public/ads.txt` y activar el mensaje de consentimiento de Google (Privacidad y mensajes).
- [ ] Amazon Afiliados (opcional, mes 3+).

## C. Contenido

- [ ] Publicar los 30 artículos iniciales (orden en sección 4 del plan).
- [ ] Cada artículo: 1 keyword principal, 800‑2.000 palabras, H2/H3, FAQ, 3+ enlaces internos, imagen destacada, meta descripción.
- [ ] Revisión humana de cifras (precios, ayudas, deducciones) antes de publicar.

## D. Indexación y tráfico

- [ ] Enviar `sitemap_index.xml` (Rank Math) en Search Console.
- [ ] Solicitar indexación manual de los pilares.
- [ ] (Opcional) Vídeos cortos en TikTok/Reels/Shorts resolviendo dudas y enlazando a la web.

## E. Monetización

- [ ] Solicitar AdSense con 30‑40 artículos publicados.
- [ ] Empezar con anuncios automáticos; pasar a manuales con 10.000 visitas/mes.
- [ ] Mes 6+: contactar instaladores para venta de leads.

## Nota sobre «retención artificial»

Barras de progreso, enlaces «Siguiente artículo» y buen enlazado interno: **sí**.
Dividir artículos en varias páginas *solo* para mostrar más anuncios: **evitar**. Las políticas de AdSense y Google penalizan la navegación diseñada para inflar impresiones de anuncios, y puede costarte la cuenta.
