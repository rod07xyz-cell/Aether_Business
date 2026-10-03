/* Nácar Clínica Dental: interacción. Sin dependencias. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Imágenes: respaldo diseñado si una foto no carga ---------- */
  const applyFallback = (img) => {
    const fig = img.closest('.media');
    if (fig) {
      if (fig.classList.contains('is-fallback')) return;
      fig.classList.add('is-fallback');
      if (img.dataset.fallbackInitials) {
        const s = document.createElement('span');
        s.className = 'fallback-initials';
        s.textContent = img.dataset.fallbackInitials;
        fig.append(s);
      } else {
        const i = document.createElement('i');
        i.className = `ph-light ph-${img.dataset.fallbackIcon || 'tooth'} fallback-icon`;
        i.setAttribute('aria-hidden', 'true');
        fig.append(i);
      }
      if (img.alt) fig.setAttribute('aria-label', img.alt), fig.setAttribute('role', 'img');
    } else if (img.dataset.fallbackInitials) {
      const s = document.createElement('span');
      s.className = 'avatar-fallback';
      s.textContent = img.dataset.fallbackInitials;
      img.replaceWith(s);
    }
  };
  $$('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) applyFallback(img);
    img.addEventListener('error', () => applyFallback(img), { once: true });
  });

  /* ---------- Hero: palabras escalonadas ---------- */
  const title = $('[data-split]');
  if (title) {
    let i = 0;
    const splitNode = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span');
            w.className = 'word';
            w.style.setProperty('--i', i++);
            w.textContent = part;
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          splitNode(child);
        }
      });
    };
    splitNode(title);
  }
  const start = () => requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]) : Promise.resolve()).then(start);

  /* ---------- Tema ---------- */
  const root = document.documentElement;
  const currentTheme = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $('.theme-toggle')?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('nacar-theme', next); } catch (e) {}
    const meta = $$('meta[name="theme-color"]');
    meta.forEach((m) => m.setAttribute('content', next === 'dark' ? '#0b1211' : '#f3f5f4'));
  });

  /* ---------- Menú móvil ---------- */
  const burger = $('.burger');
  const menu = $('#menu-movil');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      $('a', menu)?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduceMotion ? 0 : 350);
    }
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });

  /* ---------- Revelado al entrar ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('.bento .reveal').forEach((el, i) => el.style.setProperty('--d', `${(i % 3) * 0.08}s`));
  $$('.faq-list .reveal').forEach((el, i) => el.style.setProperty('--d', `${i * 0.05}s`));
  $$('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- Enlace activo en el nav ---------- */
  const navLinks = $$('.nav-links a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${en.target.id}`)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.hash); if (s) sectionIO.observe(s); });

  /* ---------- Barra móvil: aparece tras el hero, se oculta en el formulario ---------- */
  const bar = $('.mobile-bar');
  let heroVisible = true, bookingVisible = false;
  const syncBar = () => bar?.classList.toggle('is-visible', !heroVisible && !bookingVisible);
  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; syncBar(); }, { threshold: 0.05 }).observe($('.hero'));
  new IntersectionObserver(([en]) => { bookingVisible = en.isIntersecting; syncBar(); }, { rootMargin: '0px 0px -30% 0px' }).observe($('#cita'));

  /* ---------- Sin miedo: paso activo y raíl de progreso ---------- */
  const fearList = $('.fear-list');
  const fearItems = $$('.fear-item');
  if (fearList && fearItems.length) {
    const setActive = (idx) => {
      fearItems.forEach((it, i) => it.classList.toggle('is-active', i <= idx));
      fearList.style.setProperty('--progress', fearItems.length > 1 ? idx / (fearItems.length - 1) : 1);
    };
    setActive(0);
    const fearIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(fearItems.indexOf(en.target)); });
    }, { rootMargin: '-40% 0px -50% 0px' });
    fearItems.forEach((it) => fearIO.observe(it));
  }

  /* ---------- Comparador antes / después ---------- */
  const compare = $('.compare');
  if (compare) {
    const range = $('.compare-range', compare);
    const set = (v) => compare.style.setProperty('--pos', `${v}%`);
    range.addEventListener('input', () => set(range.value));
    range.addEventListener('pointerdown', () => compare.classList.add('is-dragging'));
    window.addEventListener('pointerup', () => compare.classList.remove('is-dragging'));
    /* Pequeña pista de movimiento la primera vez que se ve */
    if (!reduceMotion) {
      const hint = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        hint.disconnect();
        const frames = [50, 36, 64, 50];
        compare.animate(
          frames.map((p) => ({ '--pos': `${p}%` })),
          { duration: 1600, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', delay: 400 }
        );
      }, { threshold: 0.6 });
      if (CSS.registerProperty) {
        try { CSS.registerProperty({ name: '--pos', syntax: '<percentage>', inherits: true, initialValue: '50%' }); } catch (e) {}
      }
      hint.observe(compare);
    }
  }

  /* ---------- Equipo: flechas ---------- */
  const track = $('.team-track');
  $$('[data-scroll]').forEach((btn) => btn.addEventListener('click', () => {
    const card = $('.doctor', track);
    const step = card ? card.getBoundingClientRect().width + 20 : 320;
    track.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- Opiniones ---------- */
  const quoteTabs = $$('[data-quote-tab]');
  const quotes = $$('[data-quote]');
  const showQuote = (idx, focus) => {
    quoteTabs.forEach((t, i) => { t.setAttribute('aria-selected', String(i === idx)); t.tabIndex = i === idx ? 0 : -1; });
    quotes.forEach((q, i) => {
      const on = i === idx;
      q.hidden = !on;
      q.classList.toggle('is-entering', on);
    });
    if (focus) quoteTabs[idx].focus();
  };
  quoteTabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', () => showQuote(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') showQuote((i + 1) % quoteTabs.length, true);
      if (e.key === 'ArrowLeft') showQuote((i - 1 + quoteTabs.length) % quoteTabs.length, true);
    });
  });

  /* ---------- Precios: pestañas con indicador ---------- */
  const tabs = $$('.tabs [role="tab"]');
  const indicator = $('.tabs-indicator');
  const moveIndicator = (tab) => {
    if (!indicator || !tab) return;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    moveIndicator(tab);
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
  const syncIndicator = () => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true'));
  (document.fonts?.ready || Promise.resolve()).then(syncIndicator);
  window.addEventListener('resize', syncIndicator);

  /* ---------- FAQ: apertura suave ---------- */
  $$('.faq-item').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.faq-body', d);
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (!d.open) {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
      } else {
        d.classList.remove('is-open');
        const done = () => { if (!d.classList.contains('is-open')) d.open = false; };
        if (reduceMotion) done(); else body.addEventListener('transitionend', done, { once: true });
      }
    });
  });

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.hidden = true;
    void toastEl.offsetWidth;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
  };

  /* ---------- Reserva: días, horas, validación ---------- */
  const daysEl = $('[data-days]');
  const slotsEl = $('[data-slots]');
  const form = $('.booking-form');
  const WEEKDAY_SLOTS = ['09:00', '09:45', '10:30', '11:15', '12:00', '12:45', '16:00', '16:45', '17:30', '18:15', '19:00', '19:45'];
  const SATURDAY_SLOTS = ['10:00', '10:45', '11:30', '12:15', '13:00'];
  const fmtDay = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
  const fmtLong = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  /* Ocupación de ejemplo, determinista por fecha */
  const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const slotsFor = (date) => {
    const dow = date.getDay();
    if (dow === 0) return [];
    const base = dow === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
    const now = new Date();
    const isToday = keyOf(date) === keyOf(now);
    return base.map((time) => {
      const [h, m] = time.split(':').map(Number);
      const past = isToday && (h * 60 + m) <= now.getHours() * 60 + now.getMinutes() + 60;
      const taken = hash(keyOf(date) + time) % 100 < 42;
      return { time, available: !past && !taken };
    });
  };
  const days = [];
  for (let i = 0; days.length < 14; i++) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i);
    days.push(d);
  }

  const state = { day: null, slot: null };

  const renderDays = () => {
    daysEl.innerHTML = '';
    days.forEach((d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'day';
      b.setAttribute('role', 'radio');
      const closed = d.getDay() === 0;
      const full = !closed && slotsFor(d).every((s) => !s.available);
      b.disabled = closed;
      b.setAttribute('aria-checked', 'false');
      b.setAttribute('aria-label', `${fmtLong.format(d)}${closed ? ', cerrado' : full ? ', completo' : ''}`);
      b.innerHTML = `<small>${fmtDay.format(d).replace('.', '')}</small><strong>${d.getDate()}</strong>`;
      b.dataset.key = keyOf(d);
      b.addEventListener('click', () => selectDay(d));
      daysEl.append(b);
    });
  };

  const renderSlots = (d, withSkeleton) => {
    const paint = () => {
      slotsEl.innerHTML = '';
      const list = slotsFor(d);
      if (!list.some((s) => s.available)) {
        const p = document.createElement('p');
        p.className = 'slots-empty';
        p.textContent = 'No quedan huecos este día. Prueba con el siguiente o llámanos al 913 48 27 16.';
        slotsEl.append(p);
        return;
      }
      list.forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot';
        b.setAttribute('role', 'radio');
        b.textContent = s.time;
        b.disabled = !s.available;
        b.setAttribute('aria-checked', String(state.slot === s.time));
        b.setAttribute('aria-label', `${s.time}${s.available ? '' : ', ocupado'}`);
        b.addEventListener('click', () => {
          state.slot = s.time;
          $$('.slot', slotsEl).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
          $('[data-error="slot"]').hidden = true;
        });
        slotsEl.append(b);
      });
    };
    if (withSkeleton && !reduceMotion) {
      slotsEl.innerHTML = Array.from({ length: 8 }, () => '<span class="slots-skeleton"></span>').join('');
      setTimeout(paint, 260);
    } else paint();
  };

  const selectDay = (d, preferSlot) => {
    state.day = d;
    state.slot = preferSlot || null;
    $$('.day', daysEl).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.key === keyOf(d))));
    renderSlots(d, !preferSlot);
  };

  const nextAvailable = () => {
    for (const d of days) {
      const s = slotsFor(d).find((x) => x.available);
      if (s) return { d, time: s.time };
    }
    return null;
  };

  if (daysEl && slotsEl) {
    renderDays();
    const first = nextAvailable();
    if (first) {
      selectDay(first.d);
      const label = $('[data-next-slot]');
      if (label) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diff = Math.round((first.d - today) / 86400000);
        const short = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(first.d).replace(/[.,]/g, '');
        const dayLabel = diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : short.charAt(0).toUpperCase() + short.slice(1);
        label.textContent = `${dayLabel}, ${first.time}`;
      }
      $('[data-book-next]')?.addEventListener('click', () => selectDay(first.d, first.time));
    }
  }

  /* Enlaces que preseleccionan tratamiento */
  $$('[data-treatment]').forEach((a) => a.addEventListener('click', () => {
    const input = $(`.chips input[value="${a.dataset.treatment}"]`);
    if (input) input.checked = true;
  }));

  const showError = (name, show) => {
    const el = $(`[data-error="${name}"]`);
    if (el) el.hidden = !show;
    const input = form.elements[name];
    if (input && input.closest) {
      input.closest('.field')?.classList.toggle('is-invalid', show);
      if (input.setAttribute) input.setAttribute('aria-invalid', String(show));
    }
  };
  const validators = {
    nombre: (v) => v.trim().length >= 2,
    telefono: (v) => v.replace(/[\s+().-]/g, '').replace(/^34/, '').match(/^[6789]\d{8}$/),
  };
  ['nombre', 'telefono'].forEach((name) => {
    const input = form?.elements[name];
    input?.addEventListener('blur', () => { if (input.value) showError(name, !validators[name](input.value)); });
    input?.addEventListener('input', () => { if (validators[name](input.value)) showError(name, false); });
  });

  let lastBooking = null;
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const errors = {
      slot: !state.slot,
      nombre: !validators.nombre(fd.get('nombre') || ''),
      telefono: !validators.telefono(fd.get('telefono') || ''),
      privacidad: !fd.get('privacidad'),
    };
    Object.entries(errors).forEach(([k, v]) => showError(k, v));
    const firstError = Object.keys(errors).find((k) => errors[k]);
    if (firstError) {
      const target = firstError === 'slot' ? slotsEl : form.elements[firstError];
      target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      if (target?.focus && firstError !== 'slot') target.focus({ preventScroll: true });
      return;
    }
    const btn = $('button[type="submit"]', form);
    btn.classList.add('is-loading');
    $('.btn-label', btn).textContent = 'Enviando';
    setTimeout(() => {
      btn.classList.remove('is-loading');
      $('.btn-label', btn).textContent = 'Confirmar cita';
      lastBooking = { treatment: fd.get('tratamiento'), day: state.day, time: state.slot, name: String(fd.get('nombre')).trim() };
      $('[data-success-summary]').textContent =
        `${lastBooking.name.split(' ')[0]}, te esperamos el ${fmtLong.format(lastBooking.day)} a las ${lastBooking.time} para ${String(lastBooking.treatment).toLowerCase()}. Te escribiremos por WhatsApp para confirmarlo.`;
      $('[data-form-body]').hidden = true;
      const ok = $('[data-form-success]');
      ok.hidden = false;
      ok.focus({ preventScroll: true });
    }, 1100);
  });

  $('[data-reset]')?.addEventListener('click', () => {
    form.reset();
    $('[data-form-success]').hidden = true;
    $('[data-form-body]').hidden = false;
    const first = nextAvailable();
    if (first) selectDay(first.d);
  });

  /* Archivo .ics para añadir al calendario */
  $('[data-ics]')?.addEventListener('click', () => {
    if (!lastBooking) return;
    const [h, m] = lastBooking.time.split(':').map(Number);
    const startD = new Date(lastBooking.day); startD.setHours(h, m, 0, 0);
    const endD = new Date(startD.getTime() + 45 * 60000);
    const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nacar Clinica Dental//ES', 'BEGIN:VEVENT',
      `UID:${Date.now()}@nacardental.es`, `DTSTART;TZID=Europe/Madrid:${f(startD)}`, `DTEND;TZID=Europe/Madrid:${f(endD)}`,
      `SUMMARY:Cita en Nácar Clínica Dental (${lastBooking.treatment})`,
      'LOCATION:Calle de Fuencarral 118\\, 2.º\\, 28010 Madrid',
      'DESCRIPTION:Si necesitas cambiarla\\, llama al 913 48 27 16.',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'cita-nacar.ics' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Cita descargada para tu calendario');
  });
})();
