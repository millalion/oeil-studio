// Color Impostor — une case diffère à peine des autres. De plus en plus fin, de plus en plus serré.
(function () {
  const C = Oeil.color;
  const LEVELS = [{ g: 4, dE: 10 }, { g: 5, dE: 8 }, { g: 5, dE: 6.5 }, { g: 6, dE: 5.5 }, { g: 6, dE: 4.5 }];
  const TIME = 15;

  // Cherche une variante de la couleur à l'écart perçu voulu, en bougeant clarté, saturation ou teinte.
  function variant(base, dE) {
    const lab0 = C.lab(C.hslToRgb(base.h, base.s, base.l));
    const axis = Oeil.pick(["l", "s", "h"]), sign = Math.random() < 0.5 ? -1 : 1;
    let lo = 0, hi = axis === "h" ? 40 : 30, best = base;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2, c = { ...base };
      c[axis] = axis === "h" ? (base.h + sign * mid + 360) % 360 : Oeil.clamp(base[axis] + sign * mid, 4, 96);
      const d = C.deltaE(lab0, C.lab(C.hslToRgb(c.h, c.s, c.l)));
      best = c;
      if (d < dE) lo = mid; else hi = mid;
    }
    return { c: best, axis };
  }

  Oeil.play({
    id: "color-impostor", name: "Color Impostor",
    howto: [
      { icon: "grid_view", text: "Une seule case est d'une couleur légèrement différente." },
      { icon: "touch_app", text: "Clique dessus. Un seul essai par manche : ta réponse est validée tout de suite." },
      { icon: "timer", text: "Tu as 15 secondes. Trouver la bonne case rapporte 55 points, la rapidité jusqu'à 45 de plus." },
    ],
    brief: (s) => `Trouve la case différente (grille ${s.g} × ${s.g}).`,
    setup(round) {
      const L = LEVELS[round % LEVELS.length];
      const base = { h: Oeil.randi(0, 359), s: Oeil.randi(30, 75), l: Oeil.randi(35, 70) };
      const v = variant(base, L.dE);
      return { g: L.g, dE: L.dE, base, odd: v.c, axis: v.axis, at: Oeil.randi(0, L.g * L.g - 1), picked: null, t0: 0 };
    },
    mount(board, s, api) {
      api.setSubmit(false);
      const grid = api.h("div", "ci-grid");
      grid.style.gridTemplateColumns = `repeat(${s.g}, 1fr)`;
      for (let i = 0; i < s.g * s.g; i++) {
        const b = api.h("button", "ci-cell pickable");
        b.type = "button";
        b.setAttribute("aria-label", `Case ${i + 1}`);
        b.style.background = C.hsl(i === s.at ? s.odd : s.base);
        b.addEventListener("click", () => { if (api.phase !== "play") return; s.picked = i; b.classList.add("is-picked"); api.setSubmit(true); api.submit(); });
        grid.append(b);
      }
      board.append(grid);
      s.grid = grid;
      s.t0 = performance.now();
      api.controls.innerHTML = `<span class="ci-timer" aria-live="off"><span class="ci-timer-bar"></span><b>${TIME} s</b></span>`;
      const bar = api.controls.querySelector(".ci-timer-bar"), label = api.controls.querySelector(".ci-timer b");
      clearInterval(s.iv);
      s.iv = setInterval(() => {
        const left = Math.max(0, TIME - (performance.now() - s.t0) / 1000);
        bar.style.transform = `scaleX(${left / TIME})`;
        label.textContent = `${Math.ceil(left)} s`;
        if (left <= 0) { clearInterval(s.iv); if (api.phase === "play") { api.setSubmit(true); api.submit(); } }
      }, 100);
    },
    evaluate(s) {
      clearInterval(s.iv);
      const t = Math.min(TIME, (performance.now() - s.t0) / 1000);
      const ok = s.picked === s.at;
      const axisLabel = { l: "la clarté", s: "la saturation", h: "la teinte" }[s.axis];
      return {
        score: ok ? 55 + 45 * (1 - t / TIME) : 0,
        verdict: ok ? undefined : s.picked == null ? "Temps écoulé" : "Mauvaise case",
        metrics: [
          { label: "Bonne case", value: ok ? "+55 pts" : "0 pt", good: ok },
          { label: `Rapidité (${t.toFixed(1).replace(".", ",")} s sur ${TIME})`, value: ok ? `+${Math.round(45 * (1 - t / TIME))} pts` : "–" },
          { label: "Ce qui changeait", value: `${axisLabel} (ΔE ${s.dE.toFixed(1).replace(".", ",")})` },
        ],
        principle: "Balaye la grille par blocs plutôt que case par case : l'œil repère mieux une rupture dans une zone qu'une différence entre deux cases isolées. Sous ΔE 2,3, l'écart devient presque imperceptible.",
      };
    },
    reveal(board, s) {
      const cells = s.grid.children;
      cells[s.at].classList.add("ci-answer");
      if (s.picked != null && s.picked !== s.at) cells[s.picked].classList.add("ci-wrong");
      [...cells].forEach((c) => (c.disabled = true));
    },
  });
})();
