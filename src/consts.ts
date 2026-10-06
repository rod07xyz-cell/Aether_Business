export const SITE = {
  name: 'xfan',
  tagline: 'Guía independiente de aerotermia y bombas de calor',
  description:
    'Precios reales, consumo, ayudas, comparativas de marcas y solución de averías de aerotermia. Información independiente para decidir antes de instalar.',
  url: 'https://xfan.xyz',
  owner: 'Rodrigo Ordóñez',
  email: 'ordrod36@gmail.com',
  lang: 'es',
};

// Pega aquí tu ID de editor de AdSense cuando te aprueben (ej. 'ca-pub-1234567890123456').
// Mientras esté vacío no se carga ningún script de anuncios.
export const ADSENSE_CLIENT = '';

export const CATEGORIES = [
  { slug: 'precios', name: 'Precios', description: 'Cuánto cuesta instalar aerotermia: presupuestos reales, qué incluyen y cómo financiarla.' },
  { slug: 'consumo', name: 'Consumo', description: 'Cuánto gasta la aerotermia, factura de luz y comparativas con gas, gasoil y pellets.' },
  { slug: 'como-funciona', name: 'Cómo funciona', description: 'Tecnología explicada fácil: COP, SCOP, monobloc, bibloc, ACS y dimensionado.' },
  { slug: 'marcas', name: 'Marcas', description: 'Comparativas y opiniones de Daikin, Mitsubishi, Panasonic, Vaillant y más.' },
  { slug: 'ayudas', name: 'Ayudas', description: 'Subvenciones, deducciones en el IRPF y bonificaciones municipales para aerotermia.' },
  { slug: 'averias-mantenimiento', name: 'Averías y mantenimiento', description: 'Problemas frecuentes, códigos de error, programación y mantenimiento.' },
  { slug: 'instalaciones', name: 'Instalaciones', description: 'Aerotermia con suelo radiante, radiadores, placas solares, pisos y casas antiguas.' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;
