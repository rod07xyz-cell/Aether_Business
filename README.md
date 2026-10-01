# Aether — Web

Web de Aether: automatización para clínicas de fisioterapia, dentistas, gimnasios y negocios locales.

Es una web estática (HTML + CSS + JS, sin dependencias) con navegación por vistas: cada sección
(Inicio, Soluciones, Demo citas, Asistente 24h, Planes, Contacto) se abre al pulsar en el menú o en
las tarjetas, en lugar de bajar por una página larga. Los enlaces directos funcionan (`index.html#demo-citas`).

## Ver en local

```bash
cd Aether
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Configuración (antes de publicar)

Todo está en **`Aether/scripts/config.js`**:

| Campo | Qué poner | Si se deja vacío |
|---|---|---|
| `formspreeId` | ID del formulario de [Formspree](https://formspree.io) (lo que va tras `/f/`) | El formulario abre el email del visitante con el mensaje preparado |
| `whatsapp` | Número internacional sin `+` ni espacios, p. ej. `34612345678` | Se ocultan los botones de WhatsApp |
| `phone` | Teléfono visible, p. ej. `+34 612 345 678` | Se oculta |
| `email` | Email de contacto | — |
| `calLink` | Enlace de Cal.eu para reservar llamadas | — |

Pendiente de revisar además:
- **Precios** de la vista Planes (`index.html`, busca `Precios orientativos`).
- **Datos fiscales** en `privacidad.html` y `aviso-legal.html` (busca `[COMPLETAR]`).
- Textos de ejemplo de las demos (horarios, precios de cada sector) en `scripts/main.js` → `SECTORS`.

## Estructura

```
Aether/
├── index.html            # Todas las vistas
├── privacidad.html, aviso-legal.html, cookies.html
├── favicon.svg
├── scripts/config.js     # Configuración editable
├── scripts/main.js       # Router de vistas, demos, formulario
└── styles/               # reset, variables (colores), main
```

## Publicar gratis

- **GitHub Pages**: Settings → Pages → rama `Página_Web_Aether`, carpeta raíz; la web queda en `/Aether/`.
- **Netlify / Cloudflare Pages**: arrastra la carpeta `Aether` o conecta el repo con directorio de publicación `Aether`.
