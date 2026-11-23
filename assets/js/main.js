/* Dr. Pietro Piombetti — interazioni del sito */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INSTAGRAM = 'https://www.instagram.com/pietropiombetti_nutrizionista/';

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Menu burger (solo mobile/tablet) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var toggleLabel = toggle.querySelector('.sr-only');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
    if (mq.matches) setNav(false);
  });

  /* ---------- Voce di menu attiva ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav ul a'));
  var linkById = {};
  navLinks.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) linkById[s.id] = a;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && linkById[entry.target.id]) {
          navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          linkById[entry.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkById).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---------- Fade-in delicati ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Come funziona: linea che si riempie allo scroll ---------- */
  var journey = document.getElementById('journey');
  if (journey) {
    var track = journey.querySelector('.journey-track');
    var steps = Array.prototype.slice.call(journey.querySelectorAll('.step'));
    var nums = steps.map(function (s) { return s.querySelector('.step-num'); });
    var vertical = false;

    function layoutTrack() {
      var base = journey.getBoundingClientRect();
      var a = nums[0].getBoundingClientRect();
      var b = nums[nums.length - 1].getBoundingClientRect();
      var ax = a.left + a.width / 2 - base.left, ay = a.top + a.height / 2 - base.top;
      var bx = b.left + b.width / 2 - base.left, by = b.top + b.height / 2 - base.top;
      vertical = Math.abs(by - ay) > Math.abs(bx - ax);
      journey.classList.toggle('is-vertical', vertical);
      if (vertical) {
        track.style.cssText = 'left:' + (ax - 1.5) + 'px;top:' + ay + 'px;width:3px;height:' + (by - ay) + 'px;right:auto';
      } else {
        track.style.cssText = 'left:' + ax + 'px;top:' + (ay - 1.5) + 'px;width:' + (bx - ax) + 'px;height:3px;right:auto';
      }
    }

    function updateJourney() {
      var p;
      if (reduceMotion) {
        p = 1;
      } else {
        var r = journey.getBoundingClientRect();
        var vh = window.innerHeight;
        var start = vh * 0.82;
        var span = Math.max(r.height, vh * 0.38);
        p = (start - r.top) / span;
        p = Math.min(1, Math.max(0, p));
      }
      journey.style.setProperty('--p', p.toFixed(3));
      steps.forEach(function (s, i) {
        var threshold = steps.length > 1 ? i / (steps.length - 1) : 0;
        var on = p > 0 && p >= threshold - 0.02;
        s.classList.toggle('is-active', on);
      });
    }

    var ticking = false;
    function onScrollJourney() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { updateJourney(); ticking = false; });
    }
    layoutTrack();
    updateJourney();
    window.addEventListener('scroll', onScrollJourney, { passive: true });
    window.addEventListener('resize', function () { layoutTrack(); updateJourney(); });
    window.addEventListener('load', function () { layoutTrack(); updateJourney(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutTrack);
  }

  /* ---------- FAQ accordion (tutte chiuse all'avvio) ---------- */
  document.querySelectorAll('.faq-q button').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (reduceMotion) { panel.hidden = open; return; }
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        panel.addEventListener('transitionend', function done() {
          panel.hidden = true; panel.style.height = '';
          panel.removeEventListener('transitionend', done);
        });
      } else {
        panel.hidden = false;
        var h = panel.scrollHeight;
        panel.style.height = '0px';
        requestAnimationFrame(function () { panel.style.height = h + 'px'; });
        panel.addEventListener('transitionend', function done() {
          panel.style.height = '';
          panel.removeEventListener('transitionend', done);
        });
      }
    });
  });

  /* ---------- Modulo di contatto ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn.textContent;

    var rules = {
      'cf-name': function (v) { return v.trim().length >= 2 ? '' : 'Inserisci nome e cognome.'; },
      'cf-email': function (v) {
        if (!v.trim()) return 'Inserisci il tuo indirizzo email.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Inserisci un indirizzo email valido.';
      },
      'cf-phone': function (v) {
        return !v.trim() || /^[+0-9\s().-]{6,20}$/.test(v.trim()) ? '' : 'Inserisci un numero valido oppure lascia il campo vuoto.';
      },
      'cf-place': function (v) { return v ? '' : 'Seleziona la sede di interesse.'; },
      'cf-msg': function (v) { return v.trim().length >= 10 ? '' : 'Scrivi un breve messaggio (almeno 10 caratteri).'; },
      'cf-privacy': function (v, el) { return el.checked ? '' : 'Per inviare la richiesta è necessario il consenso al trattamento dei dati.'; }
    };

    var validateField = function (id) {
      var el = document.getElementById(id);
      var msg = rules[id](el.value, el);
      document.getElementById(id + '-err').textContent = msg;
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-errormessage', id + '-err');
      } else {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-errormessage');
      }
      return !msg;
    };

    Object.keys(rules).forEach(function (id) {
      var el = document.getElementById(id);
      var evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur';
      el.addEventListener(evt, function () { validateField(id); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) validateField(id); });
    });

    var setStatus = function (type, html) {
      status.className = 'form-status' + (type ? ' is-' + type : '');
      status.innerHTML = html;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      var firstInvalid = null;
      Object.keys(rules).forEach(function (id) {
        if (!validateField(id) && !firstInvalid) firstInvalid = document.getElementById(id);
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      if (form.querySelector('#cf-website').value) return; // honeypot

      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      if (!endpoint) {
        // Nessun servizio di ricezione configurato: non si simula l'invio.
        setStatus('error', 'Al momento il modulo online non è attivo e la richiesta <strong>non è stata inviata</strong>. ' +
          'Puoi contattarmi direttamente su <a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a>.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Invio in corso…';

      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus('success', '<strong>Grazie, la tua richiesta è stata inviata.</strong> Ti risponderò il prima possibile all\'indirizzo email indicato.');
        })
        .catch(function () {
          setStatus('error', 'Non è stato possibile inviare la richiesta. Riprova tra poco oppure scrivimi su ' +
            '<a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram</a>.');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        });
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
