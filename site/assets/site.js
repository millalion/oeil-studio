// Contours de focus réservés au clavier : la touche Tab les active, un clic ou un toucher les retire.
(function () {
  const root = document.documentElement;
  addEventListener("keydown", (e) => { if (e.key === "Tab") root.classList.add("kbd"); }, true);
  addEventListener("pointerdown", () => root.classList.remove("kbd"), true);
})();

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

// En-tête : avatar et prénom quand un compte est connecté.
(function () {
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PRO = ["pro", "parcours", "classe", "ecole", "classe-eleve"];
  // Série de jours du défi, affichée à côté du compte
  function streakBadge() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem("oeil:daily")); } catch (e) {}
    if (!d || !d.streak || !d.last) return "";
    const age = (Date.now() - new Date(d.last + "T00:00:00").getTime()) / 864e5;
    if (age >= 2) return "";
    return `<span class="nav-streak" title="${d.streak} jour${d.streak > 1 ? "s" : ""} de série"><span class="material-symbols-outlined" aria-hidden="true">local_fire_department</span>${d.streak}</span>`;
  }
  function paint() {
    let u = null;
    try { u = JSON.parse(localStorage.getItem("oeil:account")); } catch (e) {}
    // Membres Pro : couronne sur l'avatar et accent doré dans toute l'interface
    document.documentElement.classList.toggle("is-pro", !!(u && PRO.includes(u.plan)));
    document.querySelectorAll("[data-account-link]").forEach((a) => {
      if (a.dataset.orig == null) a.dataset.orig = a.innerHTML;
      if (!u) { a.innerHTML = a.dataset.orig; a.href = "connexion.html"; a.classList.remove("account-chip"); return; }
      const pro = PRO.includes(u.plan);
      a.href = "compte.html";
      const av = u.avatar || {}, inner = av.icon ? `<span class="material-symbols-outlined" aria-hidden="true">${esc(av.icon)}</span>` : esc((u.name || "?").trim()[0].toUpperCase());
      if (a.dataset.orig.includes("data-account-name")) { a.classList.add("account-chip"); a.innerHTML = `${streakBadge()}<span class="avatar${pro ? " is-pro" : ""}" style="--av:${esc(av.color || "#B9D9FF")}">${inner}${pro ? '<span class="crown" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 7.5 7 11.5 12 4l5 7.5 4.5-4L19.5 19h-15z" fill="#141413"/></svg></span>' : ""}</span><span class="hidden sm:inline">${esc(u.name)}</span>${pro ? '<span class="pro-chip">Pro</span>' : ""}`; }
      else a.textContent = u.name;
    });
  }
  paint();
  document.addEventListener("oeil:account", paint);
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

// Affichage : daltonisme et contraste élevé. Le réglage vaut pour tout le site, sur cet appareil.
(function () {
  const KEY = "oeil:vision";
  const MODES = [
    ["standard", "Standard", "Les couleurs d'origine."],
    ["contrast", "Contraste élevé", "Textes plus sombres, contours renforcés."],
    ["deutan", "Vert et rouge : deutéranopie", "Écarte les verts et les rouges."],
    ["protan", "Rouge et vert : protanopie", "Écarte les rouges et les verts."],
    ["tritan", "Bleu et jaune : tritanopie", "Écarte les bleus et les jaunes."],
  ];
  const MATRIX = {"protan": "1.000 0.000 0.000 0 0 0.479 0.477 0.044 0 0 0.597 -0.689 1.091 0 0 0 0 0 1 0", "deutan": "1.000 0.000 0.000 0 0 0.163 0.725 0.112 0 0 0.455 -0.645 1.191 0 0 0 0 0 1 0", "tritan": "0.741 -0.407 0.666 0 0 0.075 0.585 0.340 0 0 0.000 0.000 1.000 0 0 0 0 0 1 0"};
  document.body.insertAdjacentHTML("beforeend", `<svg aria-hidden="true" style="position:absolute;width:0;height:0">${Object.entries(MATRIX).map(([k, m]) => `<filter color-interpolation-filters="sRGB" id="vision-${k}"><feColorMatrix type="matrix" values="${m}"/></filter>`).join("")}</svg>`);
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || "standard"; } catch (e) { return "standard"; } };
  const apply = (m) => { if (m === "standard") document.documentElement.removeAttribute("data-vision"); else document.documentElement.dataset.vision = m; };
  apply(read());
  let dlg = null;
  function open() {
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.className = "vision-dlg";
      dlg.setAttribute("aria-labelledby", "vision-title");
      dlg.innerHTML = `<h2 id="vision-title">Affichage</h2><p>Les couleurs des jeux s'adaptent à ta vision. Le score ne change pas.</p><div role="radiogroup" aria-labelledby="vision-title">${MODES.map(([v, t, d]) => `<label><input name="vision" type="radio" value="${v}"/><span><b>${t}</b><small>${d}</small></span></label>`).join("")}</div><button class="btn w-full" type="button">Fermer</button>`;
      document.body.append(dlg);
      dlg.querySelector("button").addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
      dlg.querySelectorAll("input").forEach((r) => r.addEventListener("change", () => { try { localStorage.setItem(KEY, JSON.stringify(r.value)); } catch (e) {} apply(r.value); }));
    }
    dlg.querySelectorAll("input").forEach((r) => (r.checked = r.value === read()));
    dlg.showModal();
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-vision-open]")) open(); });
})();
