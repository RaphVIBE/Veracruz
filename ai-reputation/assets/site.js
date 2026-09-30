/* AI Réputation — comportements partagés : langue (pages simples), menu, apparitions */
(function () {
  // Language toggle for pages that only need text swaps (méthode, tarifs).
  // The home page defines its own setLang before this file loads; it is kept.
  if (typeof window.setLang !== "function") {
    var dict = window.PAGE_I18N || { en: {} };
    var fr = {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) { fr[el.getAttribute("data-i18n")] = el.innerHTML; });
    window.setLang = function (l) {
      var d = l === "en" ? dict.en : fr;
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        var k = el.getAttribute("data-i18n");
        if (d[k] !== undefined) el.innerHTML = d[k];
      });
      document.documentElement.lang = l;
      var bf = document.getElementById("btn-fr"), be = document.getElementById("btn-en");
      if (bf) bf.setAttribute("aria-pressed", String(l === "fr"));
      if (be) be.setAttribute("aria-pressed", String(l === "en"));
      try { localStorage.setItem("ar-lang", l); } catch (e) {}
    };
    try { if (localStorage.getItem("ar-lang") === "en") window.setLang("en"); } catch (e) {}
  }

  // Menu: close on outside tap, on link tap and on Escape.
  var menu = document.querySelector(".menu");
  if (menu) {
    document.addEventListener("click", function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { menu.open = false; }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") menu.open = false; });
  }

  // Sections fade in as they enter the viewport.
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  var fy = document.getElementById("fy");
  if (fy) fy.textContent = String(new Date().getFullYear());
})();
