/* VeraCruz motion layer. Voir motion.css.
   Aucune dépendance. Ne fait rien si l'utilisateur préfère moins d'animation. */
(function () {
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.classList.add('m');
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── Découpe en mots, en gardant em, strong, span.ink ── */
  function splitWords(el, wrapClass, innerClass) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var inner = document.createElement('span');
            inner.className = innerClass;
            inner.style.setProperty('--i', n++);
            inner.textContent = p;
            if (wrapClass) {
              var w = document.createElement('span');
              w.className = wrapClass;
              w.appendChild(inner);
              frag.appendChild(w);
            } else frag.appendChild(inner);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) walk(child);
      });
    })(el);
    return n;
  }

  /* ── Titres découpés ── */
  var splits = $$('.hero h1, .block-head h2');
  splits.forEach(function (el) {
    el.classList.remove('reveal');
    el.classList.add('m-split');
    splitWords(el, 'w', 'wi');
  });
  var ioSplit = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); ioSplit.unobserve(e.target); }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
  splits.forEach(function (el) { ioSplit.observe(el); });

  /* Le portrait est rogné à zéro au départ : on observe son conteneur. */
  var portrait = $('.about-portrait');
  if (portrait && portrait.parentNode) {
    var ioP = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { portrait.classList.add('in'); ioP.disconnect(); }
    }, { threshold: 0.15 });
    ioP.observe(portrait.parentNode);
  }

  /* ── Indices pour les décalages ── */
  $$('nav.primary li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  $$('.sectors li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  $$('.practice-row .examples').forEach(function (ul) {
    $$('li', ul).forEach(function (li, i) { li.style.setProperty('--i', i); });
  });

  /* ── Symbole tracé ── */
  var mark = $('.wordmark .mark-img');
  var markWrap = null;
  if (mark) {
    markWrap = document.createElement('span');
    markWrap.className = 'm-mark';
    mark.parentNode.insertBefore(markWrap, mark);
    markWrap.appendChild(mark);
    markWrap.insertAdjacentHTML('beforeend',
      '<svg viewBox="0 0 256 256" aria-hidden="true">' +
      '<path class="v" pathLength="1" stroke-width="30" stroke-linejoin="round" d="M 6 -20 L 134 194 L 261 -20"/>' +
      '<path class="c" pathLength="1" stroke-width="28" d="M 248.3 155.4 A 125 63 0 1 0 248.3 208.6"/>' +
      '</svg>');
    // Le tracé est découpé par la forme exacte du symbole : à la fin du
    // dessin, l'image et le tracé se superposent au pixel près.
    var svgEl = markWrap.querySelector('svg');
    var maskUrl = 'url("' + (mark.currentSrc || mark.src) + '")';
    svgEl.style.webkitMaskImage = maskUrl;
    svgEl.style.maskImage = maskUrl;
    var draw = function () {
      markWrap.classList.remove('is-done', 'is-drawing');
      void markWrap.offsetWidth;
      markWrap.classList.add('is-drawing');
      setTimeout(function () { markWrap.classList.add('is-done'); }, 1450);
    };
    draw();
    var lastDraw = Date.now();
    if (finePointer) {
      $('.wordmark').addEventListener('mouseenter', function () {
        if (Date.now() - lastDraw > 1600) { lastDraw = Date.now(); draw(); }
      });
    }
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('m-ready'); }); });

  /* ── Fil de lecture sous l'en-tête ── */
  var header = $('header.site');
  var bar = document.createElement('div');
  bar.className = 'm-progress';
  if (header) header.appendChild(bar);

  /* ── Navigation : trait glissant ── */
  var navUl = $('nav.primary ul');
  var navBar = null;
  function placeNav(a) {
    if (!navBar) return;
    if (!a) { navBar.style.opacity = 0; return; }
    var r = a.getBoundingClientRect(), u = navUl.getBoundingClientRect();
    navBar.style.width = r.width + 'px';
    navBar.style.transform = 'translateX(' + (r.left - u.left) + 'px)';
    navBar.style.opacity = 1;
  }
  if (navUl) {
    navBar = document.createElement('span');
    navBar.className = 'm-nav-bar';
    navUl.appendChild(navBar);
    $$('a', navUl).forEach(function (a) {
      a.addEventListener('mouseenter', function () { placeNav(a); });
      a.addEventListener('focus', function () { placeNav(a); });
    });
    navUl.addEventListener('mouseleave', function () { placeNav($('a.is-active', navUl)); });
    new MutationObserver(function () {
      if (!navUl.matches(':hover')) placeNav($('a.is-active', navUl));
    }).observe(navUl, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  /* ── Practice : le fil ── */
  var list = $('.practice-list');
  var thread = null, rows = $$('.practice-row');
  if (list) {
    thread = document.createElement('div');
    thread.className = 'm-thread';
    thread.innerHTML = '<i></i>';
    list.appendChild(thread);
  }

  /* ── Quiet by design : encrage au défilement ── */
  var scrub = $('.currently-body');
  var scrubWords = [];
  if (scrub) {
    scrub.classList.remove('reveal');
    scrub.classList.add('m-scrub');
    splitWords(scrub, null, 'sw');
    scrubWords = $$('.sw', scrub);
  }

  /* ── Questions : ouverture animée ── */
  $$('.faq details').forEach(function (d) {
    var s = $('summary', d), p = $('p', d);
    if (!s || !p) return;
    var label = document.createElement('span');
    label.className = 'q';
    while (s.firstChild) label.appendChild(s.firstChild);
    s.appendChild(label);
    var anim = null;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (anim) anim.cancel();
      var pad = getComputedStyle(p).paddingBottom;
      if (d.open) {
        var h = p.offsetHeight;
        d.classList.add('is-closing');
        anim = p.animate(
          [{ height: h + 'px', opacity: 1, paddingBottom: pad }, { height: '0px', opacity: 0, paddingBottom: '0px' }],
          { duration: 380, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
        anim.onfinish = function () { d.open = false; d.classList.remove('is-closing'); anim.cancel(); anim = null; };
        anim.oncancel = function () { d.classList.remove('is-closing'); };
      } else {
        d.open = true;
        var h2 = p.offsetHeight;
        anim = p.animate(
          [{ height: '0px', opacity: 0, paddingBottom: '0px' }, { height: h2 + 'px', opacity: 1, paddingBottom: pad }],
          { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        anim.onfinish = function () { anim = null; };
      }
    });
  });

  /* ── Contact : lettres qui roulent, lien aimanté ── */
  var lead = $('.contact-line a.v--lead');
  if (lead) {
    var tn = Array.prototype.slice.call(lead.childNodes).filter(function (c) { return c.nodeType === 3 && c.textContent.trim(); })[0];
    if (tn) {
      var text = tn.textContent.trim();
      lead.setAttribute('aria-label', text);
      var roll = document.createElement('span');
      roll.className = 'm-roll';
      roll.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (c, i) {
        var ch = document.createElement('span');
        ch.className = 'ch';
        ch.style.setProperty('--i', i);
        ch.textContent = c;
        roll.appendChild(ch);
      });
      lead.replaceChild(roll, tn);
      lead.insertBefore(document.createTextNode(' '), roll.nextSibling);
    }
    if (finePointer) {
      lead.addEventListener('mousemove', function (e) {
        var r = lead.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        lead.style.setProperty('--mx', (dx * 14).toFixed(1) + 'px');
        lead.style.setProperty('--my', (dy * 8).toFixed(1) + 'px');
      });
      lead.addEventListener('mouseleave', function () {
        lead.style.setProperty('--mx', '0px');
        lead.style.setProperty('--my', '0px');
      });
    }
  }

  /* ── Hero : parallaxe au pointeur et au défilement ── */
  var hero = $('.hero');
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function heroLoop() {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    hero.style.setProperty('--hx', cx.toFixed(2) + 'px');
    hero.style.setProperty('--hy', cy.toFixed(2) + 'px');
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(heroLoop);
    else raf = null;
  }
  if (hero && finePointer) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = -((e.clientX - r.left) / r.width - 0.5) * 22;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 14;
      if (!raf) raf = requestAnimationFrame(heroLoop);
    });
    hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(heroLoop); });
  }

  /* ── Tout ce qui dépend du défilement, en une passe par image ── */
  var ticking = false;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight, sy = window.scrollY;
    var max = document.documentElement.scrollHeight - vh;
    bar.style.setProperty('--p', max > 0 ? (sy / max).toFixed(4) : 0);

    if (hero && sy < vh * 1.2) hero.style.setProperty('--hs', (sy * 0.28).toFixed(1) + 'px');

    if (thread) {
      var lr = list.getBoundingClientRect();
      var t = clamp01((vh * 0.55 - lr.top) / lr.height);
      thread.style.setProperty('--t', t.toFixed(4));
      rows.forEach(function (row) {
        var rr = row.getBoundingClientRect();
        row.classList.toggle('is-lit', rr.top + 60 < vh * 0.55);
        var img = $('.practice-image img', row);
        if (img && rr.bottom > 0 && rr.top < vh) {
          var c = (rr.top + rr.height / 2 - vh / 2) / vh;
          img.style.setProperty('--py', (c * -26).toFixed(1) + 'px');
        }
      });
    }

    if (scrubWords.length) {
      var sr = scrub.getBoundingClientRect();
      var prog = clamp01((vh * 0.82 - sr.top) / (sr.height + vh * 0.3));
      var lit = Math.round(prog * scrubWords.length);
      for (var i = 0; i < scrubWords.length; i++) scrubWords[i].classList.toggle('on', i < lit);
    }
  }
  function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', function () { requestScroll(); placeNav($('a.is-active', navUl)); });
  onScroll();
})();
