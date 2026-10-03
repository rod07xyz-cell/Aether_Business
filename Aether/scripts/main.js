/* ═══════════════════════════════════════════
   Aether — navegación por vistas + demos
═══════════════════════════════════════════ */
(function () {
  'use strict';

  var CONFIG = Object.assign({
    email: 'aetherlabs@aetherlabsai.tech',
    calLink: 'https://cal.eu/aetherlabs/30min',
    assistantEndpoint: 'api/chat.php'
  }, window.AETHER_CONFIG || {});
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ══════════ Datos por sector ══════════ */
  var SECTORS = {
    fisio: {
      business: 'Fisio Movimiento',
      services: [
        { name: 'Primera valoración', dur: 60, price: '50 €' },
        { name: 'Sesión de fisioterapia', dur: 45, price: '40 €' },
        { name: 'Masaje deportivo', dur: 30, price: '30 €' },
        { name: 'Pilates terapéutico', dur: 50, price: '15 €' }
      ],
      slotStep: 45,
      answers: {
        horario: 'Abrimos de lunes a viernes de 9:00 a 14:00 y de 16:00 a 20:30, y los sábados de 10:00 a 13:00.',
        precio: 'La primera valoración cuesta 50 € (60 min) y las sesiones siguientes 40 €. El bono de 5 sesiones sale a 180 €.',
        seguro: 'Sí, trabajamos con Sanitas, Adeslas y DKV. Trae tu tarjeta el día de la cita 😊',
        ubicacion: 'Estamos en Calle Mayor 12, bajo. Hay un parking público a 50 m.'
      },
      quick: ['¿Qué horario tenéis?', '¿Cuánto cuesta la primera sesión?', '¿Trabajáis con mi seguro?', 'Quiero pedir cita']
    },
    dental: {
      business: 'Clínica Dental Sonrisa',
      services: [
        { name: 'Primera visita', dur: 30, price: 'Gratis' },
        { name: 'Revisión y limpieza', dur: 45, price: '45 €' },
        { name: 'Blanqueamiento', dur: 60, price: '190 €' },
        { name: 'Urgencia dental', dur: 30, price: '35 €' }
      ],
      slotStep: 30,
      answers: {
        horario: 'Estamos de lunes a viernes de 9:30 a 14:00 y de 16:00 a 20:00. Para urgencias, escríbenos y te buscamos hueco ese mismo día.',
        precio: 'La primera visita es gratuita e incluye revisión y presupuesto. Una limpieza cuesta 45 €. Financiamos tratamientos sin intereses.',
        seguro: 'Trabajamos con Sanitas Dental, Adeslas y Mapfre. Si tienes otro seguro, dinos cuál y lo comprobamos.',
        ubicacion: 'Estamos en Avenida de la Constitución 45, 1º. Al lado de la parada de metro.'
      },
      quick: ['¿Qué horario tenéis?', '¿Cuánto cuesta una limpieza?', '¿Trabajáis con mi seguro?', 'Quiero pedir cita']
    },
    gym: {
      business: 'Fuerza Club',
      services: [
        { name: 'Clase de prueba', dur: 60, price: 'Gratis' },
        { name: 'Entrenamiento personal', dur: 60, price: '35 €' },
        { name: 'Valoración física', dur: 45, price: '25 €' },
        { name: 'Clase de spinning', dur: 45, price: 'Incluida' }
      ],
      slotStep: 60,
      answers: {
        horario: 'Abrimos de lunes a viernes de 7:00 a 22:00, sábados de 9:00 a 14:00 y domingos de 9:00 a 13:00.',
        precio: 'La cuota es de 39 €/mes sin matrícula, con todas las clases incluidas. La primera clase es gratis.',
        seguro: 'Puedes darte de baja cuando quieras avisando antes del día 25. Sin permanencia.',
        ubicacion: 'Estamos en Calle del Deporte 8, con parking gratuito para socios.'
      },
      quick: ['¿Qué horario tenéis?', '¿Cuánto cuesta la cuota?', '¿Hay permanencia?', 'Quiero una clase de prueba']
    },
    otros: {
      business: 'Tu Negocio',
      services: [
        { name: 'Primera consulta', dur: 30, price: 'Gratis' },
        { name: 'Cita estándar', dur: 45, price: '40 €' },
        { name: 'Cita larga', dur: 60, price: '55 €' }
      ],
      slotStep: 45,
      answers: {
        horario: 'Atendemos de lunes a viernes de 9:00 a 14:00 y de 16:00 a 20:00.',
        precio: 'La primera consulta es gratuita. Después, una cita estándar cuesta 40 €.',
        seguro: 'Puedes pagar con tarjeta, Bizum o efectivo.',
        ubicacion: 'Estamos en Calle Principal 1. Te mandamos la ubicación por aquí si la necesitas.'
      },
      quick: ['¿Qué horario tenéis?', '¿Cuánto cuesta?', '¿Cómo puedo pagar?', 'Quiero pedir cita']
    }
  };
  var sector = SECTORS[store('aether_sector')] ? store('aether_sector') : 'fisio';
  var sectorListeners = [];

  function setSector(key) {
    if (!SECTORS[key]) return;
    sector = key;
    store('aether_sector', key);
    sectorListeners.forEach(function (fn) { fn(key); });
  }
  function onSector(fn) { sectorListeners.push(fn); fn(sector); }

  /* ══════════ Router de vistas ══════════ */
  var views = $$('[data-view]');
  // Las vistas usan id="view-xxx" y el hash es #xxx: así el navegador no salta al ancla
  var viewIds = views.map(function (v) { return v.id.replace(/^view-/, ''); });
  var current = null;
  var calLoaded = false;

  function showView(id, focus) {
    if (viewIds.indexOf(id) === -1) id = 'inicio';
    if (id === current) { window.scrollTo(0, 0); return; }
    views.forEach(function (v) {
      var active = v.id === 'view-' + id;
      v.hidden = !active;
      v.classList.toggle('is-entering', active && current !== null && !reduceMotion);
    });
    current = id;
    window.scrollTo(0, 0);

    $$('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $$('[data-nav-group]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-nav-group').split(' ').indexOf(id) !== -1);
    });

    var view = document.getElementById('view-' + id);
    if (view.dataset.title) document.title = view.dataset.title;
    if (focus) {
      var heading = $('h1, h2', view);
      if (heading) heading.focus({ preventScroll: true });
    }
    if (id === 'contacto') loadCal();
    closeMenu();
  }

  function route(focus) {
    var id = decodeURIComponent(location.hash.slice(1));
    if (id && viewIds.indexOf(id) === -1) return; // ancla interna (p. ej. #main)
    showView(id || 'inicio', focus);
  }

  window.addEventListener('hashchange', function () { route(true); });

  // Mismo enlace que la vista actual → volver arriba
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    closeMenu();
    if (id === current) { e.preventDefault(); window.scrollTo(0, 0); }
  });

  /* ══════════ Menú móvil ══════════ */
  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');
  var dropBtns = $$('.nav-drop-btn');
  function closeDrop(except) {
    dropBtns.forEach(function (b) { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  }
  dropBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeDrop(btn);
      btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-drop')) closeDrop();
  });

  function closeMenu() {
    closeDrop();
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    navMenu.classList.remove('is-open');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      navMenu.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ══════════ Configuración (WhatsApp, teléfono, email, Cal) ══════════ */
  function applyConfig() {
    var waUrl = CONFIG.whatsapp
      ? 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Hola, he visto vuestra web y me gustaría saber más.')
      : '';
    $$('[data-wa-link]').forEach(function (a) {
      if (waUrl) { a.href = waUrl; a.hidden = false; } else { a.hidden = true; }
    });
    $$('[data-phone-link]').forEach(function (a) {
      if (CONFIG.phone) {
        a.href = 'tel:' + CONFIG.phone.replace(/\s+/g, '');
        if (a.hasAttribute('data-phone-text')) a.textContent = CONFIG.phone;
        a.hidden = false;
        if (a.parentElement.tagName === 'LI') a.parentElement.hidden = false;
      } else {
        a.hidden = true;
        if (a.parentElement.tagName === 'LI') a.parentElement.hidden = true;
      }
    });
    if (CONFIG.email) {
      $$('[data-email-link]').forEach(function (a) {
        a.href = 'mailto:' + CONFIG.email;
        if (a.hasAttribute('data-email-text')) a.textContent = CONFIG.email;
      });
    }
    if (CONFIG.calLink) $$('[data-cal-link]').forEach(function (a) { a.href = CONFIG.calLink; });
    document.body.classList.toggle('has-wa', !!waUrl);
  }

  // Calendario de Cal.eu con su script oficial de embed (modo inline).
  // Si no llega a cargar (bloqueo, sin conexión…), se muestra un botón para abrirlo aparte.
  function loadCal() {
    if (calLoaded || !CONFIG.calLink) return;
    calLoaded = true;
    var embed = $('#calEmbed');
    if (!embed) return;
    var url;
    try { url = new URL(CONFIG.calLink); } catch (e) { return calFallback(); }
    var path = url.pathname.replace(/^\/+|\/+$/g, '');
    var ns = 'aether';
    var ready = false;
    var timer = setTimeout(function () { if (!ready) calFallback(); }, 10000);

    // Stub oficial de Cal: encola llamadas hasta que carga embed.js
    if (!window.Cal) {
      var Cal = window.Cal = function () {
        var args = arguments;
        if (args[0] === 'init' && typeof args[1] === 'string') {
          var api = function () { api.q.push(arguments); };
          api.q = [];
          Cal.ns[args[1]] = Cal.ns[args[1]] || api;
          Cal.ns[args[1]].q.push(args);
          Cal.q.push(['initNamespace', args[1]]);
          return;
        }
        Cal.q.push(args);
      };
      Cal.ns = {}; Cal.q = []; Cal.loaded = true;
      var script = document.createElement('script');
      script.src = 'https://app.' + url.hostname.replace(/^app\./, '') + '/embed/embed.js';
      script.async = true;
      script.onerror = function () { clearTimeout(timer); calFallback(); };
      document.head.appendChild(script);
    }

    window.Cal('init', ns, { origin: url.origin });
    var cal = window.Cal.ns[ns];
    cal('inline', {
      elementOrSelector: '#calEmbed',
      calLink: path,
      config: { layout: 'month_view', theme: 'dark' }
    });
    cal('ui', {
      theme: 'dark',
      hideEventTypeDetails: false,
      cssVarsPerTheme: { dark: { 'cal-brand': '#6EA8FF' } }
    });
    cal('on', {
      action: 'linkReady',
      callback: function () {
        ready = true;
        clearTimeout(timer);
        var l = $('#calLoading'); if (l) l.hidden = true;
      }
    });
    cal('on', { action: 'linkFailed', callback: function () { clearTimeout(timer); calFallback(); } });
  }

  function calFallback() {
    var embed = $('#calEmbed'), loading = $('#calLoading'), off = $('#calOff');
    if (embed) embed.hidden = true;
    if (loading) loading.hidden = true;
    if (off) off.hidden = false;
  }

  /* ══════════ Soluciones: pestañas ══════════ */
  function initTabs() {
    var tabs = $$('[data-sector-tab]');
    if (!tabs.length) return;
    onSector(function (key) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-sector-tab') === key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      $$('[data-sector-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-sector-panel') !== key;
      });
    });
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { setSector(t.getAttribute('data-sector-tab')); });
      t.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        setSector(next.getAttribute('data-sector-tab'));
      });
    });
    $$('[data-set-sector]').forEach(function (a) {
      a.addEventListener('click', function () { setSector(a.getAttribute('data-set-sector')); });
    });
  }

  /* ══════════ Demo: reserva de cita ══════════ */
  var DAY_NAMES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DAY_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function nextDays(n) {
    var out = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    while (out.length < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));
    }
    return out;
  }

  // Huecos "ocupados" pseudoaleatorios pero estables para cada día
  function slotsFor(date, step) {
    var ranges = date.getDay() === 6 ? [[10 * 60, 13 * 60]] : [[9 * 60, 14 * 60], [16 * 60, 20 * 60]];
    var seed = date.getDate() * 31 + date.getMonth() * 7;
    var out = [];
    ranges.forEach(function (r) {
      for (var m = r[0]; m + step <= r[1]; m += step) {
        seed = (seed * 9301 + 49297) % 233280;
        var label = Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
        out.push({ label: label, free: seed / 233280 > 0.4 });
      }
    });
    return out;
  }

  function initBooking() {
    var root = $('#booking');
    if (!root) return;
    var state = { step: 1, service: null, day: null, time: null };
    var sectorSel = $('#bkSector');

    function goStep(n) {
      state.step = n;
      $$('.bk-step', root).forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== n; });
      $$('[data-step-dot]', root).forEach(function (d) {
        var k = Number(d.getAttribute('data-step-dot'));
        d.classList.toggle('is-active', k === n);
        d.classList.toggle('is-done', k < n);
        if (k === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      $$('#behindList li').forEach(function (li) {
        li.classList.toggle('is-done', n === 4);
      });
      var q = $('.bk-step[data-step="' + n + '"] .bk-q', root);
      if (q && state.touched) { q.tabIndex = -1; q.focus({ preventScroll: true }); }
    }

    function renderServices() {
      var box = $('#bkServices');
      box.innerHTML = '';
      SECTORS[sector].services.forEach(function (s) {
        var b = el('button', 'bk-service');
        b.type = 'button';
        b.appendChild(el('span', 'bk-service-name', s.name));
        b.appendChild(el('span', 'bk-service-meta', s.dur + ' min · ' + s.price));
        b.addEventListener('click', function () {
          state.service = s; state.time = null; state.touched = true;
          renderDays();
          goStep(2);
        });
        box.appendChild(b);
      });
    }

    function renderDays() {
      var box = $('#bkDays');
      box.innerHTML = '';
      var days = nextDays(6);
      if (!state.day) state.day = days[0];
      days.forEach(function (d) {
        var b = el('button', 'bk-day');
        b.type = 'button';
        b.setAttribute('aria-pressed', String(d.getTime() === state.day.getTime()));
        b.appendChild(el('span', 'bk-day-name', DAY_NAMES[d.getDay()]));
        b.appendChild(el('span', 'bk-day-num', String(d.getDate())));
        b.setAttribute('aria-label', DAY_LONG[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]);
        b.addEventListener('click', function () { state.day = d; renderDays(); });
        box.appendChild(b);
      });
      renderSlots();
    }

    function renderSlots() {
      var box = $('#bkSlots');
      box.innerHTML = '';
      slotsFor(state.day, SECTORS[sector].slotStep).forEach(function (s) {
        var b = el('button', 'bk-slot', s.label);
        b.type = 'button';
        b.disabled = !s.free;
        if (!s.free) b.setAttribute('aria-label', s.label + ' (ocupado)');
        b.addEventListener('click', function () {
          state.time = s.label;
          $('#bkSummary').textContent = summary();
          goStep(3);
        });
        box.appendChild(b);
      });
    }

    function dateText() {
      var d = state.day;
      return DAY_LONG[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()];
    }
    function summary() {
      return state.service.name + ' · ' + dateText() + ' a las ' + state.time;
    }

    function fieldError(input, errEl, msg) {
      errEl.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) input.setAttribute('aria-describedby', errEl.id); else input.removeAttribute('aria-describedby');
      return !msg;
    }

    $('#bkForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#bkName'), phone = $('#bkPhone');
      var okName = fieldError(name, $('#bkNameErr'), name.value.trim().length < 2 ? 'Escribe tu nombre' : '');
      var digits = phone.value.replace(/\D/g, '');
      var okPhone = fieldError(phone, $('#bkPhoneErr'), digits.length < 9 ? 'Escribe un móvil válido' : '');
      if (!okName) { name.focus(); return; }
      if (!okPhone) { phone.focus(); return; }

      var first = name.value.trim().split(/\s+/)[0];
      var biz = SECTORS[sector].business;
      $('#bkDoneSummary').textContent = summary() + ' en ' + biz + '.';
      $('#bkWaMsg').textContent =
        'Hola ' + first + ' 👋 Te recordamos tu cita de ' + state.service.name.toLowerCase() +
        ' mañana, ' + dateText() + ', a las ' + state.time + ' en ' + biz + '.\n\n' +
        'Responde 1 para confirmar o 2 para cambiarla.';
      $$('.msg--out, .msg--reply', $('#bkWaPreview')).forEach(function (m) { m.remove(); });
      $('#bkWaActions').hidden = false;
      $('#bkWaPreview').hidden = !$('#bkReminder').checked;
      goStep(4);
    });

    $$('[data-wa-reply]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var chat = $('#bkWaPreview .wa-chat');
        var v = b.getAttribute('data-wa-reply');
        $('#bkWaActions').hidden = true;
        chat.appendChild(el('div', 'msg msg--out', v));
        chat.appendChild(el('div', 'msg msg--in msg--reply', v === '1'
          ? '¡Perfecto! Te esperamos. Si te surge algo, escríbenos por aquí.'
          : 'Sin problema. Te dejo los próximos huecos libres: ¿te va mejor por la mañana o por la tarde?'));
      });
    });

    $$('[data-bk-back]', root).forEach(function (b) {
      b.addEventListener('click', function () { goStep(state.step - 1); });
    });
    $('#bkRestart').addEventListener('click', function () {
      $('#bkForm').reset();
      state.service = null; state.day = null; state.time = null;
      goStep(1);
    });

    sectorSel.addEventListener('change', function () { setSector(sectorSel.value); });
    onSector(function (key) {
      sectorSel.value = key;
      $('#bkBusiness').textContent = SECTORS[key].business;
      $('#bkAvatar').textContent = SECTORS[key].business.charAt(0);
      renderServices();
      state.service = null; state.day = null; state.time = null;
      goStep(1);
    });
  }

  /* ══════════ Demo: asistente WhatsApp ══════════ */
  function initChat() {
    var chat = $('#waChat');
    if (!chat) return;
    var quick = $('#waQuick');
    var sectorSel = $('#waSector');
    var busy = false;

    function time() {
      var d = new Date();
      return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    function add(type, text, extra) {
      var m = el('div', 'msg msg--' + type, text);
      m.appendChild(el('span', 'msg-time', time()));
      if (extra) m.insertBefore(extra, m.lastChild);
      chat.appendChild(m);
      chat.scrollTop = chat.scrollHeight;
    }

    function answer(q) {
      var a = SECTORS[sector].answers;
      var t = q.toLowerCase();
      if (/cita|reserv|prueba|hueco|apunt/.test(t)) {
        var link = el('a', 'msg-link', 'Abrir reserva →');
        link.href = '#demo-citas';
        return { text: '¡Claro! Puedes elegir día y hora aquí y te llega la confirmación al momento:', extra: link };
      }
      if (/horari|hora|abr|cierr|cuándo|cuando/.test(t)) return { text: a.horario };
      if (/cuest|precio|cuánto|cuanto|cuota|tarifa|vale/.test(t)) return { text: a.precio };
      if (/segur|mutua|sanitas|adeslas|dkv|permanen|baja|pag|bizum|tarjeta/.test(t)) return { text: a.seguro };
      if (/dónde|donde|direcc|ubica|parking|llegar/.test(t)) return { text: a.ubicacion };
      if (/hola|buen|hey/.test(t)) return { text: '¡Hola! ¿En qué te puedo ayudar? Puedo darte horarios, precios o reservarte cita.' };
      return { text: 'Buena pregunta. Se la paso al equipo y te contestan por aquí en cuanto estén libres. ¿Quieres que te reserve cita mientras tanto?' };
    }

    function ask(q) {
      if (busy || !q.trim()) return;
      busy = true;
      add('out', q);
      var typing = el('div', 'msg msg--in msg--typing');
      typing.innerHTML = '<span></span><span></span><span></span>';
      typing.setAttribute('aria-label', 'escribiendo');
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;
      setTimeout(function () {
        typing.remove();
        var r = answer(q);
        add('in', r.text, r.extra);
        busy = false;
      }, reduceMotion ? 0 : 650);
    }

    function reset(key) {
      var s = SECTORS[key];
      chat.innerHTML = '';
      $('#waBusiness').textContent = s.business;
      $('#waAvatar').textContent = s.business.charAt(0);
      add('in', '¡Hola! 👋 Soy el asistente de ' + s.business + '. Pregúntame lo que necesites o pide cita.');
      quick.innerHTML = '';
      s.quick.forEach(function (q) {
        var b = el('button', 'quick', q);
        b.type = 'button';
        b.addEventListener('click', function () { ask(q); });
        quick.appendChild(b);
      });
    }

    $('#waForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#waInput');
      ask(input.value);
      input.value = '';
    });
    sectorSel.addEventListener('change', function () { setSector(sectorSel.value); });
    onSector(function (key) { sectorSel.value = key; reset(key); });
  }

  /* ══════════ Calculadora de huecos vacíos ══════════ */
  // Cifras de ejemplo por sector (se muestran como ejemplo; el visitante pone las suyas)
  var CALC_PRESETS = {
    fisio:  { calcAppts: 60, calcNoShow: 8,  calcPrice: 40, calcPhone: 60, calcRecover: 3 },
    dental: { calcAppts: 50, calcNoShow: 7,  calcPrice: 60, calcPhone: 75, calcRecover: 3 },
    gym:    { calcAppts: 40, calcNoShow: 10, calcPrice: 30, calcPhone: 45, calcRecover: 3 },
    otros:  { calcAppts: 40, calcNoShow: 8,  calcPrice: 40, calcPhone: 45, calcRecover: 3 }
  };
  var CONTACT_SECTOR = { fisio: 'Fisioterapia', dental: 'Clínica dental', gym: 'Gimnasio / Centro deportivo' };
  var PROJECT_PRICE = 1000;   // "desde 1.000 €" (vista Precios)
  var WEEKS_PER_MONTH = 4.33;
  var WORKDAYS_PER_MONTH = 22;

  // 12480 → "12.480" (Intl en es-ES no separa los miles de 4 cifras)
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  function initCalc() {
    var form = $('#calcForm');
    if (!form) return;
    var inputs = $$('input[type="range"]', form);
    var v = {};

    function update() {
      inputs.forEach(function (i) {
        v[i.id] = Number(i.value);
        var out = $('#' + i.id + 'Out');
        out.textContent = num(i.value) + out.getAttribute('data-unit');
        i.style.setProperty('--fill', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
      });
      var lostAppts = v.calcAppts * v.calcNoShow / 100 * WEEKS_PER_MONTH;
      var loss = lostAppts * v.calcPrice;
      var hours = v.calcPhone * WORKDAYS_PER_MONTH / 60;
      var rec = loss * v.calcRecover / 10;

      $('#calcLoss').textContent = num(loss) + ' €';
      $('#calcLossSub').textContent = '≈ ' + num(lostAppts) + ' citas al mes · ' + num(loss * 12) + ' € al año';
      $('#calcHours').textContent = num(hours) + ' h';
      $('#calcRecLabel').textContent = 'Si recuperas ' + v.calcRecover + ' de cada 10 huecos';
      $('#calcRec').textContent = '+' + num(rec) + ' €/mes';

      var pay = $('#calcPayback');
      var months = rec > 0 ? Math.ceil(PROJECT_PRICE / rec) : Infinity;
      pay.classList.toggle('is-warn', months > 24);
      if (months === Infinity) {
        pay.textContent = 'Sin huecos recuperados, los recordatorios no se pagan solos. Puede que te compense más automatizar otra cosa: lo vemos en la llamada.';
      } else if (months > 24) {
        pay.textContent = 'Con estos números, un proyecto de 1.000 € tardaría más de 2 años en pagarse solo con huecos recuperados. Puede que te compense empezar por otra cosa.';
      } else {
        pay.textContent = 'Con estos números, un proyecto de 1.000 € se pagaría en ' +
          (months <= 1 ? 'menos de un mes' : 'unos ' + months + ' meses') + ' solo con los huecos recuperados.';
      }
    }

    function applyPreset(key) {
      var p = CALC_PRESETS[key];
      if (!p) return;
      Object.keys(p).forEach(function (id) { $('#' + id).value = p[id]; });
      $$('[data-calc-preset]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-calc-preset') === key));
      });
      update();
    }

    form.addEventListener('input', function () {
      // Al tocar un control dejan de ser las cifras de ejemplo
      $$('[data-calc-preset]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      update();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-calc-preset]').forEach(function (b) {
      b.addEventListener('click', function () { setSector(b.getAttribute('data-calc-preset')); });
    });
    onSector(applyPreset);

    // Lleva las cuentas al formulario de contacto, si el visitante no ha escrito nada
    $('#calcCta').addEventListener('click', function () {
      var msg = $('#cMsg'), sel = $('#cSector');
      if (msg && !msg.value.trim()) {
        msg.value = 'Calculadora: ' + v.calcAppts + ' citas a la semana, ' + v.calcNoShow + ' % fallan, ' +
          v.calcPrice + ' € por cita → unos ' + $('#calcLoss').textContent + ' al mes en huecos vacíos.';
      }
      if (sel && !sel.value && CONTACT_SECTOR[sector]) sel.value = CONTACT_SECTOR[sector];
    });
  }

  /* ══════════ Formulario de contacto ══════════ */
  function initContact() {
    var form = $('#contactForm');
    if (!form) return;
    var status = $('#cStatus');
    var btn = $('#cSubmit');

    function setErr(input, msg) {
      var err = input.type === 'checkbox' ? $('#cPrivacyErr') : input.parentElement.querySelector('.field-error');
      if (!err.id) err.id = input.id + 'Err';
      err.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      return !msg;
    }

    function validate() {
      var firstBad = null;
      [
        ['#cName', function (v) { return v.length >= 2 ? '' : 'Escribe tu nombre'; }],
        ['#cBusiness', function (v) { return v ? '' : 'Escribe el nombre de tu negocio'; }],
        ['#cSector', function (v) { return v ? '' : 'Elige un sector'; }],
        ['#cContact', function (v) {
          var email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          var phone = v.replace(/\D/g, '').length >= 9;
          return email || phone ? '' : 'Escribe un email o teléfono válido';
        }]
      ].forEach(function (rule) {
        var input = $(rule[0]);
        if (!setErr(input, rule[1](input.value.trim())) && !firstBad) firstBad = input;
      });
      var privacy = $('#cPrivacy');
      if (!setErr(privacy, privacy.checked ? '' : 'Necesitamos tu consentimiento para responderte') && !firstBad) firstBad = privacy;
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    function mailtoFallback(data) {
      var body = 'Nombre: ' + data.nombre + '\nNegocio: ' + data.negocio + '\nSector: ' + data.sector +
        '\nContacto: ' + data.contacto + '\n\n' + (data.mensaje || '');
      location.href = 'mailto:' + (CONFIG.email || '') + '?subject=' +
        encodeURIComponent('Consulta web — ' + data.negocio) + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';
      if (!validate()) return;
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._gotcha) return;

      if (!CONFIG.formspreeId) {
        mailtoFallback(data);
        status.textContent = 'Se ha abierto tu email con el mensaje preparado. Si no se abre, escríbenos a ' + CONFIG.email + '.';
        status.classList.add('is-ok');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Enviando…';
      fetch('https://formspree.io/f/' + CONFIG.formspreeId, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        status.textContent = '¡Recibido! Te respondemos en menos de 24 horas.';
        status.classList.add('is-ok');
      }).catch(function () {
        status.innerHTML = '';
        status.appendChild(document.createTextNode('No se pudo enviar. Escríbenos a '));
        var a = el('a', null, CONFIG.email);
        a.href = 'mailto:' + CONFIG.email;
        status.appendChild(a);
        status.classList.add('is-error');
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Enviar';
      });
    });
  }

  /* ══════════ Asistente de la web (IA) ══════════ */
  var SAFE_LINK = /^(#[a-z-]+|https:\/\/cal\.eu\/|https:\/\/wa\.me\/|mailto:)/;

  // Texto con enlaces Markdown [texto](url) → nodos DOM seguros
  function richText(container, text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    var re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    var last = 0, m;
    while ((m = re.exec(text))) {
      container.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (SAFE_LINK.test(m[2])) {
        var a = el('a', 'msg-link', m[1]);
        a.href = m[2];
        if (m[2].charAt(0) !== '#') { a.target = '_blank'; a.rel = 'noopener'; }
        container.appendChild(a);
      } else {
        container.appendChild(document.createTextNode(m[1]));
      }
      last = re.lastIndex;
    }
    container.appendChild(document.createTextNode(text.slice(last)));
  }

  // Respuestas preparadas si el servidor del asistente no está disponible
  function localAnswer(q) {
    var t = q.toLowerCase();
    if (/datos|rgpd|seguridad|privacidad|protecci/.test(t))
      return 'Firmamos contrato de encargado del tratamiento, los recordatorios no llevan datos clínicos y los datos son tuyos. Lo tienes explicado en [Seguridad y datos](#seguridad).';
    if (/calcul|compensa|amortiz|pierd|ausenc/.test(t))
      return 'Puedes hacer la cuenta con los números de tu agenda en la [calculadora de huecos vacíos](#calculadora).';
    if (/quién|quien|equipo|empresa|fundador/.test(t))
      return 'Aether es un estudio pequeño: hablas con quien construye tu sistema desde la primera llamada. Más en [Quiénes somos](#nosotros).';
    if (/cuest|precio|cuánto|cuanto|tarifa|pagar|cuota|presupuesto/.test(t))
      return 'Cada solución se hace a medida. Una automatización completa cuesta desde 1.000 €, en un único pago, y el mantenimiento es opcional. Tienes el detalle en [Precios](#planes).';
    if (/cómo|como|trabaj|proceso|pasos|empez/.test(t))
      return 'Empezamos con una llamada gratuita de 30 minutos, construimos la solución a medida conectada a lo que ya usas y te la entregamos funcionando. Puedes [reservar la llamada aquí](#contacto).';
    if (/automati|qué hac|que hac|servici|negocio|clínica|clinica|dent|gimnas|fisio/.test(t))
      return 'Citas online, recordatorios por WhatsApp, un asistente 24h que responde y reserva, reseñas en Google y seguimiento de clientes, entre otras cosas. Mira lo que hacemos en tu sector en [Soluciones](#soluciones) o prueba la [demo de reservas](#demo-citas).';
    if (/contact|llam|hablar|whatsapp|email|correo/.test(t))
      return 'Puedes reservar una llamada gratuita, escribirnos o hablarnos por WhatsApp desde [Contacto](#contacto).';
    return 'Ahora mismo no puedo responder a eso con detalle. Escríbenos o [reserva una llamada](#contacto) y te contestamos en menos de 24 horas.';
  }

  // Robot animado (Lottie). Se carga cuando la página ya se ha pintado; si algo falla, se queda el icono.
  var BOT_PLAYER = 'scripts/vendor/lottie_light.min.js?v=5.13.0';
  var BOT_DATA = 'assets/chatbot.json?v=1';
  var BOT_STILL_FRAME = 45; // con las burbujas a la vista (para quien prefiere menos movimiento)

  function loadBotAnimations(onReady) {
    var hosts = $$('[data-bot-anim]');
    if (!hosts.length) return;
    var player = window.lottie ? Promise.resolve() : new Promise(function (resolve, reject) {
      var sc = document.createElement('script');
      sc.src = BOT_PLAYER;
      sc.onload = resolve;
      sc.onerror = reject;
      document.head.appendChild(sc);
    });
    player.then(function () {
      return fetch(BOT_DATA).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
    }).then(function (data) {
      var anims = {};
      hosts.forEach(function (host) {
        host.innerHTML = '';
        var anim = window.lottie.loadAnimation({
          container: host,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          animationData: JSON.parse(JSON.stringify(data)), // Lottie modifica los datos: una copia por animación
          rendererSettings: { viewBoxSize: host.getAttribute('data-bot-anim') }
        });
        anim.goToAndStop(BOT_STILL_FRAME, true);
        host.classList.add('is-ready');
        anims[host.closest('.assist-panel') ? 'head' : 'fab'] = anim;
      });
      onReady(anims);
    }).catch(function (err) {
      if (window.console) console.warn('Animación del asistente no disponible →', err.message);
    });
  }

  function initAssistant() {
    var panel = $('#assistPanel');
    if (!panel) return;
    var openBtn = $('#assistOpen'), log = $('#assistLog'), form = $('#assistForm'), input = $('#assistInput');
    var history = [];
    var busy = false;
    var greeted = false;
    var bots = {};

    // Solo se mueve el robot que se ve: el del botón con el panel cerrado, el de la cabecera con él abierto
    function syncBots() {
      if (reduceMotion) return;
      var isOpen = !panel.hidden;
      if (bots.fab) { if (isOpen) bots.fab.pause(); else bots.fab.play(); }
      if (bots.head) { if (isOpen) bots.head.play(); else bots.head.pause(); }
    }
    function startBots() {
      loadBotAnimations(function (anims) { bots = anims; syncBots(); });
    }
    if (document.readyState === 'complete') setTimeout(startBots, 300);
    else window.addEventListener('load', function () { setTimeout(startBots, 300); });

    function add(role, text) {
      var m = el('div', 'msg ' + (role === 'user' ? 'msg--out' : 'msg--in'));
      richText(m, text);
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
    }

    function open(state) {
      panel.hidden = !state;
      openBtn.setAttribute('aria-expanded', String(state));
      document.body.classList.toggle('assist-open', state);
      syncBots();
      if (state) {
        if (!greeted) {
          greeted = true;
          add('assistant', '¡Hola! Soy el asistente de Aether. Pregúntame qué podemos automatizar en tu negocio, cuánto cuesta o cómo trabajamos.');
        }
        input.focus();
      } else {
        openBtn.focus();
      }
    }

    function ask(q) {
      q = q.trim();
      if (!q || busy) return;
      busy = true;
      $('#assistChips').hidden = true;
      add('user', q);
      history.push({ role: 'user', content: q });
      var typing = el('div', 'msg msg--in msg--typing');
      typing.innerHTML = '<span></span><span></span><span></span>';
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;

      fetch(CONFIG.assistantEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-12) })
      }).then(function (res) {
        return res.json().then(function (data) {
          if (res.status === 429) return 'Has hecho muchas preguntas seguidas. Si quieres, [reserva una llamada](#contacto) y lo vemos juntos.';
          if (!res.ok || !data.reply) throw new Error(data.error || 'HTTP ' + res.status);
          return data.reply;
        });
      }).catch(function (err) {
        if (window.console) console.warn('Asistente: respuesta preparada porque falló el servidor →', err.message);
        return localAnswer(q);
      }).then(function (reply) {
        typing.remove();
        add('assistant', reply);
        history.push({ role: 'assistant', content: reply });
        busy = false;
      });
    }

    openBtn.addEventListener('click', function () { open(panel.hidden); });
    $('#assistClose').addEventListener('click', function () { open(false); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input.value);
      input.value = '';
    });
    $$('#assistChips .quick').forEach(function (b) {
      b.addEventListener('click', function () { ask(b.textContent); });
    });
    // En móvil el panel ocupa la pantalla: se cierra al ir a otra vista
    log.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]') && window.matchMedia('(max-width: 640px)').matches) open(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) open(false);
    });
  }

  /* ══════════ Cookies + año ══════════ */
  function initMisc() {
    var banner = $('#cookieBanner');
    if (banner && !store('aether_cookies')) {
      banner.hidden = false;
      $('#cookieOk').addEventListener('click', function () {
        store('aether_cookies', 'ok');
        banner.hidden = true;
      });
    }
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ══════════ Arranque ══════════ */
  applyConfig();
  initTabs();
  initBooking();
  initChat();
  initCalc();
  initContact();
  initAssistant();
  initMisc();
  route(false);
})();
