// Color Recall — mémorise une nuance, puis recompose-la avec un sélecteur teinte / saturation / valeur.
(function () {
  const C = Oeil.color;
  const MEMO = 3;
  const PALETTE = [
    { name: "Bleu d'encre", h: 219, s: 62, l: 40 }, { name: "Vert sauge", h: 140, s: 22, l: 55 },
    { name: "Terracotta", h: 14, s: 58, l: 52 }, { name: "Moutarde", h: 45, s: 78, l: 50 },
    { name: "Prune", h: 300, s: 28, l: 38 }, { name: "Lagon", h: 185, s: 60, l: 42 },
    { name: "Corail", h: 5, s: 80, l: 65 }, { name: "Lavande", h: 255, s: 45, l: 70 },
    { name: "Olive", h: 70, s: 40, l: 38 }, { name: "Bleu glacier", h: 200, s: 55, l: 75 },
    { name: "Rose fard", h: 340, s: 60, l: 78 }, { name: "Ocre", h: 38, s: 65, l: 45 },
  ];
  const TIPS = [
    "Notre mémoire des couleurs « sature » : on se souvient d'une teinte plus vive qu'elle n'était. Méfie-toi de ton premier réflexe.",
    "Une couleur paraît plus claire sur fond sombre et plus sombre sur fond clair : c'est le contraste simultané.",
    "La teinte se retient mieux que la luminosité. Nomme la couleur pendant l'observation (« vert sauge un peu gris ») pour mieux la retrouver.",
    "À luminosité égale, les jaunes paraissent plus clairs que les bleus : HSL n'est pas une échelle perceptuelle.",
    "Le score dépend aussi de ton écran et de sa luminosité : vise surtout la régularité d'une session à l'autre.",
  ];
  const targets = Oeil.shuffle(PALETTE);

  function hsvToRgb(h, s, v) {
    const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
  }
  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    let h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  const userRgb = (s) => s.urgb || hsvToRgb(s.uh, s.us, s.uv);
  function rgbToHsv([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
    let h = 0;
    if (d) { h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
    return { h, s: max ? d / max : 0, v: max };
  }
  // CMJN simplifié, sans profil colorimétrique : pour raisonner en quadrichromie à l'écran.
  function rgbToCmyk([r, g, b]) {
    const R = r / 255, G = g / 255, B = b / 255, k = 1 - Math.max(R, G, B);
    if (k >= 1) return [0, 0, 0, 100];
    return [(1 - R - k) / (1 - k), (1 - G - k) / (1 - k), (1 - B - k) / (1 - k), k].map((x) => Math.round(x * 100));
  }
  const cmykToRgb = ([c, m, y, k]) => [c, m, y].map((x) => Math.round(255 * (1 - x / 100) * (1 - k / 100)));

  // Panneau de curseurs, façon nuancier InDesign : chaque piste montre ce que donne le curseur.
  const CHANNELS = { rgb: [["R", 255], ["V", 255], ["B", 255]], cmyk: [["C", 100], ["M", 100], ["J", 100], ["N", 100]] };
  const toCss = (mode, v) => { const c = mode === "rgb" ? v : cmykToRgb(v); return `rgb(${c.join(",")})`; };
  function modelValues(s) { return s.mode === "rgb" ? userRgb(s) : s.ucmyk || rgbToCmyk(userRgb(s)); }
  function paintSliders(s) {
    if (s.mode === "hsb") return;
    const vals = modelValues(s);
    s.rows.forEach(({ range, num, max }, i) => {
      range.value = vals[i]; if (document.activeElement !== num) num.value = vals[i];
      const lo = [...vals], hi = [...vals]; lo[i] = 0; hi[i] = max;
      range.style.background = `linear-gradient(90deg, ${toCss(s.mode, lo)}, ${toCss(s.mode, hi)})`;
    });
  }
  function setValue(s, i, v) {
    const vals = [...modelValues(s)]; vals[i] = v;
    if (s.mode === "rgb") { s.urgb = vals; s.ucmyk = null; } else { s.ucmyk = vals; s.urgb = cmykToRgb(vals); }
    const hsv = rgbToHsv(s.urgb);
    s.uh = hsv.h; s.us = hsv.s; s.uv = hsv.v;
    update(s);
  }
  function buildSliders(s) {
    s.rows = [];
    s.sliders.innerHTML = "";
    if (s.mode === "hsb") return;
    CHANNELS[s.mode].forEach(([label, max], i) => {
      const row = document.createElement("label");
      row.className = "cr-ch";
      row.innerHTML = `<span>${label}</span><input aria-label="${label}" max="${max}" min="0" type="range"/><input aria-label="Valeur ${label}" inputmode="numeric" max="${max}" min="0" type="number"/>`;
      const [range, num] = row.querySelectorAll("input");
      const set = (e) => { if (s.phase === "adjust") setValue(s, i, Oeil.clamp(Math.round(+e.target.value || 0), 0, max)); };
      range.addEventListener("input", set); num.addEventListener("input", set);
      s.sliders.append(row);
      s.rows.push({ range, num, max });
    });
  }
  function setMode(s, mode) {
    s.mode = mode;
    try { localStorage.setItem("oeil:cr-mode", mode); } catch (e) {}
    s.tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    s.hsbBox.hidden = mode !== "hsb"; s.sliders.hidden = mode === "hsb";
    buildSliders(s); paintSliders(s);
  }

  function paintSL(canvas, hue) {
    const ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height;
    const gx = ctx.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, "#fff"); gx.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = gx; ctx.fillRect(0, 0, w, h);
    const gy = ctx.createLinearGradient(0, 0, 0, h);
    gy.addColorStop(0, "rgba(0,0,0,0)"); gy.addColorStop(1, "#000");
    ctx.fillStyle = gy; ctx.fillRect(0, 0, w, h);
  }

  function update(s) {
    const rgb = userRgb(s);
    if (s.phase === "adjust") s.swatch.style.background = C.hex(rgb);
    paintSL(s.sl, s.uh);
    s.slHandle.style.left = `${s.us * 100}%`; s.slHandle.style.top = `${(1 - s.uv) * 100}%`;
    s.hueHandle.style.left = `${(s.uh / 360) * 100}%`;
    paintSliders(s);
  }

  function startAdjust(s, api) {
    s.phase = "adjust";
    s.swatch.innerHTML = `<span class="cr-label">Ta couleur</span>`;
    s.picker.classList.remove("is-locked");
    api.setSubmit(true);
    api.setBrief("Recompose la couleur de mémoire, puis valide.");
    update(s);
  }

  function memorize(s, api, seconds) {
    s.phase = "memo";
    api.setSubmit(false);
    s.picker.classList.add("is-locked");
    s.swatch.style.background = C.hsl(s.t);
    let left = seconds;
    s.swatch.innerHTML = `<span class="cr-label">Mémorise</span><span class="cr-count">${left}</span>`;
    clearInterval(s.timer);
    s.timer = setInterval(() => {
      left -= 1;
      if (left <= 0) { clearInterval(s.timer); startAdjust(s, api); }
      else s.swatch.querySelector(".cr-count").textContent = left;
    }, 1000);
  }

  Oeil.play({
    id: "color-recall", name: "Color Recall",
    howto: [
      { icon: "visibility", text: "Une couleur s'affiche trois secondes. Observe-la et nomme-la dans ta tête." },
      { icon: "colorize", text: "Elle disparaît : recompose-la en glissant le point dans le carré (saturation et clarté) et sur la barre (teinte)." },
      { icon: "check", text: "Valide avec Entrée : la cible réapparaît à côté de ta couleur, avec l'écart mesuré." },
    ],
    brief: (s) => (s.phase === "memo" ? "Mémorise cette couleur." : "Recompose la couleur de mémoire."),
    hint: { label: "Revoir 2 s", run(s, api) { if (s.phase !== "adjust" || s.peeked) return; s.peeked = true; const prev = s.swatch.style.background; s.swatch.style.background = C.hsl(s.t); setTimeout(() => { if (s.phase === "adjust") s.swatch.style.background = prev; }, 2000); } },

    setup(round) {
      return { t: targets[round % targets.length], uh: Oeil.randi(0, 359), us: 0.5, uv: 0.7, phase: "memo", tip: TIPS[round % TIPS.length] };
    },

    mount(board, s, api) {
      const wrap = api.h("div", "cr-wrap");
      s.swatch = api.h("div", "cr-swatch");
      s.picker = api.h("div", "cr-picker");
      s.sl = api.h("canvas", "cr-sl grab"); s.sl.width = 280; s.sl.height = 220;
      const slBox = api.h("div", "cr-sl-box"); slBox.append(s.sl);
      s.slHandle = api.h("span", "handle"); slBox.append(s.slHandle);
      const hueBox = api.h("div", "cr-hue grab"); s.hueHandle = api.h("span", "handle"); hueBox.append(s.hueHandle);
      s.hsbBox = api.h("div", "cr-hsb"); s.hsbBox.append(slBox, hueBox);
      s.sliders = api.h("div", "cr-sliders");
      s.tabs = api.h("div", "seg-line cr-tabs", [["hsb", "Sélecteur"], ["rgb", "RVB"], ["cmyk", "CMJN"]].map(([m, t]) => `<button aria-pressed="false" data-mode="${m}" type="button">${t}</button>`).join(""));
      s.picker.append(s.tabs, s.hsbBox, s.sliders);
      wrap.append(s.swatch, s.picker);
      board.append(wrap);
      s.tabs.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => setMode(s, b.dataset.mode)));
      let saved = "hsb"; try { saved = localStorage.getItem("oeil:cr-mode") || "hsb"; } catch (e) {}
      setMode(s, saved);

      const fromEvent = (el, ev) => { const r = el.getBoundingClientRect(); return [api.clamp((ev.clientX - r.left) / r.width, 0, 1), api.clamp((ev.clientY - r.top) / r.height, 0, 1)]; };
      api.drag(s.sl, {
        start: (e) => { if (s.phase !== "adjust") return; const [x, y] = fromEvent(s.sl, e); s.urgb = s.ucmyk = null; s.us = x; s.uv = 1 - y; update(s); },
        move: (dx, dy, ev) => { if (s.phase !== "adjust") return; const [x, y] = fromEvent(s.sl, ev); s.urgb = s.ucmyk = null; s.us = x; s.uv = 1 - y; update(s); },
      });
      api.drag(hueBox, {
        start: (e) => { if (s.phase !== "adjust") return; s.urgb = s.ucmyk = null; s.uh = Math.round(fromEvent(hueBox, e)[0] * 359); update(s); },
        move: (dx, dy, ev) => { if (s.phase !== "adjust") return; s.urgb = s.ucmyk = null; s.uh = Math.round(fromEvent(hueBox, ev)[0] * 359); update(s); },
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse dans le carré et sur la barre</span><span class="ctl-hint"><span class="material-symbols-outlined">keyboard</span>Flèches : clarté et saturation</span>`;
      update(s);
      memorize(s, api, MEMO);
    },

    keys(e, s) {
      if (s.phase !== "adjust" || s.mode !== "hsb" || e.target.closest("input")) return;
      s.urgb = s.ucmyk = null;
      const st = e.shiftKey ? 0.05 : 0.01;
      const map = { ArrowLeft: ["us", -st], ArrowRight: ["us", st], ArrowUp: ["uv", st], ArrowDown: ["uv", -st] };
      if (!map[e.key]) return;
      e.preventDefault();
      const [k, d] = map[e.key];
      s[k] = Oeil.clamp(s[k] + d, 0, 1);
      update(s);
    },

    evaluate(s) {
      clearInterval(s.timer);
      const tr = C.hslToRgb(s.t.h, s.t.s, s.t.l), ur = userRgb(s);
      const dE = C.deltaE(C.lab(tr), C.lab(ur));
      const u = rgbToHsl(ur);
      const dh = ((u.h - s.t.h + 540) % 360) - 180, ds = u.s - s.t.s, dl = u.l - s.t.l;
      s.res = { tr, ur };
      return {
        score: Math.max(0, 100 - dE * 2.2),
        metrics: [
          { label: "Écart perçu (ΔE)", value: dE.toFixed(1), good: dE < 5 },
          { label: "Teinte", value: Math.abs(dh) <= 4 ? "juste" : `${dh > 0 ? "+" : ""}${dh}°`, good: Math.abs(dh) <= 4 },
          { label: "Saturation", value: Math.abs(ds) <= 4 ? "juste" : ds > 0 ? `trop vive (+${ds})` : `trop terne (${ds})`, good: Math.abs(ds) <= 4 },
          { label: "Clarté", value: Math.abs(dl) <= 4 ? "juste" : dl > 0 ? `trop claire (+${dl})` : `trop sombre (${dl})`, good: Math.abs(dl) <= 4 },
          ...(s.mode === "rgb" ? [{ label: "Cible en RVB", value: tr.join(" · ") }] : s.mode === "cmyk" ? [{ label: "Cible en CMJN", value: rgbToCmyk(tr).join(" · ") }] : []),
        ],
        principle: s.tip,
      };
    },

    reveal(board, s) {
      s.phase = "done";
      s.picker.classList.add("is-locked");
      s.swatch.classList.add("is-split");
      s.swatch.style.background = `linear-gradient(90deg, ${C.hex(s.res.ur)} 50%, ${C.hsl(s.t)} 50%)`;
      s.swatch.innerHTML = `<span class="cr-label">Toi · ${C.hex(s.res.ur)}</span><span class="cr-label cr-label-r">${s.t.name} · ${C.hex(s.res.tr)}</span>`;
    },
  });
})();
