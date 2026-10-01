/* ═══════════════════════════════════════════
   PLANTILLA DE CONFIGURACIÓN
   Copia este archivo como config.js y rellénalo. config.js no se sube a GitHub.
   Los campos vacíos ('') ocultan el botón correspondiente.
═══════════════════════════════════════════ */
window.AETHER_CONFIG = {
  // ID de Formspree: crea un formulario gratis en https://formspree.io
  // y copia lo que va después de /f/ (ej. 'xyzabcde').
  // Si está vacío, el formulario abre el email del visitante como alternativa.
  formspreeId: '',

  // WhatsApp en formato internacional, sin + ni espacios (ej. '34612345678').
  whatsapp: '',

  // Teléfono visible (ej. '+34 612 345 678').
  phone: '',

  email: 'aetherlabs@aetherlabsai.tech',

  // Enlace de reserva de Cal.eu (se muestra embebido en Contacto).
  calLink: 'https://cal.eu/aetherlabs/30min',

  // Dirección del asistente con IA (archivo PHP en el hosting).
  assistantEndpoint: 'api/chat.php'
};
