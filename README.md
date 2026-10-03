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

## Configuración privada (no se sube a GitHub)

Hay dos archivos con datos privados que están en `.gitignore`. Se crean a partir de su plantilla y se suben a mano al hosting:

| Archivo | Plantilla | Qué lleva |
|---|---|---|
| `Aether/scripts/config.js` | `config.example.js` | ID de Formspree, WhatsApp, teléfono, email, enlace de Cal.eu |
| `Aether/api/config.php` | `config.example.php` | Clave de API de Groq, modelo y límite de mensajes por hora del asistente |

Si `config.js` no existe, la web funciona igual: se ocultan WhatsApp y teléfono, y el formulario abre el email del visitante.

Pendiente de revisar:
- **Datos fiscales** en `privacidad.html` y `aviso-legal.html` (busca `[COMPLETAR]`).
- Textos de ejemplo de las demos (horarios y precios de cada sector) en `scripts/main.js` → `SECTORS`.
- Lo que sabe el asistente: `api/prompt.php`.

## Asistente con IA

Burbuja de chat en todas las vistas. El navegador habla con `api/chat.php`, que llama a un modelo de IA en [Groq](https://console.groq.com) (API compatible con OpenAI). La clave de API nunca llega al navegador.

- Necesita PHP 8.1 o superior con la extensión cURL (la tienen los planes de Hostinger con PHP). No hay dependencias que instalar.
- El modelo se cambia en `api/config.php`. Para ver qué modelos ofrece Groq y si la clave funciona, abre `api/chat.php?diagnostico`.
- Si el servidor del asistente no responde (por ejemplo, en local sin PHP), la burbuja da respuestas preparadas para no dejar al visitante sin respuesta.
- El robot animado del botón es una animación Lottie (`assets/chatbot.json`) que reproduce `scripts/vendor/lottie_light.min.js` (lottie-web, licencia MIT). Para cambiarla, sustituye el JSON. Si no carga, el botón muestra un icono de chat.

## Subir a Hostinger

1. Sube el contenido de `Aether/` a `public_html/`, incluidos `scripts/config.js` y `api/config.php`.
2. Pon la clave de API en `api/config.php`.
3. Comprueba que `https://tudominio/api/config.php` devuelve un error 403 (lo protege `api/.htaccess`).

## Estructura

```
Aether/
├── index.html            # Todas las vistas
├── privacidad.html, aviso-legal.html, cookies.html
├── favicon.svg
├── scripts/config.js     # Configuración privada (gitignored; plantilla: config.example.js)
├── api/chat.php          # Asistente con IA (PHP + Groq)
├── api/prompt.php        # Instrucciones y conocimiento del asistente
├── scripts/main.js       # Router de vistas, demos, formulario
├── scripts/vendor/       # lottie-web (reproductor de la animación del asistente)
├── assets/chatbot.json   # Animación del robot del asistente
└── styles/               # reset, variables (colores), main
```
