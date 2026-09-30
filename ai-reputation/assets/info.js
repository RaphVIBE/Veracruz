/* AI Réputation — bulles « i » : ouverture au clic ou au tap, une seule à la fois,
   fermeture par Échap, clic ailleurs ou second clic. Fonctionne aussi sur du contenu
   injecté après coup (rapport), grâce à la délégation d'événements. */
(function () {
  var open = null;

  function close() {
    if (!open) return;
    open.btn.setAttribute("aria-expanded", "false");
    open.tip.hidden = true;
    open = null;
  }

  function place(btn, tip) {
    var box = tip.offsetParent || tip.parentElement;
    var b = btn.getBoundingClientRect(), c = box.getBoundingClientRect();
    tip.style.top = (b.bottom - c.top + 10) + "px";
    var w = tip.offsetWidth, left = b.left - c.left - 12;
    left = Math.max(12, Math.min(left, c.width - w - 12));
    tip.style.left = left + "px";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button.info");
    if (btn) {
      e.preventDefault();
      var tip = document.getElementById(btn.getAttribute("aria-controls"));
      if (!tip) return;
      var same = open && open.btn === btn;
      close();
      if (same) return;
      tip.hidden = false;
      place(btn, tip);
      btn.setAttribute("aria-expanded", "true");
      open = { btn: btn, tip: tip };
      return;
    }
    if (open && !open.tip.contains(e.target)) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) { var b = open.btn; close(); b.focus(); }
  });
  window.addEventListener("resize", close);
})();
