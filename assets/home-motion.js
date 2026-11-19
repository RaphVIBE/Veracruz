/* VeraCruz, motion layer for the home page (EN and FR).
   Without JS everything is visible. With "reduce motion" nothing moves:
   the script only keeps the lazy-image fade and the scroll progress off. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hero = document.querySelector('[aria-labelledby="h"]');

  // Lazy images below the first screen, with a soft fade once loaded
  $$('#main img').forEach(function (img) {
    if (hero && hero.contains(img)) return;
    img.loading = 'lazy';
    img.decoding = 'async';
  });

  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('vc-m');

  // Symbol: the V then the C are drawn stroke by stroke. The strokes only
  // reveal the symbol image itself, so the end state is the logo, pixel for pixel.
  (function () {
    var img = document.querySelector('header a[href="/"] img[src*="sym-cream"]');
    if (!img) return;
    var NS = 'http://www.w3.org/2000/svg';
    var st = document.createElement('style');
    st.textContent =
      '.vc-sym{position:relative;display:block;flex:none;line-height:0}' +
      '.vc-sym svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}' +
      '.vc-sym .p{fill:none;stroke:#fff;stroke-dasharray:1;stroke-dashoffset:1}' +
      '.vc-sym.go .p{animation:vc-draw 900ms cubic-bezier(.65,0,.35,1) forwards}' +
      '.vc-sym.go .p.c{animation-delay:380ms;animation-duration:1000ms}' +
      '.vc-sym img{animation:none!important;transform:none!important}' +
      '.vc-sym.drawing img{opacity:0!important}' +
      '@keyframes vc-draw{to{stroke-dashoffset:0}}';
    document.head.appendChild(st);
    var wrap = document.createElement('span');
    wrap.className = 'vc-sym';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    var id = 'vc-sym-m';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-20" y="-40" width="300" height="320">' +
      '<path class="p v" pathLength="1" stroke-width="30" stroke-linejoin="round" d="M 6 -20 L 134 194 L 261 -20"/>' +
      '<path class="p c" pathLength="1" stroke-width="28" d="M 248.3 155.4 A 125 63 0 1 0 248.3 208.6"/>' +
      '</mask></defs>' +
      '<image href="' + (img.currentSrc || img.src) + '" x="0" y="0" width="256" height="256" mask="url(#' + id + ')"/>';
    wrap.appendChild(svg);
    var busy = false;
    function draw() {
      if (busy) return; busy = true;
      wrap.classList.remove('go');
      void wrap.offsetWidth;
      wrap.classList.add('drawing', 'go');
      setTimeout(function () { wrap.classList.remove('drawing'); busy = false; }, 1450);
    }
    draw();
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      wrap.parentNode.addEventListener('mouseenter', draw);
    }
  })();

  $$('#main img').forEach(function (img) {
    if (hero && hero.contains(img)) return;
    if (img.complete && img.naturalWidth) return;
    img.classList.add('vc-img');
    img.addEventListener('load', function () { img.classList.add('vc-loaded'); }, { once: true });
    img.addEventListener('error', function () { img.classList.add('vc-loaded'); }, { once: true });
  });

  // Nav links come in one after the other
  $$('header nav a').forEach(function (a, i) { a.style.setProperty('--i', i); });

  // Hero: the title rises word by word, the rest follows
  if (hero) {
    var h1 = hero.querySelector('h1');
    if (h1) {
      var words = h1.textContent.trim().split(/\s+/);
      h1.setAttribute('aria-label', h1.textContent.trim());
      h1.textContent = '';
      words.forEach(function (w, i) {
        var o = document.createElement('span'); o.className = 'vc-w'; o.setAttribute('aria-hidden', 'true');
        var n = document.createElement('span'); n.className = 'vc-wi'; n.style.setProperty('--i', i); n.textContent = w;
        o.appendChild(n); h1.appendChild(o);
        if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
      });
    }
    var seq = [hero.querySelector('p'), hero.querySelector('h1 + p'), hero.querySelector('h1 + p + div')];
    seq.forEach(function (el, i) { if (el) { el.classList.add('vc-fade'); el.style.setProperty('--d', [0.1, 0.75, 0.9][i] + 's'); } });
    var gauges = hero.querySelector('[role="group"]');
    if (gauges) {
      gauges.classList.add('vc-fade'); gauges.style.setProperty('--d', '1.05s');
      setTimeout(function () { gauges.classList.add('vc-go'); }, 1100);
    }
  }

  // Everything below the first screen slides in when it comes into view
  var targets = $$('#main section h2, #main section article, #main section figure, #main section details, #main section form, #main section ol > li, #main section ul:not(article ul) > li, #main section > div > div > div[style*="border-top"], .vc-dialx img');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('vc-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  var vh = window.innerHeight;
  targets.forEach(function (el) {
    if (hero && hero.contains(el)) return;
    var sl = el.closest('.vc-slide');
    if (sl && sl.scrollWidth > sl.clientWidth + 4) return; // phone carousel: keep cards visible
    if (el.getBoundingClientRect().top < vh) return; // already on screen: never hide it
    var sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(sibs * 70, 280) + 'ms';
    el.classList.add('vc-pre');
    io.observe(el);
  });
  // Safety net: nothing stays hidden
  setTimeout(function () { $$('.vc-pre').forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('vc-in'); }); }, 2500);

  // Scroll progress and a light parallax on the backdrop
  var bar = document.querySelector('.vc-progress');
  var bg = document.querySelector('.vc-bg');
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (bg && y < window.innerHeight * 1.2) bg.style.translate = '0 ' + (y * 0.25).toFixed(1) + 'px';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
