// Contrast Rescue — trouve à l'œil la couleur de texte la plus proche du fond qui passe encore les WCAG.
(function () {
  const C = Oeil.color;
  const CASES = Oeil.shuffle([
    { bg: { h: 222, s: 70, l: 52 }, label: "Réserver ma place", large: false, ui: "button" },
    { bg: { h: 14, s: 75, l: 58 }, label: "Promo de printemps", large: true, ui: "banner" },
    { bg: { h: 160, s: 45, l: 42 }, label: "Paiement accepté", large: false, ui: "toast" },
    { bg: { h: 280, s: 35, l: 62 }, label: "Nouvelle collection", large: true, ui: "banner" },
    { bg: { h: 45, s: 90, l: 55 }, label: "Continuer", large: false, ui: "button" },
    { bg: { h: 200, s: 25, l: 88 }, label: "3 commentaires non lus", large: false, ui: "toast" },
  ]);

  // Clarté de texte limite (même teinte que le fond, saturation basse) pour atteindre le ratio demandé.
  function threshold(bg, dir, ratio) {
    const bgRgb = C.hslToRgb(bg.h, bg.s, bg.l);
    const text = (l) => C.hslToRgb(bg.h, 18, l);
    let lo = dir > 0 ? bg.l : 0, hi = dir > 0 ? 100 : bg.l;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2, ok = C.contrast(text(mid), bgRgb) >= ratio;
      if (dir > 0) { if (ok) hi = mid; else lo = mid; } else { if (ok) lo = mid; else hi = mid; }
    }
    return dir > 0 ? hi : lo;
  }

  function apply(s) {
    s.sample.style.color = C.hsl({ h: s.bg.h, s: 18, l: s.l });
    s.handle.style.top = `${100 - s.l}%`;
  }

  Oeil.play({
    id: "contrast-rescue", name: "Contrast Rescue",
    howto: [
      { icon: "height", text: "Glisse la poignée sur la barre de clarté pour changer la couleur du texte." },
      { icon: "contrast", text: "Trouve la limite : le texte le plus proche du fond qui reste lisible selon les WCAG (4,5:1 pour un texte courant, 3:1 pour un grand texte)." },
      { icon: "keyboard", text: "↑ ↓ pour affiner, Entrée pour valider. Le ratio exact n'apparaît qu'à la correction." },
    ],
    brief: (s) => `Rends ce texte juste assez lisible : ${s.large ? "grand texte, 3:1" : "texte courant, 4,5:1"}.`,
    setup(round) {
      const c = CASES[round % CASES.length];
      const ratio = c.large ? 3 : 4.5;
      const bgRgb = C.hslToRgb(c.bg.h, c.bg.s, c.bg.l);
      const canUp = C.contrast(C.hslToRgb(c.bg.h, 18, 100), bgRgb) >= ratio;
      const canDown = C.contrast(C.hslToRgb(c.bg.h, 18, 0), bgRgb) >= ratio;
      const dir = canUp && (!canDown || c.bg.l < 60) ? 1 : -1;
      const limit = threshold(c.bg, dir, ratio);
      return { ...c, ratio, dir, limit, l: Oeil.clamp(c.bg.l + dir * Oeil.randi(4, 10), 0, 100) };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "cx-wrap");
      const ui = api.h("div", `cx-ui cx-${s.ui}`);
      ui.style.background = C.hsl(s.bg);
      s.sample = api.h("span", s.large ? "cx-large" : "cx-normal", s.label);
      ui.append(s.sample);
      const strip = api.h("div", "cx-strip grab");
      strip.style.background = `linear-gradient(to bottom, ${C.hsl({ h: s.bg.h, s: 18, l: 100 })}, ${C.hsl({ h: s.bg.h, s: 18, l: 50 })}, ${C.hsl({ h: s.bg.h, s: 18, l: 0 })})`;
      s.handle = api.h("span", "handle");
      s.handle.style.left = "50%";
      s.handle.tabIndex = 0; s.handle.setAttribute("role", "slider"); s.handle.setAttribute("aria-label", "Clarté du texte");
      strip.append(s.handle);
      wrap.append(ui, strip);
      board.append(wrap);
      const fromStrip = (ev) => { const r = strip.getBoundingClientRect(); return 100 - api.clamp((ev.clientY - r.top) / r.height, 0, 1) * 100; };
      api.drag(strip, { start: (e) => { s.l = fromStrip(e); apply(s); }, move: (dx, dy, ev) => { s.l = fromStrip(ev); apply(s); } });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">height</span>Glisse sur la barre de clarté</span><span class="ctl-hint">${s.large ? "Grand texte : 24 px et plus" : "Texte courant : 16 px"}</span>`;
      apply(s);
    },
    keys(e, s) {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      s.l = Oeil.clamp(s.l + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 5 : 0.5), 0, 100);
      apply(s);
    },
    evaluate(s) {
      const bgRgb = C.hslToRgb(s.bg.h, s.bg.s, s.bg.l);
      const ratio = C.contrast(C.hslToRgb(s.bg.h, 18, s.l), bgRgb);
      const pass = ratio >= s.ratio - 0.005;
      const beyond = Math.abs(s.l - s.limit);
      const fmt = (x) => x.toFixed(2).replace(".", ",");
      return {
        score: pass ? Math.max(40, 100 - Math.max(0, beyond - 1.5) * 4) : Math.max(0, 50 - (s.ratio - ratio) * 40),
        verdict: pass ? undefined : "Pas assez lisible",
        metrics: [
          { label: "Ton contraste", value: `${fmt(ratio)}:1`, good: pass },
          { label: "Exigé", value: `${fmt(s.ratio)}:1` },
          { label: "Distance à la limite", value: `${beyond.toFixed(1).replace(".", ",")} pts de clarté`, good: beyond <= 3 },
        ],
        principle: `Les WCAG demandent 4,5:1 pour le texte courant et 3:1 pour le grand texte (24 px, ou 18,7 px en gras). ${pass ? "Coller à la limite garde la couleur de marque, mais une marge de sécurité aide sur les écrans mal réglés." : "Sous la limite, le texte devient difficile à lire pour beaucoup de gens, surtout en plein soleil ou avec une vue basse."}`,
      };
    },
    reveal(board, s, r, api) {
      const strip = board.querySelector(".cx-strip");
      strip.classList.remove("grab");
      strip.insertAdjacentHTML("beforeend", `<span class="cx-limit" style="top:${100 - s.limit}%"></span><span class="tag-ref" style="top:calc(${100 - s.limit}% - 11px);left:calc(100% + 10px)">limite</span>`);
      const ghost = s.sample.cloneNode(true);
      ghost.style.color = C.hsl({ h: s.bg.h, s: 18, l: s.limit });
      const ui = s.sample.parentElement.cloneNode(false);
      ui.classList.add("cx-ref");
      ui.append(ghost);
      ui.insertAdjacentHTML("afterbegin", `<span class="cx-caption">À la limite</span>`);
      s.sample.parentElement.insertAdjacentHTML("afterbegin", `<span class="cx-caption">Ta version</span>`);
      s.sample.parentElement.after(ui);
    },
  });
})();
