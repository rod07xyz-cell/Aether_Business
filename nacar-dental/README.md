# Nácar Clínica Dental (web de ejemplo)

Landing de una clínica dental ficticia en Madrid. HTML, CSS y JavaScript sin dependencias ni paso de build.

## Abrir en local

```bash
cd nacar-dental
python3 -m http.server 8765
# http://localhost:8765
```

Abrir `index.html` con doble clic también funciona, pero las fuentes locales se bloquean por CORS en `file://`.

## Qué incluye

- Hero con reveal de imagen y hueco libre real calculado desde la agenda
- Bento de tratamientos, sección "sin miedo" con raíl de progreso, comparador antes/después
- Carrusel de equipo, opiniones con selector, precios con pestañas
- Reserva con días, horas, validación, estado de carga, confirmación y descarga `.ics`
- FAQ con apertura suave, modo claro/oscuro, barra de cita en móvil, `prefers-reduced-motion`

## Imágenes

Las fotos se cargan desde Unsplash. Si alguna no carga, se muestra un respaldo diseñado (degradado + icono o iniciales). Para una clínica real, sustituir por fotos propias del equipo y del gabinete.

Todos los datos (nombres, precios, reseñas, dirección, colegiados) son de ejemplo.

Fuentes: Bricolage Grotesque y Geist (OFL). Iconos: Phosphor (MIT). Alojados en `assets/`.
