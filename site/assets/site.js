// Remplit les dates du « défi du jour » avec la date du jour.
(function () {
  const now = new Date();
  const formats = {
    long: { weekday: "long", day: "numeric", month: "long" },
    month: { month: "short" },
    monthlong: { month: "long" },
    weekday: { weekday: "long" },
    day: { day: "numeric" },
  };
  document.querySelectorAll("[data-today]").forEach((node) => {
    const opts = formats[node.dataset.today];
    if (opts) node.textContent = now.toLocaleDateString("fr-FR", opts).replace(".", "");
  });
})();

// Menu mobile.
(function () {
  const btn = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    const open = menu.classList.contains("hidden");
    menu.classList.toggle("hidden", !open);
    menu.classList.toggle("flex", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.firstElementChild.textContent = open ? "close" : "menu";
  });
})();

// Barre de commandes mobile des jeux : relaie les clics vers la console
// et recopie les infos utiles (lettre, écart, couleur sélectionnés).
(function () {
  const watch = (node, cb, opts) => { cb(); new MutationObserver(cb).observe(node, opts); };
  document.querySelectorAll("[data-proxy]").forEach((b) => {
    b.addEventListener("click", () => document.querySelector(b.dataset.proxy)?.click());
  });
  document.querySelectorAll("[data-mirror]").forEach((n) => {
    const src = document.querySelector(n.dataset.mirror);
    if (src) watch(src, () => (n.textContent = src.textContent.trim()), { childList: true, characterData: true, subtree: true });
  });
  document.querySelectorAll("[data-mirror-bg]").forEach((n) => {
    const src = document.querySelector(n.dataset.mirrorBg);
    if (src) watch(src, () => (n.style.backgroundColor = src.style.backgroundColor), { attributes: true, attributeFilter: ["style"] });
  });
  const dock = document.querySelector("[data-dock]");
  const gate = dock && document.querySelector(dock.dataset.dock);
  if (gate) watch(gate, () => dock.classList.toggle("translate-y-full", gate.disabled), { attributes: true, attributeFilter: ["disabled"] });
})();

// Entrées au défilement : chaque bloc .reveal apparaît une fois, décalé de --d.
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return items.forEach((n) => n.classList.add("is-in"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((n) => io.observe(n));
})();

// Titres « pleine largeur » : la taille s'ajuste pour remplir exactement la colonne (à partir de 768 px).
(function () {
  const items = [...document.querySelectorAll("[data-fit]")];
  if (!items.length) return;
  function fit() {
    items.forEach((el) => {
      el.style.fontSize = "";
      if (window.innerWidth < 768 && !el.hasAttribute("data-fit-always")) return;
      const avail = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) - parseFloat(getComputedStyle(el.parentElement).paddingRight);
      el.style.whiteSpace = "nowrap";
      el.style.display = "inline-block";
      el.style.fontSize = "100px";
      const w = el.getBoundingClientRect().width;
      el.style.display = "";
      el.style.fontSize = Math.floor((avail / w) * 100 * 0.995) + "px";
    });
  }
  fit();
  document.fonts && document.fonts.ready.then(fit);
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 80); });
})();

// En-tête : affiche le prénom quand un compte est connecté.
(function () {
  let u = null;
  try { u = JSON.parse(localStorage.getItem("oeil:account")); } catch (e) {}
  if (!u) return;
  document.querySelectorAll("[data-account-link]").forEach((a) => { a.href = "compte.html"; const n = a.querySelector("[data-account-name]"); if (n) n.textContent = u.name; else a.textContent = u.name; });
})();

// FAQ : ouverture et fermeture animées.
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("details.faq").forEach((d) => {
    const sum = d.querySelector("summary"), body = sum.nextElementSibling;
    if (!body) return;
    sum.addEventListener("click", (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 220, easing: "cubic-bezier(.3,.7,.2,1)" }).onfinish = () => (d.open = false);
        d.classList.remove("is-open");
      } else {
        d.open = true;
        d.classList.add("is-open");
        const h = body.offsetHeight;
        body.animate([{ height: "0px", opacity: 0, transform: "translateY(-6px)" }, { height: h + "px", opacity: 1, transform: "none" }], { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
    });
  });
})();
